import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/globals/dto/query.dto';

export class QueryInternshipDto extends QueryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  employerId?: number;
}
