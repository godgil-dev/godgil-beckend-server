import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, ProConDiscussion, ProConVote } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { ProConVoteService } from '../pro-con-vote/pro-con-vote.service';
import { CreateProConDiscussionDto } from './dto/create-pro-con-discussion.dto';
import { UpdateProConDiscussionDto } from './dto/update-pro-con-discussion.dto';

@Injectable()
export class ProConDiscussionsService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
    private proConVoteService: ProConVoteService,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
  ) {
    this.convertPostToReposnse = this.convertPostToReposnse.bind(this);
  }

  async convertPostToReposnse(
    post: Post & {
      ProConDiscussion: ProConDiscussion & {
        ProConVote: ProConVote[];
      };
      User: {
        username: string;
      };
    },
  ) {
    const proCount = await this.proConVoteService.proCount(
      post.ProConDiscussion.id,
    );

    const conCount = await this.proConVoteService.conCount(
      post.ProConDiscussion.id,
    );
    const [firstPro, firstCon] =
      await this.proConVoteService.findFirstVoteUsers(post.ProConDiscussion.id);

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
      proSideUser: firstPro?.User?.username || null,
      conSideUser: firstCon?.User?.username || null,
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
      include: {
        ProConDiscussion: {
          include: {
            ProConVote: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const response = await this.convertPostToReposnse(post);

    return { ...response, comments: [] };
  }

  //ToDo: 대표 두명, 찬반 카운트
  async findAll(limit: number, offset: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        NOT: { ProConDiscussion: null },
      },
      take: limit,
      skip: offset,
      include: {
        ProConDiscussion: {
          select: {
            id: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.proConDiscussion.count();
    const convertPostToReposnse = posts.map(this.convertPostToReposnse);

    return {
      posts: await Promise.all(convertPostToReposnse),
      totalCount,
    };
  }

  async findOne(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        ProConDiscussion: {
          include: {
            ProConVote: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!post.ProConDiscussion) {
      throw new BadRequestException('찬성반대 토론 형태의 게시물이 아닙니다');
    }

    const response = await this.convertPostToReposnse(post);
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
      include: {
        ProConDiscussion: {
          include: {
            ProConVote: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    const response = await this.convertPostToReposnse(post);
    const comments = await this.commentsService.findAllByPostId(id, authorId);
    return { ...response, comments };
  }

  remove(id: number) {
    return this.postService.remove(id);
  }
}
