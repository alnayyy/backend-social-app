import { registerAs } from '@nestjs/config';

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString()
  DATABASE_URL: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_TYPE: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_HOST: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsInt()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_PASSWORD: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_NAME: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  const env = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || process.env.DB_URL,
  } as Record<string, string>;

  validateConfig(env, EnvironmentVariablesValidator);

  return {
    isDocumentDatabase: ['mongodb'].includes(env.DATABASE_TYPE ?? ''),
    url: env.DATABASE_URL,
    type: env.DATABASE_TYPE,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT ? parseInt(env.DATABASE_PORT as any, 10) : 5432,
    password: env.DATABASE_PASSWORD,
    name: env.DATABASE_NAME,
    username: env.DATABASE_USERNAME,
    synchronize: env.DATABASE_SYNCHRONIZE === 'true',
    maxConnections: env.DATABASE_MAX_CONNECTIONS
      ? parseInt(env.DATABASE_MAX_CONNECTIONS as any, 10)
      : 100,
    sslEnabled: env.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: env.DATABASE_REJECT_UNAUTHORIZED === 'true',
    ca: env.DATABASE_CA,
    key: env.DATABASE_KEY,
    cert: env.DATABASE_CERT,
  };
});
