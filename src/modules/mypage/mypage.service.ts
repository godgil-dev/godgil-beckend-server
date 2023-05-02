import { Injectable } from '@nestjs/common';
import { BookDiscussionsService } from '../book-discussions/book-discussions.service';
import { ProConDiscussionsService } from '../pro-con-discussions/pro-con-discussions.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class MypageService {
  constructor(
    private bookDiscussionsService: BookDiscussionsService,
    private proConDiscussionsService: ProConDiscussionsService,
    private commentsService: CommentsService,
  ) {}

  async findOne(userId: number) {
    // 독서토론
    const bookDiscussions = await this.bookDiscussionsService.findAll({
      userId,
      offset: 0,
      limit: 2,
      myPostsOnly: true,
    });
    // 찬반토론
    const proConDiscussions = await this.proConDiscussionsService.findAll({
      userId,
      offset: 0,
      limit: 2,
      myPostsOnly: true,
    });

    // 댓글 목록
    const comments = await this.commentsService.findAllByUserId(userId, 1, 2);

    return {
      bookDiscussions: [...bookDiscussions.posts],
      proConDiscussions: [...proConDiscussions.posts],
      comments: [...comments.comments],
    };
  }
}
