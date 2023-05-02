import { PostsModule } from 'src/modules/posts/posts.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsLikeModule } from 'src/modules/comments-like/comments-like.module';
import { CommentsDislikeModule } from 'src/modules/comments-dislike/comments-dislike.module';
import { ProConVoteModule } from '../pro-con-vote/pro-con-vote.module';
import { PaginationService } from '../pagination/pagination.service';

@Module({
  providers: [CommentsService, PaginationService],
  exports: [CommentsService],
  imports: [
    PrismaModule,
    CommentsLikeModule,
    CommentsDislikeModule,
    PostsModule,
    ProConVoteModule,
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
