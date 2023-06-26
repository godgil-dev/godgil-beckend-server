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
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { PostLikesService } from './post-likes.service';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { ParamPostExistGuard } from '../posts/guards/param-post-exits.guard';

@ApiTags('likes')
@Controller('likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @ApiBearerAuth()
  @Post(':postId')
  @UseGuards(ParamPostExistGuard)
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: Request,
  ) {
    return await this.postLikesService.create(postId, request.user.id);
  }

  @ApiBearerAuth()
  @Delete(':postId')
  @UseGuards(ParamPostExistGuard)
  async remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: Request,
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
    @Req() request: Request,
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
