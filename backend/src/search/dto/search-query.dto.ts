import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;
} 