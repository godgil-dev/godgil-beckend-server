import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import UserRequest from '../auth/types/user-request.interface';
import { ParamPostExistGuard } from '../posts/guards/param-post-exits.guard';

@ApiTags('likes')
@Controller('likes/:postId')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(ParamPostExistGuard)
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return await this.postLikesService.create(postId, request.user.id);
  }

  @ApiBearerAuth()
  @Delete()
  @UseGuards(ParamPostExistGuard)
  async remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return await this.postLikesService.remove(postId, request.user.id);
  }
}
