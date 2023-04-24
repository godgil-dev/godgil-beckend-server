import { Injectable } from '@nestjs/common';
import { BookDiscussionsService } from '../book-discussions/book-discussions.service';
import { ProConDiscussionsService } from '../pro-con-discussions/pro-con-discussions.service';

@Injectable()
export class SearchService {
  constructor(
    private proConDiscussionsService: ProConDiscussionsService,
    private bookDiscussionsService: BookDiscussionsService,
  ) {}

  async searchAll(
    limit: number,
    offset: number,
    userId: number,
    query: string,
    type: string,
  ) {
    let proConResults = [];
    let bookResults = [];
    if (!type || type === 'proCon') {
      proConResults = await this.proConDiscussionsService
        .findAll(limit, offset, query)
        .then(({ posts }) => posts);
    }
    if (!type || type === 'book') {
      bookResults = await this.bookDiscussionsService
        .findAll(limit, offset, userId, query)
        .then(({ posts }) => posts);
    }

    const totalCount = proConResults.length + bookResults.length;
    return { proConResults, bookResults, totalCount };
  }
}
