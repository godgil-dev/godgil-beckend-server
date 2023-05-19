import { Module } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsModule } from '../posts/posts.module';
import { BookDiscussionsModule } from '../book-discussions/book-discussions.module';

@Module({
  controllers: [PostLikesController],
  providers: [PostLikesService],
  imports: [PrismaModule, PostsModule, BookDiscussionsModule],
  exports: [PostLikesService],
})
export class PostLikesModule {}
