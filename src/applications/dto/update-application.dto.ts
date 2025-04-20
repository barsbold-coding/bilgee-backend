import { IsEnum, IsOptional } from 'class-validator';
import { ApplicationStatus } from 'src/models/application.model';

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}
