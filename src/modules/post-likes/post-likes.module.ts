import { Module } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PostLikesController],
  providers: [PostLikesService],
  imports: [PrismaModule],
  exports: [PostLikesService],
})
export class PostLikesModule {}
