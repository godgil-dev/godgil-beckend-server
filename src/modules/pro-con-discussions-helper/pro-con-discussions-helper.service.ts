import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProConDiscussionsHelperService {
  constructor(private prisma: PrismaService) {}

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
}
