import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import UserRequest from '../auth/types/user-request.interface';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public.decorator';

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
  @ApiQuery({ name: 'type', type: String, required: false })
  @Public()
  @Get()
  async searchAll(
    @Query('query') query: string,
    @Query('type') type: string,
    @Req() request: UserRequest,
    @Query() paginationQueryDto?: PaginationQueryDto,
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.authService.getUserFromToken(token);

    console.log(paginationQueryDto, paginationQueryDto.page);

    const { page, limit } = paginationQueryDto;
    const offset = (page - 1) * limit;
    const { proConResults, bookResults, totalCount } =
      await this.searchService.searchAll(
        limit,
        offset,
        user?.id || -1,
        query,
        type,
      );

    return {
      proConResults,
      bookResults,
      pageInfo: {
        page,
        totalCount,
        currentCount: proConResults.length + bookResults.length,
        totalPage: Math.ceil(totalCount / limit),
      },
    };
  }
}
