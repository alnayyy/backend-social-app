import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DevAuthController } from './dev-auth.controller';
import { DevDebugController } from './dev-debug.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [DevAuthController, DevDebugController],
})
export class DevAuthModule {}
