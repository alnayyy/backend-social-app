import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AreaManager } from '../common/areaManager';
import { HomeService } from './home.service';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(private service: HomeService) {}

  @Get(['/', '/home'])
  async getHome(@Req() req: any, @Res() res: Response) {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }
    const message = this.service.getWelcomeMessage();
    const sidebarContent = await AreaManager.renderArea('sidebar');
    const navSidebarContent = await AreaManager.renderArea('nav-sidebar');
    const mainContent = await AreaManager.renderArea('main');

    res.render('home', {
      title: 'Halaman Utama Sosial Media Mini',
      message,
      sidebarContent,
      navSidebarContent,
      mainContent,
      layout: 'layout',
    });
  }
}
