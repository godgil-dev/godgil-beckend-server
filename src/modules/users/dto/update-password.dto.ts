import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_VALIDATE_REGEX } from '../constants/vaildate';
import { VALIDATE_ERROR_MESSAGE } from '../constants/messages';

export class UpdatePasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  @Matches(PASSWORD_VALIDATE_REGEX, {
    message: VALIDATE_ERROR_MESSAGE.NEW_PASSWORD,
  })
  newPassword: string;
}
