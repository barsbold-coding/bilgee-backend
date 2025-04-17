import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExperienceDto } from './create-experience.dto';
import { CreateEducationDto } from './create-education.dto';

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsString()
  certifications?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  experiences?: CreateExperienceDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  education?: CreateEducationDto[];
}
