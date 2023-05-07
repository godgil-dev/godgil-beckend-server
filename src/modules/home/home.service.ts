import { Injectable } from '@nestjs/common';
import { ProConDiscussionsService } from '../pro-con-discussions/pro-con-discussions.service';
import { BookDiscussionsService } from '../book-discussions/book-discussions.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly proConDiscussionService: ProConDiscussionsService,
    private readonly bookDiscussionService: BookDiscussionsService,
  ) {}

  async findAll(userId: number) {
    const limit = 3;
    const offset = 0;

    const proConDiscussions = await this.proConDiscussionService.findAll({
      limit,
      offset,
      userId,
    });

    const bookDiscussions = await this.bookDiscussionService.findAll({
      limit,
      offset,
      userId,
    });

    const bookDiscussionsTop10 = await this.bookDiscussionService.findAll({
      offset,
      userId,
      limit: 10,
      sortBy: 'popular',
    });

    return {
      proConDiscussions: proConDiscussions.posts,
      bookDiscussions: bookDiscussions.posts,
      bookDiscussionsTop10: bookDiscussionsTop10.posts,
    };
  }
}
