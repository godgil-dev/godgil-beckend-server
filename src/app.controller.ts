import { AuthService } from './auth/auth.service';
import { Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}
  constructor(private authService: AuthService) {}

  @Public()
  @Get('/')
  async home(@Request() req) {
    return 'hellow';
  }
}
