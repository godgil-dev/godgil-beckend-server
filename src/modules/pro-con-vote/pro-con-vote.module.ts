import { Module } from '@nestjs/common';
import { ProConVoteService } from './pro-con-vote.service';
import { ProConVoteController } from './pro-con-vote.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProConDiscussionsHelperService } from '../pro-con-discussions-helper/pro-con-discussions-helper.service';

@Module({
  controllers: [ProConVoteController],
  providers: [ProConVoteService, ProConDiscussionsHelperService],
  imports: [PrismaModule],
  exports: [ProConVoteService],
})
export class ProConVoteModule {}
