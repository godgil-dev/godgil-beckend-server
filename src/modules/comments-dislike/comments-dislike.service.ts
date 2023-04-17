import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsLikeService } from 'src/modules/comments-like/comments-like.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentsDislikeDto } from './dto/create-comments-dislike.dto';

@Injectable()
export class CommentsDislikeService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CommentsLikeService))
    private commentsLikeService: CommentsLikeService,
  ) {}

  async create(createCommentsDislikeDto: CreateCommentsDislikeDto) {
    const { commentId, userId } = createCommentsDislikeDto;

    await this.commentsLikeService.findAndRemove(commentId, userId);

    return this.prisma.commentDislike.create({
      data: {
        commentId,
        userId,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }

  async findOne(commentId: number, userId: number) {
    return await this.prisma.commentDislike.findFirst({
      where: {
        commentId,
        userId,
      },
    });
  }

  async remove(commentId: number, userId: number) {
    return await this.prisma.commentDislike.delete({
      where: {
        userId_commentId: {
          commentId,
          userId,
        },
      },
    });
  }

  async removeThrow(commentId: number, userId: number) {
    const commentDislike = await this.findOne(userId, commentId);

    if (!commentDislike) {
      throw new NotFoundException('CommentDislike not found');
    }

    return await this.remove(commentId, userId);
  }

  async findAndRemove(commentId: number, userId: number) {
    const commentDislike = await this.findOne(commentId, userId);

    if (commentDislike) {
      await this.remove(commentId, userId);
    }
  }
}
