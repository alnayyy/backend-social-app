import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class HomeService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  appInfo() {
    return { name: this.configService.get('app.name', { infer: true }) };
  }

  // ✅ fungsi tambahan
  getWelcomeMessage() {
    return 'Selamat datang di aplikasi Sosial Media Mini!';
  }
}
