import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class bookDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  isbn: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  author: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  translator: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  image: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  publisher: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  pubdate: Date;

  @IsOptional()
  @IsString()
  @ApiProperty()
  category: string;
}

export class CreateBookDiscussionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @ValidateNested()
  @Type(() => bookDto)
  @ApiProperty({
    type: bookDto,
  })
  book: bookDto;
}
