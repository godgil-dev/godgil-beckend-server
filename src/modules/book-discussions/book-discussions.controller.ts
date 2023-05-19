import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import UserRequest from 'src/modules/auth/types/user-request.interface';
import { OwnershipGuard } from 'src/modules/posts/guards/ownership.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { BookDiscussionsService } from './book-discussions.service';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { ParamPostExistGuard } from '../posts/guards/param-post-exits.guard';

@ApiTags('book-discussions')
@Controller('book-discussions')
export class BookDiscussionsController {
  constructor(
    private readonly bookDiscussionsService: BookDiscussionsService,
  ) {}

  @ApiBearerAuth()
  @Post()
  async create(
    @Body() createBookDiscussionDto: CreateBookDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return this.bookDiscussionsService.create(
      createBookDiscussionDto,
      request.user.id,
    );
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'sortBy', type: String, required: false })
  @Public()
  @Get()
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Req() request: UserRequest,
    @Query() sortBy: 'lastest' | 'popular' = 'lastest',
  ) {
    const { page, limit } = paginationQueryDto;
    const offset = (page - 1) * limit;

    const { posts, totalCount } = await this.bookDiscussionsService.findAll({
      limit,
      offset,
      userId: request.user?.id || -1,
      sortBy,
    });

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

  @Public()
  @Get(':postId')
  @UseGuards(ParamPostExistGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: UserRequest,
  ) {
    return this.bookDiscussionsService.findOne(postId, request.user?.id || -1);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDiscussionDto: UpdateBookDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return await this.bookDiscussionsService.update(
      id,
      request.user.id,
      updateBookDiscussionDto,
    );
  }

  @HttpCode(204)
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(OwnershipGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bookDiscussionsService.remove(id);
  }
}
