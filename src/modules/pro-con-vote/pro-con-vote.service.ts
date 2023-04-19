import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProConDiscussionsService } from './../pro-con-discussions/pro-con-discussions.service';
import { CreateProConVoteDto } from './dto/create-pro-con-vote.dto';
import { UpdateProConVoteDto } from './dto/update-pro-con-vote.dto';

@Injectable()
export class ProConVoteService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProConDiscussionsService))
    private proConDiscussionsService: ProConDiscussionsService,
  ) {}

  async create(
    { isAgree }: CreateProConVoteDto,
    userId: number,
    postId: number,
  ) {
    const proConDiscussions =
      await this.proConDiscussionsService.findOneByPostIdThrow(postId);

    const existProConVote = await this.findExistingVote(
      userId,
      proConDiscussions.id,
    );

    if (existProConVote) {
      throw new ConflictException('이미 생성한 찬성반대가 있습니다');
    }

    const proConVote = await this.prisma.proConVote.create({
      data: {
        isAgree,
        userId,
        proConDiscussionId: proConDiscussions.id,
      },
    });

    return { isAgree: proConVote.isAgree };
  }

  async findExistingVote(userId: number, proConDiscussionId: number) {
    return this.prisma.proConVote.findFirst({
      where: {
        userId: userId,
        proConDiscussionId: proConDiscussionId,
      },
    });
  }

  async findOneByUserIdAndPostId(userId: number, postId: number) {
    const proConDiscussions =
      await this.proConDiscussionsService.findOneByPostId(postId);

    if (!proConDiscussions) {
      return null;
    }

    return await this.prisma.proConVote.findUnique({
      where: {
        userId_proConDiscussionId: {
          userId,
          proConDiscussionId: proConDiscussions.id,
        },
      },
    });
  }

  async findFirstAgree(proConDiscussionId: number) {
    return await this.prisma.proConVote.findFirst({
      where: {
        proConDiscussionId,
        isAgree: true,
      },
      select: {
        User: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findFirstDisagree(proConDiscussionId: number) {
    return await this.prisma.proConVote.findFirst({
      where: {
        proConDiscussionId,
        isAgree: false,
      },
      select: {
        User: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findFirstVoteUsers(proConDiscussionId: number) {
    const firstAgree = await this.findFirstAgree(proConDiscussionId);
    const firstDisagree = await this.findFirstDisagree(proConDiscussionId);

    return [firstAgree, firstDisagree];
  }

  async update(
    { isAgree }: UpdateProConVoteDto,
    userId: number,
    postId: number,
  ) {
    const proConDiscussions =
      await this.proConDiscussionsService.findOneByPostIdThrow(postId);

    const proConVote = await this.prisma.proConVote.update({
      where: {
        userId_proConDiscussionId: {
          userId,
          proConDiscussionId: proConDiscussions.id,
        },
      },
      data: {
        isAgree,
      },
    });

    return { isAgree: proConVote.isAgree };
  }

  //Todo: 댓글을 다 삭제하면 지울 수 있도록 구현 필요
  remove(id: number) {
    return `This action removes a #${id} proConVote`;
  }

  async agreeCount(proConDiscussionId: number) {
    return await this.prisma.proConVote.count({
      where: {
        proConDiscussionId,
        isAgree: true,
      },
    });
  }

  async disagreeCount(proConDiscussionId: number) {
    return await this.prisma.proConVote.count({
      where: {
        proConDiscussionId,
        isAgree: false,
      },
    });
  }
}
