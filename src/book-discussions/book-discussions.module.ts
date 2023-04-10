import { Module } from '@nestjs/common';
import { BookDiscussionsService } from './book-discussions.service';
import { BookDiscussionsController } from './book-discussions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BookDiscussionsController],
  providers: [BookDiscussionsService],
  imports: [PrismaModule],
})
export class BookDiscussionsModule {}
