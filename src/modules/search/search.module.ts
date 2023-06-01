import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ProConDiscussionsModule } from '../pro-con-discussions/pro-con-discussions.module';
import { BookDiscussionsModule } from '../book-discussions/book-discussions.module';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [ProConDiscussionsModule, BookDiscussionsModule],
})
export class SearchModule {}
