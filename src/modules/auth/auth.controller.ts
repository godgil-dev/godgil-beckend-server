import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/googleLogin.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiCookieAuth('refreshToken')
  @Public()
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, payload } = await this.authService.login(
      email,
      password,
    );

    response.setHeader('Authorization', `Bearer ${accessToken}`);

    // refresh token을 HttpOnly cookie에 담아 전송
    response.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    response.json({
      username: payload.username,
      avatarUrl: payload.avatarUrl,
      role: payload.role.name,
    });
  }

  @Post('token')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Authentication successful.',
    headers: {
      Authorization: {
        description: 'Access token.',
        schema: { type: 'string' },
      },
      'Set-Cookie': {
        description: 'Refresh token.',
        schema: { type: 'string' },
      },
    },
  })
  async getToken(@Req() req: Request, @Res() response: Response) {
    const refreshToken = req.cookies['refreshToken'];

    const { accessToken, newRefreshToken } = await this.authService.refresh(
      refreshToken,
      req.user,
    );

    response.setHeader('Authorization', `Bearer ${accessToken}`);
    response.cookie('refreshToken', newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    response.json({ message: '로그인 성공' });
  }

  @Delete('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    await this.authService.logout(req.user);
  }

  @Post('google-login')
  @HttpCode(200)
  @ApiCookieAuth('refreshToken')
  @Public()
  async googleAuth(
    @Body() { code }: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // redirect google login page
    const { accessToken, refreshToken, payload } =
      await this.authService.googleLogin(code);

    response.setHeader('Authorization', `Bearer ${accessToken}`);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    response.json({
      username: payload.username,
      avatarUrl: payload.avatarUrl,
      role: payload.role,
    });
  }
}
