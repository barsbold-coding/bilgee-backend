import { IsInt, IsNotEmpty } from 'class-validator';

export class AddFavouriteDto {
  @IsNotEmpty()
  @IsInt()
  internshipId: number;
}
