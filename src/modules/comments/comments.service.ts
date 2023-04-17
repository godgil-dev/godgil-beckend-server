import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, User } from '@prisma/client';
import { ProConVoteService } from '../pro-con-vote/pro-con-vote.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private proConVoteService: ProConVoteService,
  ) {}

  convertPostToReposnse(
    comments: Comment & {
      User: {
        username: string;
      };
    },
  ) {
    return {
      id: comments.id,
      author: comments.User.username,
      content: comments.content,
      createdAt: comments.createdAt.toISOString(),
      updatedAt: comments.updatedAt.toISOString(),
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
        isAgree: proConVote.isAgree,
      }),
    };
  }

  async findOne(id: number) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async findAllByPostId(postId: number, limit: number, offset: number) {
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

  async update(updateCommentDto: UpdateCommentDto, id: number) {
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
      },
    });

    return {
      author: comment.User.username,
      content: comment.content,
      like: comment._count.CommentDislike,
      dislike: comment._count.CommentLike,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
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
