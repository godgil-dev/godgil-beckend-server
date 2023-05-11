import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  isbn: string;

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
  link: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  cover: string;

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
