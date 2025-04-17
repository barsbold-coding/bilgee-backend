import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { IPagination } from 'src/utils/pagination';

export class QueryDto implements IPagination {
  @IsArray()
  @ValidateNested({ each: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  interval?: [number, number];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
