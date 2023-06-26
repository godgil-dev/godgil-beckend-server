import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OauthService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByOAuth(email: string, provider: string) {
    const oauth = await this.prisma.oauth.findFirst({
      where: {
        provider: provider,
        User: {
          email: email,
        },
      },
      include: {
        User: true,
      },
    });

    if (oauth) {
      return oauth.User;
    }

    return null;
  }

  async create(userId: number, provider: string, oauthData: any) {
    return await this.prisma.oauth.create({
      data: {
        userId: userId,
        provider: provider,
        data: JSON.stringify(oauthData),
      },
      include: {
        User: true,
      },
    });
  }

  async findOrCreate(id: number, email: string, provider: string) {
    const oauth = await this.findOneByOAuth(email, provider);

    if (!oauth) {
      return this.create(id, provider, null);
    }

    return oauth;
  }
}
