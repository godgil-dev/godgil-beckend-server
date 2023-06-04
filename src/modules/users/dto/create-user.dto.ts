import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PASSWORD_VALIDATE_REGEX } from '../constants/vaildate';
import { VALIDATE_ERROR_MESSAGE } from '../constants/messages';

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
      message: VALIDATE_ERROR_MESSAGE.EMAIL,
    },
  )
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  @Matches(PASSWORD_VALIDATE_REGEX, {
    message: VALIDATE_ERROR_MESSAGE.PASSWORD,
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  avatarUrl: string;
}
