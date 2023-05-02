import { Module } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { MypageController } from './mypage.controller';
import { UsersModule } from '../users/users.module';
import { BookDiscussionsModule } from '../book-discussions/book-discussions.module';
import { ProConDiscussionsModule } from '../pro-con-discussions/pro-con-discussions.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  controllers: [MypageController],
  providers: [MypageService],
  imports: [
    UsersModule,
    BookDiscussionsModule,
    ProConDiscussionsModule,
    CommentsModule,
  ],
})
export class MypageModule {}
