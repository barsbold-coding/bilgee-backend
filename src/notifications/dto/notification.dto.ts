import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { QueryDto } from 'src/globals/dto/query.dto';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  metadata: any;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  seenAt?: Date;
}

export class NotificationQueryDto extends QueryDto {
  @IsOptional()
  @IsBoolean()
  seen?: boolean;
}
