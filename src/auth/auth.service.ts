import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for username: ${email}`);
    }
    console.log(email, pass, user);
    // Step 2: Check if the password is correct
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    // If password does not match, throw an error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password, createdAt, updatedAt, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const payload = await this.validateUser(email, password);
    const accessToken = this.jwtService.sign(
      { email: payload.email, username: payload.username },
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      },
    );

    const refreshToken = uuidv4();
    const refreshTokenKey = `refreshToken:${payload.id}`;

    await this.cache.set(
      refreshTokenKey,
      refreshToken,
      parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME),
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string, user: any) {
    const refreshTokenKey = `refreshToken:${user.id}`;
    const storeRefreshToken = await this.getRefreshTokenFromKey(
      refreshTokenKey,
    );

    if (!storeRefreshToken || refreshToken !== storeRefreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const newRefreshToken = uuidv4();

    await this.cache.set(
      refreshTokenKey,
      newRefreshToken,
      parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME),
    );

    const payload = { username: user.username, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return { accessToken, newRefreshToken };
  }

  async getRefreshTokenFromKey(key: string): Promise<string | null> {
    const data = await this.cache.get<string | null>(key);
    if (data) {
      return data;
    }
    return null;
  }
}
