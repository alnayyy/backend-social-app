import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from '../config/config.type';
import glob from 'glob';
import path from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const entitiesGlobs = [
      __dirname + '/../**/persistence/relational/entities/*.{ts,js}',
      __dirname + '/../**/*.entity{.ts,.js}',
    ];

    // Resolve globs to actual file paths for debugging / clarity
    try {
      const resolved = entitiesGlobs
        .map((g) => glob.sync(g))
        .flat()
        .map((p) => path.resolve(p));
      if (resolved.length > 0) {
        // eslint-disable-next-line no-console
        console.log('[TypeOrm] Resolved entity files:');
        resolved.forEach((f) => console.log('  -', f));
      } else {
        // eslint-disable-next-line no-console
        console.log('[TypeOrm] No entity files matched by configured globs.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[TypeOrm] Failed to resolve entity globs', e);
    }

    return {
      type: 'mysql',
      host: this.configService.get('database.host', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
      password: this.configService.get('database.password', { infer: true }),
      database: this.configService.get('database.name', { infer: true }),
      synchronize: this.configService.get('database.synchronize', {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      // Include relational entity folders and any *.entity files
      entities: entitiesGlobs,
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      extra: {
        connectionLimit: this.configService.get('database.maxConnections', {
          infer: true,
        }),
      },
    } as TypeOrmModuleOptions;
  }
}
