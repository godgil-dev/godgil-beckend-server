import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { HomeService } from './home.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.homeService.findAll(request.user?.id || -1);
  }
}
