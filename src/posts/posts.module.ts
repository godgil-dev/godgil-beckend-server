import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsService } from './posts.service';

@Module({
  providers: [PostsService],
  exports: [PostsService],
  imports: [PrismaModule],
})
export class PostsModule {}
