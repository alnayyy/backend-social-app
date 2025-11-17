import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Development-only authentication endpoint.
 * POST /dev/login { "id": 1 }
 * Returns a signed JWT using the project's auth.secret config.
 */
@Controller({ path: 'dev', version: '1' })
export class DevAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { id?: number }) {
    const userId = body?.id ?? 1;

    const secret = this.configService.getOrThrow('auth.secret', {
      infer: true,
    });

    const token = await this.jwtService.signAsync(
      { id: userId },
      { secret, expiresIn: '1h' },
    );

    return {
      token,
      expiresIn: 3600,
    };
  }
}
