import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import UserRequest from '../auth/types/user-request.interface';
import { ParamPostExistGuard } from '../posts/guards/param-post-exits.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';

@ApiTags('likes')
@Controller('likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @ApiBearerAuth()
  @Post(':postId')
  @UseGuards(ParamPostExistGuard)
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return await this.postLikesService.create(postId, request.user.id);
  }

  @ApiBearerAuth()
  @Delete(':postId')
  @UseGuards(ParamPostExistGuard)
  async remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return await this.postLikesService.remove(postId, request.user.id);
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'sortBy', type: String, required: false })
  @Get('/me')
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    sortBy: 'lastest' | 'popular' = 'lastest',
    @Req() request: UserRequest,
  ) {
    const { page, limit } = paginationQueryDto;
    const offset = (page - 1) * limit;

    const { posts, totalCount } = await this.postLikesService.findAllByUserId(
      request.user?.id || -1,
      limit,
      offset,
      sortBy,
    );

    return {
      posts,
      pageInfo: {
        page,
        totalCount,
        currentCount: posts.length,
        totalPage: Math.ceil(totalCount / limit),
      },
    };
  }
}
