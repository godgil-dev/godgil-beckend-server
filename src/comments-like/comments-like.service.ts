import { CommentsDislikeService } from './../comments-dislike/comments-dislike.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentsLikeDto } from './dto/create-comments-like.dto';

@Injectable()
export class CommentsLikeService {
  constructor(
    private prisma: PrismaService,
    private commentsDislikeService: CommentsDislikeService,
  ) {}

  async create(createCommentsLikeDto: CreateCommentsLikeDto) {
    const { commentId, userId } = createCommentsLikeDto;

    const commentLike = await this.commentsDislikeService.findOne(
      commentId,
      userId,
    );

    if (commentLike) {
      await this.commentsDislikeService.remove(commentLike.id);
    }

    return this.prisma.commentLike.create({
      data: {
        commentId,
        userId,
      },
    });
  }

  findOne(commentId: number, userId: number) {
    return this.prisma.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.commentLike.delete({
      where: {
        id,
      },
    });
  }
}
