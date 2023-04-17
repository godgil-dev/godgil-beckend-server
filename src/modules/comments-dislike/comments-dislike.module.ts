import { forwardRef, Module } from '@nestjs/common';
import { CommentsLikeModule } from 'src/modules/comments-like/comments-like.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsDislikeService } from './comments-dislike.service';

@Module({
  providers: [CommentsDislikeService],
  imports: [PrismaModule, forwardRef(() => CommentsLikeModule)],
  exports: [CommentsDislikeService],
})
export class CommentsDislikeModule {}
