import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsNumber()
  internshipId: number;
}
