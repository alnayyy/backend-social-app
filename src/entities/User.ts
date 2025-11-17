import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' }) // 👈 PASTIKAN NAMA TABELNYA 'users'
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, default: '' })
  displayName: string;

  @Column({ nullable: true, default: '' })
  profilePhoto: string;
}
