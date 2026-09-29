import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  vin?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;
}