import { Module } from '@nestjs/common';
import { BookDiscussionsService } from './book-discussions.service';
import { BookDiscussionsController } from './book-discussions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsService } from 'src/modules/posts/posts.service';
import { BooksModule } from '../books/books.module';

@Module({
  controllers: [BookDiscussionsController],
  providers: [BookDiscussionsService, PostsService],
  imports: [PrismaModule, BooksModule],
})
export class BookDiscussionsModule {}
