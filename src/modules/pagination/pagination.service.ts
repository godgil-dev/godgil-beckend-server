import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {
  createPageInfo(
    totalCount: number,
    page: number,
    limit: number,
    length: number,
  ) {
    const totalPage = Math.ceil(totalCount / limit);

    return {
      page,
      limit,
      totalCount,
      totalPage,
      currentCount: length,
    };
  }

  getOffset(page: number, limit: number) {
    return (page - 1) * limit;
  }
}
