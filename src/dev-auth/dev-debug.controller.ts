import { Body, Controller, Get, Post, Req } from '@nestjs/common';

/**
 * Unprotected debug endpoints to inspect incoming headers/body when testing.
 * Use only in development.
 */
@Controller({ path: 'dev', version: '1' })
export class DevDebugController {
  @Get('headers')
  headers(@Req() req: any) {
    return {
      headers: req.headers,
    };
  }

  @Post('echo')
  echo(@Req() req: any, @Body() body: any) {
    return {
      headers: req.headers,
      body,
    };
  }
}
