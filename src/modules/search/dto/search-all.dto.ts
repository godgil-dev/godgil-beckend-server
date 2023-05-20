import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/shared/dto/pagenation-query.dto';

export class SearchAllDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsIn(['all', 'book', 'proCon'])
  type: string;

  @IsString()
  @IsOptional()
  isbn?: string;
}
