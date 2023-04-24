import { Module } from '@nestjs/common';
import { BookDiscussionsController } from './book-discussions.controller';
import { BookDiscussionsService } from './book-discussions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsService } from 'src/modules/posts/posts.service';
import { BooksModule } from '../books/books.module';
import { CommentsModule } from '../comments/comments.module';
import { PostLikesModule } from '../post-likes/post-likes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [BookDiscussionsController],
  providers: [BookDiscussionsService, PostsService],
  imports: [
    PrismaModule,
    BooksModule,
    CommentsModule,
    PostLikesModule,
    AuthModule,
  ],
  exports: [BookDiscussionsService],
})
export class BookDiscussionsModule {}
