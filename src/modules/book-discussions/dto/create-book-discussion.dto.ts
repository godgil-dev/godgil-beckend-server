import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateBookDto } from 'src/modules/books/dto/create-book.dto';
import { CreatePostDto } from 'src/modules/posts/dto/create-posts.dto';

export class CreateBookDiscussionDto extends CreatePostDto {
  @ValidateNested()
  @Type(() => CreateBookDto)
  @ApiProperty({
    type: CreateBookDto,
  })
  book: CreateBookDto;
}
