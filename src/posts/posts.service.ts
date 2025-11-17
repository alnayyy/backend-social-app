import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {}

  async findAll(limit = 100): Promise<any[]> {
    const rows = await this.postRepository.query(
      `SELECT p.id, p.content, p.image, p.createdAt,
              u.username AS user_username, u.displayName AS user_displayName,
              (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likes,
              (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS comments,
              (SELECT COUNT(*) FROM reposts r WHERE r.postId = p.id) AS reposts
         FROM posts p
         JOIN users u ON u.id = p.userId
        ORDER BY p.createdAt DESC
        LIMIT ?`,
      [limit],
    );
    return rows.map((r: any) => ({
      id: r.id,
      content: r.content,
      image: r.image,
      likes: Number(r.likes) || 0,
      reposts: Number(r.reposts) || 0,
      comments: Number(r.comments) || 0,
      createdAt: r.createdAt,
      name: r.user_displayName || r.user_username || 'Anonim',
      username: r.user_username ? `@${r.user_username}` : '',
    }));
  }

  /**
   * Create a post. If sessionUsername is provided we will derive name and username
   * from the users table (trusted server-side source) instead of relying on client data.
   */
  async create(dto: CreatePostDto, sessionUsername?: string): Promise<any> {
    // Validate input: database enforces a check that either content or image
    // must be present. Reject early with a helpful 400 instead of letting
    // the DB raise a constraint error.
    const hasContent = typeof dto?.content === 'string' && dto.content.trim().length > 0;
    const hasImage = dto?.image != null && String(dto.image).trim().length > 0;
    if (!hasContent && !hasImage) {
      // Log server-side so the developer can inspect terminal output quickly
      try {
        const contentPreview = typeof dto?.content === 'string' ? dto.content.slice(0, 250) : null;
        console.log('POST /posts validation failed:', { hasContent, hasImage, contentPreview, dto });
      } catch (e) {}
      // Provide additional debug info in the error so the client can inspect
      // what the server saw when parsing the incoming body.
      const contentPreview = typeof dto?.content === 'string' ? dto.content.slice(0, 250) : null;
      throw new BadRequestException({
        message: 'Silakan isi `content` atau `image` sebelum membuat posting',
        details: { hasContent, hasImage, content: contentPreview },
      });
    }

    let user: AuthUser | null = null;
    if (sessionUsername) {
      user = await this.authUserRepository.findOne({
        where: { username: sessionUsername },
      });
    }

    // DB requires posts.userId NOT NULL — enforce authentication server-side
    if (!user) {
      throw new UnauthorizedException('Tidak dapat membuat posting: pengguna belum terautentikasi');
    }

    const newPost = this.postRepository.create({ user: user, content: dto.content, image: dto.image });

    const saved = await this.postRepository.save(newPost);
    const vm = await this.postRepository.query(
      `SELECT p.id, p.content, p.image, p.createdAt,
              u.username AS user_username, u.displayName AS user_displayName,
              (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likes,
              (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS comments,
              (SELECT COUNT(*) FROM reposts r WHERE r.postId = p.id) AS reposts
         FROM posts p
         JOIN users u ON u.id = p.userId
        WHERE p.id = ?
        LIMIT 1`,
      [saved.id],
    );
    const r = vm[0];
    return {
      id: r.id,
      content: r.content,
      image: r.image,
      likes: Number(r.likes) || 0,
      reposts: Number(r.reposts) || 0,
      comments: Number(r.comments) || 0,
      createdAt: r.createdAt,
      name: r.user_displayName || r.user_username || 'Anonim',
      username: r.user_username ? `@${r.user_username}` : '',
    };
  }

  /**
   * 🔹 Update posting — hanya boleh dilakukan oleh pembuatnya
   */
  async update(
    id: number,
    dto: Partial<Post>,
    sessionUsername?: string,
  ): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id }, relations: { user: true } });
    if (!post) {
      throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
    }

    // Authorization: verify the requester (by session username) is the post owner
    if (sessionUsername) {
      if (sessionUsername !== post.user?.username) {
        throw new ForbiddenException('❌ Kamu tidak diizinkan mengedit postingan ini');
      }
    }

    await this.postRepository.update(id, { content: dto.content });

    // ✅ Pastikan return tidak null
    const updatedPost = await this.postRepository.findOne({ where: { id }, relations: { user: true } });
    if (!updatedPost) {
      throw new NotFoundException(
        `Post dengan ID ${id} tidak ditemukan setelah update`,
      );
    }

    const vm = await this.postRepository.query(
      `SELECT p.id, p.content, p.image, p.createdAt,
              u.username AS user_username, u.displayName AS user_displayName,
              (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likes,
              (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS comments,
              (SELECT COUNT(*) FROM reposts r WHERE r.postId = p.id) AS reposts
         FROM posts p
         JOIN users u ON u.id = p.userId
        WHERE p.id = ?
        LIMIT 1`,
      [id],
    );
    const r = vm[0];
    return {
      id: r.id,
      content: r.content,
      image: r.image,
      likes: Number(r.likes) || 0,
      reposts: Number(r.reposts) || 0,
      comments: Number(r.comments) || 0,
      createdAt: r.createdAt,
      name: r.user_displayName || r.user_username || 'Anonim',
      username: r.user_username ? `@${r.user_username}` : '',
    };
  }

  /**
   * 🔹 Hapus posting — hanya boleh dilakukan oleh pembuatnya
   */
  async delete(id: number, sessionUsername?: string): Promise<boolean> {
    const post = await this.postRepository.findOne({ where: { id }, relations: { user: true } });
    if (!post) {
      throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
    }
    // Validate requester matches the post owner using session username
    if (sessionUsername) {
      if (sessionUsername !== post.user?.username) {
        throw new ForbiddenException('❌ Kamu tidak diizinkan menghapus postingan ini');
      }
    }

    const result = await this.postRepository.delete(id);

    // ✅ Hindari error "possibly null"
    return (result.affected ?? 0) > 0;
  }
}
