import { Injectable } from '@nestjs/common';
import { CommentsLikeService } from 'src/comments-like/comments-like.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentsDislikeDto } from './dto/create-comments-dislike.dto';

@Injectable()
export class CommentsDislikeService {
  constructor(
    private prisma: PrismaService,
    private commentsLikeService: CommentsLikeService,
  ) {}

  async create(createCommentsDislikeDto: CreateCommentsDislikeDto) {
    const { commentId, userId } = createCommentsDislikeDto;

    const commentLike = await this.commentsLikeService.findOne(
      commentId,
      userId,
    );

    if (commentLike) {
      await this.commentsLikeService.remove(commentLike.id);
    }

    return this.prisma.commentDislike.create({
      data: {
        commentId,
        userId,
      },
    });
  }

  findOne(commentId: number, userId: number) {
    return this.prisma.commentDislike.findFirst({
      where: {
        commentId,
        userId,
      },
    });
  }

  async remove(id: number) {
    this.prisma.commentDislike.delete({
      where: {
        id,
      },
    });
  }
}
