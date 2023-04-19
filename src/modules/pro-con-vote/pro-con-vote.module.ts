import { Module, forwardRef } from '@nestjs/common';
import { ProConVoteService } from './pro-con-vote.service';
import { ProConVoteController } from './pro-con-vote.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProConDiscussionsModule } from 'src/modules/pro-con-discussions/pro-con-discussions.module';

@Module({
  controllers: [ProConVoteController],
  providers: [ProConVoteService],
  imports: [PrismaModule, forwardRef(() => ProConDiscussionsModule)],
  exports: [ProConVoteService],
})
export class ProConVoteModule {}
