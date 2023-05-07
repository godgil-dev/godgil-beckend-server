import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { BookDiscussionsModule } from '../book-discussions/book-discussions.module';
import { ProConDiscussionsModule } from '../pro-con-discussions/pro-con-discussions.module';

@Module({
  controllers: [HomeController],
  providers: [HomeService],
  imports: [BookDiscussionsModule, ProConDiscussionsModule],
})
export class HomeModule {}
