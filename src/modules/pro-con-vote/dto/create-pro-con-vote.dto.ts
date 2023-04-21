import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateProConVoteDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPro: boolean;
}
