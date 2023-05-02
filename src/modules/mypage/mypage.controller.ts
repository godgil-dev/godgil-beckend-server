import { Controller, Get, Req } from '@nestjs/common';
import { MypageService } from './mypage.service';
import UserRequest from '../auth/types/user-request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('mypage')
@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get()
  @ApiBearerAuth()
  findOne(@Req() request: UserRequest) {
    return this.mypageService.findOne(request.user.id);
  }
}
