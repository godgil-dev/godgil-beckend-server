import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MypageService } from './mypage.service';

@ApiTags('mypage')
@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get()
  @ApiBearerAuth()
  findOne(@Req() request: Request) {
    return this.mypageService.findOne(request.user.id);
  }
}
