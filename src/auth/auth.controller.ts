import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiCookieAuth,
  ApiHeader,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import UserRequest from './types/user-request.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiCookieAuth('refreshToken')
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      email,
      password,
    );

    console.log(accessToken, refreshToken);
    response.setHeader('Authorization', `Bearer ${accessToken}`);

    // refresh token을 HttpOnly cookie에 담아 전송
    response.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    console.log(response);

    response.json({ message: '로그인 성공' });
  }

  @Post('token')
  @HttpCode(200)
  @ApiHeader({
    name: 'Authorization',
    description: 'Access token',
    required: true,
  })
  @ApiCookieAuth()
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
  async getToken(@Req() req: UserRequest, @Res() response: Response) {
    // console.log(req);
    const refreshToken = req.cookies['refreshToken'];

    const { accessToken, newRefreshToken } = await this.authService.refresh(
      refreshToken,
      req.user,
    );
    console.log(accessToken, newRefreshToken);
    // 새로운 refresh token을 HttpOnly cookie에 담아 전송
    response.setHeader('Authorization', `Bearer ${accessToken}`);
    response.cookie('refreshToken', newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    response.json({ message: '로그인 성공' });
  }
}
