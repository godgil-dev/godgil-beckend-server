import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  HttpCode,
} from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import UserRequest from '../auth/types/user-request.interface';

@ApiTags('likes')
@Controller('likes/:postId')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return await this.postLikesService.create(postId, Number(request.user.id));
  }

  @Delete()
  @ApiBearerAuth()
  @HttpCode(204)
  async remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    await this.postLikesService.remove(postId, Number(request.user.id));
  }
}
