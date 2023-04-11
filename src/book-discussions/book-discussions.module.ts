import { Module } from '@nestjs/common';
import { BookDiscussionsService } from './book-discussions.service';
import { BookDiscussionsController } from './book-discussions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsService } from 'src/posts/posts.service';

@Module({
  controllers: [BookDiscussionsController],
  providers: [BookDiscussionsService, PostsService],
  imports: [PrismaModule],
})
export class BookDiscussionsModule {}
