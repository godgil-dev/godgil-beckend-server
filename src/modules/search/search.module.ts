import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from '../auth/auth.module';
import { ProConDiscussionsModule } from '../pro-con-discussions/pro-con-discussions.module';
import { BookDiscussionsModule } from '../book-discussions/book-discussions.module';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [AuthModule, ProConDiscussionsModule, BookDiscussionsModule],
})
export class SearchModule {}
