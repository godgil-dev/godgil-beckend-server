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
    page: number,
    userId: number,
    query: string,
    type: string,
    isbn?: string,
  ) {
    let offset = (page - 1) * limit;

    if (type === 'all') {
      limit = 3;
      offset = 0;

      const proConResults = await this.proConDiscussionsService.findAll({
        limit,
        offset,
        query,
      });

      const bookResults = await this.bookDiscussionsService.findAll({
        limit,
        offset,
        userId,
        query,
      });

      return {
        proConResults: {
          posts: proConResults.posts,
          pageInfo: {
            page,
            totalCount: proConResults.totalCount,
            currentCount: proConResults.posts.length,
            totalPage: Math.ceil(proConResults.totalCount / limit),
          },
        },
        bookResults: {
          posts: bookResults.posts,
          pageInfo: {
            page,
            totalCount: bookResults.totalCount,
            currentCount: bookResults.posts.length,
            totalPage: Math.ceil(bookResults.totalCount / limit),
          },
        },
      };
    }

    if (type === 'proCon') {
      const { posts, totalCount } = await this.proConDiscussionsService.findAll(
        {
          limit,
          offset,
          query,
        },
      );

      return {
        proConResults: {
          posts,
          pageInfo: {
            page,
            totalCount,
            currentCount: posts.length,
            totalPage: Math.ceil(totalCount / limit),
          },
        },
        totalCount,
      };
    }

    if (isbn && type === 'book') {
      const { posts, totalCount } =
        await this.bookDiscussionsService.findAllDiscussionsByIsbn({
          limit,
          offset,
          userId,
          isbn,
        });

      return {
        bookResults: {
          posts,
          pageInfo: {
            page,
            totalCount,
            currentCount: posts.length,
            totalPage: Math.ceil(totalCount / limit),
          },
        },
        totalCount,
      };
    }

    if (type === 'book') {
      const { posts, totalCount } = await this.bookDiscussionsService.findAll({
        limit,
        offset,
        userId,
        query,
      });

      return {
        bookResults: {
          posts,
          pageInfo: {
            page,
            totalCount,
            currentCount: posts.length,
            totalPage: Math.ceil(totalCount / limit),
          },
        },
        totalCount,
      };
    }
  }
}
