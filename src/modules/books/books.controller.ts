import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @ApiBearerAuth()
  @Public()
  @Get(':isbn')
  async findOne(@Param('isbn') isbn: string, @Req() request: Request) {
    return await this.booksService.findBookDiscussionsByIsbn(
      isbn,
      0,
      3,
      request.user?.id || -1,
    );
  }
}
