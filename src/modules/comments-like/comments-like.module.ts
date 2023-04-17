import { forwardRef, Module } from '@nestjs/common';
import { CommentsDislikeModule } from 'src/modules/comments-dislike/comments-dislike.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsLikeService } from './comments-like.service';

@Module({
  providers: [CommentsLikeService],
  exports: [CommentsLikeService],
  imports: [PrismaModule, forwardRef(() => CommentsDislikeModule)],
})
export class CommentsLikeModule {}
