import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuthUser } from '../auth/auth-user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ name: 'likesCount', default: 0 })
  likes: number;

  @Column({ name: 'repostsCount', default: 0 })
  reposts: number;

  @Column({ name: 'commentsCount', default: 0 })
  comments: number;

  @ManyToOne(() => AuthUser, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: AuthUser;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'quoteOfId' })
  quoteOf?: Post | null;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt: Date;
}
