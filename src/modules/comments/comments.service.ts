import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ProConVoteService } from '../pro-con-vote/pro-con-vote.service';
import { convertCommentToReposnse } from './utils/comments.util';
import { User } from '@prisma/client';
import { PaginationService } from '../pagination/pagination.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private proConVoteService: ProConVoteService,
    private paginationService: PaginationService,
  ) {}

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
      orderBy: {
        createdAt: 'desc',
      },
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

    return comments.map((comment) => convertCommentToReposnse(comment, userId));
  }

  async findAllByPostIdPages(postId: number, limit: number, offset: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const totalCount = await this.countByPostId(postId);

    return { comments: comments.map(convertCommentToReposnse), totalCount };
  }

  async findAllByUserId(userId: number, page: number, limit: number) {
    const offset = this.paginationService.getOffset(page, limit);

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.countByUserId(userId),
    ]);

    return {
      comments: comments.map((comment) => {
        return {
          id: comment.id,
          postId: comment.postId,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      }),
      pageInfo: this.paginationService.createPageInfo(
        totalCount,
        page,
        limit,
        comments.length,
      ),
    };
  }

  async countByUserId(userId: number) {
    return await this.prisma.comment.count({ where: { authorId: userId } });
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
      like: comment._count.CommentLike,
      dislike: comment._count.CommentDislike,
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
