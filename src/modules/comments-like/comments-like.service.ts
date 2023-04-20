import { CommentsDislikeService } from '../comments-dislike/comments-dislike.service';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentsLikeDto } from './dto/create-comments-like.dto';

@Injectable()
export class CommentsLikeService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CommentsDislikeService))
    private commentsDislikeService: CommentsDislikeService,
  ) {}

  async create(createCommentsLikeDto: CreateCommentsLikeDto) {
    const { commentId, userId } = createCommentsLikeDto;

    const commentLike = await this.findOne(commentId, userId);

    if (commentLike) {
      throw new ConflictException('이미 좋아요한 댓글입니다.');
    }

    await this.commentsDislikeService.findAndRemove(commentId, userId);

    return await this.prisma.commentLike.create({
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
    return await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          commentId,
          userId,
        },
      },
    });
  }

  async remove(commentId: number, userId: number) {
    return await this.prisma.commentLike.delete({
      where: {
        userId_commentId: {
          commentId,
          userId,
        },
      },
    });
  }

  async removeThrow(commentId: number, userId: number) {
    const commentLike = await this.findOne(commentId, userId);

    if (!commentLike) {
      throw new NotFoundException('CommentLike not found');
    }

    return await this.remove(commentId, userId);
  }

  async findAndRemove(commentId: number, userId: number) {
    const commentLike = await this.findOne(commentId, userId);

    if (commentLike) {
      await this.remove(commentId, userId);
    }
  }
}
