import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { CreatePostDto } from 'src/modules/posts/dto/create-posts.dto';

export class CreateProConDiscussionDto extends CreatePostDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isPro: boolean;
}
