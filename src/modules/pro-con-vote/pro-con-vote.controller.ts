import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ProConVoteService } from './pro-con-vote.service';
import { CreateProConVoteDto } from './dto/create-pro-con-vote.dto';
import { UpdateProConVoteDto } from './dto/update-pro-con-vote.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import UserRequest from 'src/modules/auth/types/user-request.interface';

@ApiTags('pro-con-vote')
@Controller('pro-con-vote/:postId')
export class ProConVoteController {
  constructor(private readonly proConVoteService: ProConVoteService) {}

  @ApiBearerAuth()
  @Post()
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createProConVoteDto: CreateProConVoteDto,
    @Req() request: UserRequest,
  ) {
    return this.proConVoteService.create(
      createProConVoteDto,
      request.user.id,
      postId,
    );
  }

  @ApiBearerAuth()
  @Patch()
  update(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updateProConVoteDto: UpdateProConVoteDto,
    @Req() request: UserRequest,
  ) {
    return this.proConVoteService.update(
      updateProConVoteDto,
      request.user.id,
      postId,
    );
  }

  //Todo: 임시 주석처리
  // @Delete()
  // remove(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.proConVoteService.remove(postId);
  // }
}
