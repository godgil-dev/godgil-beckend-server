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
    isbn?: string,
  ) {
    let proConResults = [];
    let bookResults = [];

    if (type === 'all') {
      limit = 3;
      offset = 0;

      proConResults = await this.proConDiscussionsService
        .findAll({ limit, offset, query })
        .then(({ posts }) => posts);

      bookResults = await this.bookDiscussionsService
        .findAll({ limit, offset, userId, query })
        .then(({ posts }) => posts);

      const totalCount = proConResults.length + bookResults.length;
      return { proConResults, bookResults, totalCount };
    }

    if (type === 'proCon') {
      const { posts, totalCount } = await this.proConDiscussionsService.findAll(
        {
          limit,
          offset,
          query,
        },
      );

      return { proConResults: posts, bookResults, totalCount };
    }

    if (isbn && type === 'book') {
      const { posts, totalCount } =
        await this.bookDiscussionsService.findAllDiscussionsByIsbn({
          limit,
          offset,
          userId,
          isbn,
        });

      return { bookResults: posts, proConResults, totalCount };
    }

    if (type === 'book') {
      const { posts, totalCount } = await this.bookDiscussionsService.findAll({
        limit,
        offset,
        userId,
        query,
      });

      return { bookResults: posts, proConResults, totalCount };
    }
  }
}
