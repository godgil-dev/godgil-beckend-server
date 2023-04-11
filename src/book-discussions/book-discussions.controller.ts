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
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import UserRequest from 'src/auth/types/user-request.interface';
import { OwnershipGuard } from 'src/posts/guards/ownership.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { BookDiscussionsService } from './book-discussions.service';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';

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

  // @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @Public()
  @Get()
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Req() request: UserRequest,
  ) {
    const { page, limit } = paginationQueryDto;
    const offset = (page - 1) * limit;

    const { posts, totalCount } = await this.bookDiscussionsService.findAll(
      Number(limit),
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookDiscussionsService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDiscussionDto: UpdateBookDiscussionDto,
  ) {
    return this.bookDiscussionsService.update(id, updateBookDiscussionDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(OwnershipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookDiscussionsService.remove(id);
  }
}
