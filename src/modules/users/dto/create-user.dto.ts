import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: '이메일이 올바르지 않습니다. 올바른 이메일 주소를 입력해주세요.',
    },
  )
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[@!%*#?&])[a-z\d@!%*#?&]{8,20}$/g, {
    message:
      '비밀번호가 올바르지 않습니다. 최소 8자, 최대 20자, 최소 하나의 문자, 숫자, 특수문자를 포함해주세요.',
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  avatarUrl: string;
}
