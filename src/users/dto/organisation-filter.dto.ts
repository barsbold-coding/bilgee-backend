import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/globals/dto/query.dto';

export class OrganisationFilterDto extends QueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
