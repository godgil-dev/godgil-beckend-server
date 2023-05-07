import { Controller, Get, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import UserRequest from '../auth/types/user-request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: UserRequest) {
    console.log(request.user?.id);
    return this.homeService.findAll(request.user?.id || -1);
  }
}
