import { NestExpressApplication } from '@nestjs/platform-express';
import { Application as ExpressApplication } from 'express';
import expressLayouts from 'express-ejs-layouts';
import * as fs from 'fs';
import { join } from 'path';
import helpers from './helpers';

export function setupViewEngine(app: NestExpressApplication) {
  const configPath = join(__dirname, '..', '..', 'config', 'theme.json');
  const themeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const activeTheme = themeConfig.theme || 'default';

  console.log(`Tema aktif: ${activeTheme}`);

  app.setBaseViewsDir(
    join(process.cwd(), '..', 'frontend', 'themes', activeTheme, 'views'),
  );
  app.setViewEngine('ejs');
  app.use(expressLayouts); // ✅ gunakan default import
  app.set('layout', 'layout');
  // expose helpers to EJS templates via express app.locals.helpers
  // NestExpressApplication doesn't declare `locals` on its type, so get the
  // underlying Express instance and attach helpers there.
  // usage in EJS: <%= helpers.formatDate(item.createdAt) %>
  const expressApp = app.getHttpAdapter().getInstance() as ExpressApplication;
  expressApp.locals = expressApp.locals || {};
  (expressApp.locals as any).helpers = helpers;
}
