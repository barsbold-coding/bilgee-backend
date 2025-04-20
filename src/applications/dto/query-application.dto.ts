import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { QueryDto } from 'src/globals/dto/query.dto';
import { ApplicationStatus } from 'src/models/application.model';

export class QueryApplicationDto extends QueryDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  internshipId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  studentId?: number;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}
