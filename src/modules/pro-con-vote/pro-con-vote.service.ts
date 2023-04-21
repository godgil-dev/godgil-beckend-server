import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProConDiscussionsHelperService } from '../pro-con-discussions-helper/pro-con-discussions-helper.service';
import { CreateProConVoteDto } from './dto/create-pro-con-vote.dto';
import { UpdateProConVoteDto } from './dto/update-pro-con-vote.dto';

@Injectable()
export class ProConVoteService {
  constructor(
    private prisma: PrismaService,
    private proConDiscussionsHelperService: ProConDiscussionsHelperService,
  ) {}

  async create({ isPro }: CreateProConVoteDto, userId: number, postId: number) {
    const proConDiscussions =
      await this.proConDiscussionsHelperService.findOneByPostIdThrow(postId);

    const existProConVote = await this.findExistingVote(
      userId,
      proConDiscussions.id,
    );

    if (existProConVote) {
      throw new ConflictException('이미 생성한 찬성반대가 있습니다');
    }

    const proConVote = await this.prisma.proConVote.create({
      data: {
        isPro,
        userId,
        proConDiscussionId: proConDiscussions.id,
      },
    });

    return { isPro: proConVote.isPro };
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
      await this.proConDiscussionsHelperService.findOneByPostId(postId);

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

  async findFirstPro(proConDiscussionId: number) {
    return await this.prisma.proConVote.findFirst({
      where: {
        proConDiscussionId,
        isPro: true,
      },
      select: {
        User: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findFirstCon(proConDiscussionId: number) {
    return await this.prisma.proConVote.findFirst({
      where: {
        proConDiscussionId,
        isPro: false,
      },
      select: {
        User: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findFirstVoteUsers(proConDiscussionId: number) {
    const firstPro = await this.findFirstPro(proConDiscussionId);
    const firstCon = await this.findFirstCon(proConDiscussionId);

    return [firstPro, firstCon];
  }

  async update({ isPro }: UpdateProConVoteDto, userId: number, postId: number) {
    const proConDiscussions =
      await this.proConDiscussionsHelperService.findOneByPostIdThrow(postId);

    const proConVote = await this.prisma.proConVote.update({
      where: {
        userId_proConDiscussionId: {
          userId,
          proConDiscussionId: proConDiscussions.id,
        },
      },
      data: {
        isPro,
      },
    });

    return { isPro: proConVote.isPro };
  }

  //Todo: 댓글을 다 삭제하면 지울 수 있도록 구현 필요
  remove(id: number) {
    return `This action removes a #${id} proConVote`;
  }

  async proCount(proConDiscussionId: number) {
    return await this.prisma.proConVote.count({
      where: {
        proConDiscussionId,
        isPro: true,
      },
    });
  }

  async conCount(proConDiscussionId: number) {
    return await this.prisma.proConVote.count({
      where: {
        proConDiscussionId,
        isPro: false,
      },
    });
  }
}
