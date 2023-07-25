import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OauthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private googleUserUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

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

  private async requestGoogleToken(code: string) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_SECRET');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT');
    console.log(redirectUri);

    const params = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'postmessage',
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(this.googleTokenUrl, params);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async getGoogleToken(code: string) {
    const data = await this.requestGoogleToken(code);
    if (!data.access_token) {
      throw new HttpException(
        'Failed to get access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  private async requestGoogleUser(accessToken: string) {
    try {
      const response = await axios.get(this.googleUserUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async getGoogleUser(accessToken: string) {
    const data = await this.requestGoogleUser(accessToken);
    if (!data.email || !data.name) {
      throw new HttpException(
        'Failed to get user information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }
}
