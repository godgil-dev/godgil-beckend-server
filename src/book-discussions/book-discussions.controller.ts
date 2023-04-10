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
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import UserRequest from 'src/auth/types/user-request.interface';
import { BookDiscussionsService } from './book-discussions.service';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';

@Controller('book-discussions')
@ApiTags('book-discussions')
export class BookDiscussionsController {
  constructor(
    private readonly bookDiscussionsService: BookDiscussionsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createBookDiscussionDto: CreateBookDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return this.bookDiscussionsService.create(
      createBookDiscussionDto,
      request.user.id,
    );
  }

  // @ApiBearerAuth()
  @Public()
  @Get()
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  async findAll(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Req() request: UserRequest,
  ) {
    const offset = (page - 1) * limit;
    console.log(limit, page);
    const { posts, totalCount } = await this.bookDiscussionsService.findAll(
      limit,
      offset,
    );

    return {
      posts,
      pagesInfo: {
        page,
        totalCount,
        currentCount: posts.length,
        totalPage: Math.ceil(totalCount / limit),
      },
    };
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: UserRequest) {
    return this.bookDiscussionsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDiscussionDto: UpdateBookDiscussionDto,
  ) {
    return this.bookDiscussionsService.update(id, updateBookDiscussionDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookDiscussionsService.remove(id);
  }
}
