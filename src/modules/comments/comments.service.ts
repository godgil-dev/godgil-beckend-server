import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, User, CommentLike, CommentDislike } from '@prisma/client';
import { ProConVoteService } from '../pro-con-vote/pro-con-vote.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private proConVoteService: ProConVoteService,
  ) {}

  convertPostToReposnse(
    comment: Comment & {
      User: {
        username: string;
      };
      _count: {
        CommentLike: number;
        CommentDislike: number;
      };
      CommentLike: CommentLike[];
      CommentDislike: CommentDislike[];
    },
    userId: number,
  ) {
    return {
      id: comment.id,
      author: comment.User.username,
      content: comment.content,
      like: comment._count.CommentDislike,
      dislike: comment._count.CommentLike,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      likedByUser: comment.CommentLike.some((like) => like.userId === userId),
      dislikedBytUser: comment.CommentDislike.some(
        (dislike) => dislike.userId === userId,
      ),
    };
  }

  async create(
    { content }: CreateCommentDto,
    postId: number,
    authorId: number,
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        authorId,
        postId,
        content,
      },
      include: {
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const proConVote = await this.proConVoteService.findOneByUserIdAndPostId(
      authorId,
      postId,
    );

    return {
      id: comment.id,
      author: comment.User.username,
      content: comment.content,
      like: 0,
      dislike: 0,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      ...(proConVote && {
        isPro: proConVote.isPro,
      }),
    };
  }

  async findOne(id: number) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async findAllByPostId(postId: number, userId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        User: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            CommentLike: true,
            CommentDislike: true,
          },
        },
        CommentLike: { where: { userId } },
        CommentDislike: { where: { userId } },
      },
    });

    return comments.map((comment) =>
      this.convertPostToReposnse(comment, userId),
    );
  }

  async findAllByPostIdPages(postId: number, limit: number, offset: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      take: limit,
      skip: offset,
      include: {
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const totalCount = await this.countByPostId(postId);

    return { comments: comments.map(this.convertPostToReposnse), totalCount };
  }

  async update(updateCommentDto: UpdateCommentDto, id: number, userId: number) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        User: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            CommentLike: true,
            CommentDislike: true,
          },
        },
        CommentLike: {
          where: { userId },
          select: { id: true },
        },
        CommentDislike: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const proConVote = await this.proConVoteService.findOneByUserIdAndPostId(
      comment.authorId,
      comment.postId,
    );

    return {
      author: comment.User.username,
      content: comment.content,
      like: comment._count.CommentDislike,
      dislike: comment._count.CommentLike,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      ...(proConVote && {
        isPro: proConVote.isPro,
      }),
    };
  }

  remove(id: number) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async checkOwnership(id: number, user: User) {
    const comment = await this.findOne(id); // Prisma를 사용하여 게시물 조회

    if (!comment) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('본 계정의 댓글이 아닙니다');
    }

    return true;
  }

  async countByPostId(postId: number) {
    return await this.prisma.comment.count({ where: { postId } });
  }
}
