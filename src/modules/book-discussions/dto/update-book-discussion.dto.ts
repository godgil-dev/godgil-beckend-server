import { PartialType } from '@nestjs/swagger';
import { CreateBookDiscussionDto } from './create-book-discussion.dto';

export class UpdateBookDiscussionDto extends PartialType(
  CreateBookDiscussionDto,
) {}
