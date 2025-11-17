import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {}

  @Get()
  async findAll(@Req() req: any) {
    const posts = await this.postsService.findAll();

    // Debugging/logging: record what we are about to return so we can detect
    // any unexpected wrapping that may happen further down the pipeline.
    try {
      console.log(
        'GET /posts — accept:',
        req?.headers?.accept,
        ' | returning:',
        Array.isArray(posts) ? `${posts.length} items` : typeof posts,
      );
    } catch {
      // ignore logging errors
    }

    return posts;
  }

  @Post()
  async create(@Body() dto: CreatePostDto, @Req() req: any, @Res({ passthrough: true }) res: any) {
    // Debug: log headers/body and resolved username to help diagnose failures
    try {
      console.log('POST /posts incoming. headers=', JSON.stringify(req.headers || {}));
      // limit body logging length
      try {
        const bodyPreview = JSON.stringify(req.body || {});
        console.log('POST /posts body=', bodyPreview.length > 1000 ? bodyPreview.slice(0, 1000) + '... (truncated)' : bodyPreview);
      } catch {}
    } catch {}

    // Echo a short body preview in a response header to make it easy to see
    // what the server actually parsed when debugging from the browser Network tab.
    try {
      const bp = JSON.stringify(req.body || {});
      res?.setHeader?.('x-debug-body', bp.length > 500 ? bp.slice(0, 500) + '...': bp);
    } catch {}

    const sessionUsername = await this.getUsernameFromRequest(req);
    console.log('POST /posts resolved username=', sessionUsername);
    if (!sessionUsername) {
      throw new UnauthorizedException('Silakan login terlebih dahulu untuk membuat posting');
    }
    return this.postsService.create(dto, sessionUsername);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: any, @Req() req: any) {
    const sessionUsername = await this.getUsernameFromRequest(req);
    if (!sessionUsername) {
      throw new UnauthorizedException('Silakan login terlebih dahulu');
    }
    return this.postsService.update(id, dto, sessionUsername);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: any) {
    const sessionUsername = await this.getUsernameFromRequest(req);
    if (!sessionUsername) {
      throw new UnauthorizedException('Silakan login terlebih dahulu');
    }
    return this.postsService.delete(id, sessionUsername);
  }

  /**
   * Try to derive a username from multiple sources so callers can operate
   * without cookies/sessions in development. Order:
   * 1) `req.session.user` (existing behavior)
   * 2) `Authorization: Bearer <username>` header
   * 3) `x-username` or `x-user` header
   *
   * WARNING: header-based auth is insecure and intended only as a fallback for
   * development or tests when cookies are not used. Do not use in production.
   */
  private async getUsernameFromRequest(req: any): Promise<string | undefined> {
    try {
      const fromSession = req?.session?.user;
      if (fromSession) return fromSession;

      const authHeader = req?.headers?.authorization;
      if (authHeader && typeof authHeader === 'string') {
        const low = authHeader.toLowerCase();
        if (low.startsWith('bearer ')) {
          const token = authHeader.slice(7).trim();

          // If the bearer value looks like a JWT (three segments), try to verify
          // and derive the user id -> username from DB.
          try {
            if (token.split('.').length === 3) {
              const payload: any = this.jwtService.verify(token);
              const userId = payload?.id;
              if (userId) {
                // find user by id and return username if present
                const user = await this.authUserRepository.findOne({ where: { id: userId } });
                if (user && user.username) return user.username;
              }
            }
          } catch (e) {
            // verification failed; continue to fallback handling below
          }

          // Fallback: Return the raw bearer value as username (legacy behavior)
          return token;
        }
      }

      const headerUsername = req?.headers?.['x-username'] || req?.headers?.['x-user'];
      if (headerUsername && typeof headerUsername === 'string') return headerUsername;

      // Fallback: allow username in JSON body for development convenience
      const bodyUsername = req?.body?.username || req?.body?.user || req?.body?.handle;
      if (bodyUsername && typeof bodyUsername === 'string') return bodyUsername;
    } catch (e) {
      // ignore and return undefined
    }
    return undefined;
  }
}
