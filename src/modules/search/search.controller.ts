import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { SearchAllDto } from './dto/search-all.dto';
import { Request } from 'express';

@ApiTags('sarch')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'isbn', type: String, required: false })
  @ApiQuery({ name: 'type', type: String, required: true })
  @ApiQuery({ name: 'query', type: String, required: false })
  @Public()
  @Get()
  async searchAll(
    @Query() searchAllDto: SearchAllDto,
    @Req() request: Request,
  ) {
    const { page, limit, query, type, isbn } = searchAllDto;

    const { proConResults, bookResults } = await this.searchService.searchAll(
      limit,
      page,
      request.user?.id || -1,
      query,
      type,
      isbn,
    );

    return {
      bookResults,
      proConResults,
    };
  }
}
