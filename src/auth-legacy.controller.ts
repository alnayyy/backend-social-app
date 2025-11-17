import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Path ke legacy controller frontend
const { join } = require('path');
const legacy = require(
  join(process.cwd(), '..', 'backend', 'controllers', 'authController')
);

@Controller()
export class AuthWebController {
  
  // ===========================
  // LOGIN
  // ===========================
  @Get(['login', 'login'])
  showLogin(@Req() req, @Res() res) {
    return legacy.showLogin(req, res);
  }

  @Post(['login', 'login'])
  postLogin(@Req() req, @Res() res) {
    return legacy.postLogin(req, res);
  }

  // ===========================
  // REGISTER
  // ===========================
  @Get(['register', 'register'])
  showRegister(@Req() req, @Res() res) {
    return legacy.showRegister(req, res);
  }

  @Post(['register', 'register'])
  postRegister(@Req() req, @Res() res) {
    return legacy.postRegister(req, res);
  }

  // ===========================
  // LOGOUT
  // ===========================
  @Get(['logout', 'logout'])
  logoutGet(@Req() req, @Res() res) {
    return legacy.logout(req, res);
  }

  @Post(['logout', 'logout'])
  logoutPost(@Req() req, @Res() res) {
    return legacy.logout(req, res);
  }

  // ===========================
  // PROFILE (UPLOAD)
  // ===========================
  @Get(['profile', 'profile'])
  showProfile(@Req() req, @Res() res) {
    return legacy.showProfile(req, res);
  }

  @Post(['profile', 'profile'])
  @UseInterceptors(FileInterceptor('avatar'))
  postProfile(@Req() req, @Res() res, @UploadedFile() file) {
    if (file) req.file = file; // samain format Express
    return legacy.postProfile(req, res);
  }
}
