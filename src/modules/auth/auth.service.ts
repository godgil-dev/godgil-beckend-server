import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OauthService } from './../oauth/oauth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly oauthService: OauthService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  generateAccessToken(email: string, username: string) {
    return this.jwtService.sign(
      { email, username },
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      },
    );
  }

  async generateRefreshToken(id: number) {
    const refreshToken = uuidv4();
    const refreshTokenKey = `refreshToken:${id}`;

    await this.cache.set(
      refreshTokenKey,
      refreshToken,
      parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME),
    );

    return refreshToken;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(`No user found for username: ${email}`);
    }
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const { password, createdAt, updatedAt, ...result } = user;

    return result;
  }

  async login(email: string, password: string) {
    const payload = await this.validateUser(email, password);
    const accessToken = this.generateAccessToken(email, payload.username);
    const refreshToken = await this.generateRefreshToken(payload.id);

    return { accessToken, refreshToken, payload };
  }

  async oauthLogin(user: Express.User, provider: string) {
    const { email } = user;
    console.log(email);
    const payload = await this.usersService.findOrCreateByEmail(email);
    console.log(payload);

    await this.oauthService.findOrCreate(payload.id, email, provider);

    const accessToken = this.generateAccessToken(email, payload.username);
    const refreshToken = await this.generateRefreshToken(payload.id);

    return { accessToken, refreshToken, payload };
  }

  async logout(user: any) {
    const refreshTokenKey = `refreshToken:${user.id}`;

    // Delete the refresh token from the cache
    await this.cache.del(refreshTokenKey);
  }

  async refresh(refreshToken: string, user: any) {
    const refreshTokenKey = `refreshToken:${user.id}`;
    const storeRefreshToken = await this.getRefreshTokenFromKey(
      refreshTokenKey,
    );

    if (!storeRefreshToken || refreshToken !== storeRefreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const accessToken = this.generateAccessToken(user.email, user.username);
    const newRefreshToken = this.generateRefreshToken(user.id);

    return { accessToken, newRefreshToken };
  }

  async getRefreshTokenFromKey(key: string): Promise<string | null> {
    const data = await this.cache.get<string | null>(key);
    if (data) {
      return data;
    }
    return null;
  }

  async getUserFromToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token); // 토큰 유효성 검사
      return await this.usersService.findOne(decoded.username); // 해당 유저 정보 반환
    } catch (error) {
      return null; // 토큰이 유효하지 않은 경우 null 반환
    }
  }
}
