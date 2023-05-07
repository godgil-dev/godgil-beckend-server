import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostLikesService {
  constructor(private prisma: PrismaService) {}

  async create(postId: number, userId: number) {
    const postLike = await this.findOne(postId, userId);

    if (postLike) {
      throw new ConflictException('이미 좋아요한 게시글입니다.');
    }

    await this.prisma.postLike.create({
      data: {
        userId,
        postId,
      },
      include: {
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    return this.countByPostId(postId);
  }

  async findOne(postId: number, userId: number) {
    return await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async remove(postId: number, userId: number) {
    const postLike = await this.findOne(postId, userId);

    if (!postLike) {
      throw new NotFoundException('게시글 좋아요를 찾을 수 없습니다.');
    }

    await this.prisma.postLike.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return this.countByPostId(postId);
  }

  async countByPostId(postId: number) {
    return await this.prisma.postLike.count({
      where: {
        postId,
      },
    });
  }
}
