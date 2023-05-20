import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import UserRequest from '../auth/types/user-request.interface';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public.decorator';
import { SearchAllDto } from './dto/search-all.dto';

@ApiTags('sarch')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly authService: AuthService,
  ) {}

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
    @Req() request: UserRequest,
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
      proConResults,
      bookResults,
    };
  }
}
