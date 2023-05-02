import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(50)
  limit = 10;
}
