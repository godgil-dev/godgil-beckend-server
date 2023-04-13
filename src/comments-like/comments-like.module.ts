import { Module } from '@nestjs/common';
import { CommentsLikeService } from './comments-like.service';

@Module({
  providers: [CommentsLikeService],
})
export class CommentsLikeModule {}
