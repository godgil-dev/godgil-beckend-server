import { PartialType } from '@nestjs/swagger';
import { CreateProConDiscussionDto } from './create-pro-con-discussion.dto';

export class UpdateProConDiscussionDto extends PartialType(
  CreateProConDiscussionDto,
) {}
