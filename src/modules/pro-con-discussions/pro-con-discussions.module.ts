import { forwardRef, Module } from '@nestjs/common';
import { ProConDiscussionsService } from './pro-con-discussions.service';
import { ProConDiscussionsController } from './pro-con-discussions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { ProConVoteModule } from '../pro-con-vote/pro-con-vote.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProConDiscussionsController],
  providers: [ProConDiscussionsService],
  imports: [
    PrismaModule,
    PostsModule,
    AuthModule,
    forwardRef(() => CommentsModule),
    forwardRef(() => ProConVoteModule),
  ],
  exports: [ProConDiscussionsService],
})
export class ProConDiscussionsModule {}
