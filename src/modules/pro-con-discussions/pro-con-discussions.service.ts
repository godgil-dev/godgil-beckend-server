import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { ProConVoteService } from '../pro-con-vote/pro-con-vote.service';
import { CreateProConDiscussionDto } from './dto/create-pro-con-discussion.dto';
import { UpdateProConDiscussionDto } from './dto/update-pro-con-discussion.dto';
import { FindAllType } from './types/pro-con-discussion.type';
import { prismaPostInclude } from './utils/pro-con-discussion.util';
import { Post, ProConDiscussion, ProConVote } from '@prisma/client';

@Injectable()
export class ProConDiscussionsService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
    private proConVoteService: ProConVoteService,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
  ) {
    this.convertPostToResponse = this.convertPostToResponse.bind(this);
  }

  async convertPostToResponse(
    post: Post & {
      ProConDiscussion: ProConDiscussion & {
        ProConVote: ProConVote[];
      };
      User: {
        username: string;
      };
    },
    userId: number,
  ) {
    const proCount = await this.proConVoteService.proCount(
      post.ProConDiscussion.id,
    );

    const conCount = await this.proConVoteService.conCount(
      post.ProConDiscussion.id,
    );
    const [firstPro, firstCon] =
      await this.proConVoteService.findFirstVoteUsers(post.ProConDiscussion.id);

    const proConVote = await this.proConVoteService.findFirstByUserIdAndPostId(
      userId,
      post.id,
    );

    const isPro = proConVote ? proConVote.isPro : null;
    const isVote = isPro !== null;

    return {
      id: post.id,
      author: post.User.username,
      title: post.title,
      content: post.content,
      views: post.views,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      proCount,
      conCount,
      isVote,
      isPro,
      proLeader: firstPro?.User
        ? {
            username: firstPro.User.username,
            avatarUrl: firstPro.User.avatarUrl,
          }
        : null,
      conLeader: firstCon?.User
        ? {
            username: firstCon.User.username,
            avatarUrl: firstCon.User.avatarUrl,
          }
        : null,
    };
  }

  async create(
    { title, content, isPro }: CreateProConDiscussionDto,
    authorId: number,
  ) {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        title,
        content,
        ProConDiscussion: {
          create: {
            ProConVote: {
              create: {
                isPro,
                userId: authorId,
              },
            },
          },
        },
      },
      include: prismaPostInclude(),
    });

    const response = await this.convertPostToResponse(post, authorId);

    return { ...response, comments: [] };
  }

  //ToDo: 대표 두명, 찬반 카운트
  async findAll({
    limit,
    offset,
    userId,
    query = null,
    myPostsOnly = false,
  }: FindAllType) {
    const where = {
      NOT: {
        ProConDiscussion: null,
      },
      ...(query !== null && {
        title: {
          search: `*${query}*`,
        },
      }),
      ...(myPostsOnly && {
        authorId: userId,
      }),
    };

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: prismaPostInclude(),
    });

    const totalCount = await this.prisma.proConDiscussion.count();
    const response = posts.map((post) =>
      this.convertPostToResponse(post, userId),
    );

    return {
      posts: await Promise.all(response),
      totalCount,
    };
  }

  async findOne(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: prismaPostInclude(),
    });

    if (!post.ProConDiscussion) {
      throw new BadRequestException('찬성반대 토론 형태의 게시물이 아닙니다');
    }

    const response = await this.convertPostToResponse(post, userId);
    const comments = await this.commentsService.findAllByPostId(id, userId);

    return { ...response, comments };
  }

  async findOneByPostId(postId: number) {
    return await this.prisma.proConDiscussion.findUnique({
      where: { postId },
    });
  }

  async findOneByPostIdThrow(postId: number) {
    const proConDiscussions = await this.prisma.proConDiscussion.findUnique({
      where: { postId },
    });

    if (!proConDiscussions) {
      throw new NotFoundException(
        `[${postId}] 게시글이 없거나 찬반토론이 아닙니다`,
      );
    }

    return proConDiscussions;
  }

  async update(
    id: number,
    { title, content, isPro }: UpdateProConDiscussionDto,
    authorId: number,
  ) {
    if (isPro !== undefined) {
      await this.proConVoteService.update({ isPro }, authorId, id);
    }

    const post = await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && {
          title: title,
        }),
        ...(content !== undefined && {
          content: content,
        }),
      },
      include: prismaPostInclude(),
    });

    const response = await this.convertPostToResponse(post, authorId);
    const comments = await this.commentsService.findAllByPostId(id, authorId);
    return { ...response, comments };
  }

  remove(id: number) {
    return this.postService.remove(id);
  }
}
