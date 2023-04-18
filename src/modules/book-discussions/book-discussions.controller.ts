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
import { Public } from 'src/modules/auth/decorators/public.decorator';
import UserRequest from 'src/modules/auth/types/user-request.interface';
import { OwnershipGuard } from 'src/modules/posts/guards/ownership.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { BookDiscussionsService } from './book-discussions.service';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('book-discussions')
@Controller('book-discussions')
export class BookDiscussionsController {
  constructor(
    private readonly bookDiscussionsService: BookDiscussionsService,
    private readonly authService: AuthService,
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
  @Public()
  @Get()
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Req() request: UserRequest,
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.authService.getUserFromToken(token);

    console.log(user);
    const { page, limit } = paginationQueryDto;
    const offset = (page - 1) * limit;

    const { posts, totalCount } = await this.bookDiscussionsService.findAll(
      Number(limit),
      offset,
      user?.id || -1,
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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.authService.getUserFromToken(token);

    return this.bookDiscussionsService.findOne(id, user?.id || -1);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDiscussionDto: UpdateBookDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return this.bookDiscussionsService.update(
      id,
      request.user.id,
      updateBookDiscussionDto,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(OwnershipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookDiscussionsService.remove(id);
  }
}
