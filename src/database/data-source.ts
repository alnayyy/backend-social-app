// src/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { RoleEntity } from '../roles/infrastructure/persistence/relational/entities/role.entity';
import * as path from 'path';

// NOTE: avoid passing broad glob patterns into DataSource entities here.
// When TypeORM resolves string globs it `require()`s matching files — in
// this codebase some compiled files (dist) import the DataSource which can
// cause circular require/initialization and stack overflows. For the
// application runtime we register explicit entity classes only.

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: true, // aktifkan untuk debugging
  // Register explicit entity classes only to avoid circular requires
  entities: [AuthUser, RoleEntity],
});
