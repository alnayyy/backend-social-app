import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { setupViewEngine } from './common/viewEngine';

@Controller()
export class AppController {
  app: any; // akan diisi dari main.ts

  @Get('/switch-theme')
  switchTheme(@Res() res: Response) {
    const configPath = join(__dirname, '..', 'config', 'theme.json');
    const themeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const newTheme = themeConfig.theme === 'dark' ? 'default' : 'dark';
    themeConfig.theme = newTheme;

    fs.writeFileSync(configPath, JSON.stringify(themeConfig, null, 2));

    console.log(`🎨 Tema diubah ke: ${newTheme}`);

    if (this.app) setupViewEngine(this.app);

    const referer = res.req.headers.referer as string | undefined;
    return res.redirect(referer || '/');
  }

  private setTheme(res: Response, theme: 'default' | 'dark') {
    const configPath = join(__dirname, '..', 'config', 'theme.json');
    const themeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    themeConfig.theme = theme;
    fs.writeFileSync(configPath, JSON.stringify(themeConfig, null, 2));
    console.log(`🎨 Tema diubah ke: ${theme}`);
    if (this.app) setupViewEngine(this.app);
    const referer = res.req.headers.referer as string | undefined;
    return res.redirect(referer || '/');
  }

  @Get('/theme/light')
  themeLight(@Res() res: Response) {
    return this.setTheme(res, 'default');
  }

  @Get('/theme/dark')
  themeDark(@Res() res: Response) {
    return this.setTheme(res, 'dark');
  }
}
