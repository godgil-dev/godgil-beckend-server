import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';

export class ListBookDiscussionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  sortBy: 'lastest' | 'popular' = 'lastest';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  myPostsOnly = false;
}
