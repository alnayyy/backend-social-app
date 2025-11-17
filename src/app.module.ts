import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';

// Configs
import appleConfig from './auth-apple/config/apple.config';
import facebookConfig from './auth-facebook/config/facebook.config';
import googleConfig from './auth-google/config/google.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import fileConfig from './files/config/file.config';
import mailConfig from './mail/config/mail.config';

// Controllers
import { AppController } from './app.controller';
import { AuthWebController } from './auth-legacy.controller';

// Modules
import { HomeModule } from './home/home.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import { PostsModule } from './posts/posts.module';
import { ItemsModule } from './items/items.module';
import { DevAuthModule } from './dev-auth/dev-auth.module';

// I18N
import { HeaderResolver, I18nModule } from 'nestjs-i18n';

// Database
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { AllConfigType } from './config/config.type';

// Layout Plugin Manager
import { AreaManager } from './common/areaManager';

// Register plugins to main area
AreaManager.registerToArea('main', 'newPost');
AreaManager.registerToArea('main', 'socialFeed');

// Import plugin files
import './plugins/newPost.plugin';
import './plugins/socialFeed.plugin';

// Auth module
import { AuthModule } from './auth/auth.module';

// Database Root Module
const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    const dataSource = new DataSource({
      ...options,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Matikan auto-sync; gunakan skema DB manual yang sudah dibuat
      logging: true,
    });

    return dataSource.initialize();
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        appleConfig,
      ],
      envFilePath: ['.env'],
    }),

    infrastructureDatabaseModule,

    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => [
            configService.get('app.headerLanguage', { infer: true }),
          ],
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    MailModule,
    MailerModule,
    HomeModule,
    PostsModule,
    ItemsModule,
    DevAuthModule,
    AuthModule,
  ],

  // 👉 AuthWebController DIDAFTARKAN DI SINI
  controllers: [
    AppController,
    AuthWebController,
  ],
})
export class AppModule {}
