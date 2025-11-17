import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { Post } from '../entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    // 🔹 Mendaftarkan entity Post agar bisa diakses lewat Repository di service
    TypeOrmModule.forFeature([Post, AuthUser]),
  ],
  controllers: [
    // 🔹 Mengatur endpoint /api/posts
    PostsController,
  ],
  providers: [
    // 🔹 Menyediakan logika bisnis untuk operasi CRUD
    PostsService,
  ],
  exports: [
    // 🔹 Agar PostsService bisa digunakan di module lain (misalnya FeedModule)
    PostsService,
    TypeOrmModule,
  ],
})
export class PostsModule {}
