import { IsNotEmpty, IsNumber } from 'class-validator';

export class CommentsQueryParamsDto {
  @IsNumber()
  @IsNotEmpty()
  postId: number;
}
