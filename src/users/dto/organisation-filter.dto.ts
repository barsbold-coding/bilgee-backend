import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryDto } from 'src/globals/dto/query.dto';

export class OrganisationFilterDto extends QueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  verified?: boolean;
}
