import { PartialType } from '@nestjs/swagger';
import { CreateProConVoteDto } from './create-pro-con-vote.dto';

export class UpdateProConVoteDto extends PartialType(CreateProConVoteDto) {}
