import { Module } from '@nestjs/common';
import { CommentsDislikeService } from './comments-dislike.service';

@Module({
  providers: [CommentsDislikeService],
})
export class CommentsDislikeModule {}
