import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class UpdateServiceCategoryDto extends CreateServiceCategoryDto {}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsNumber()
  @IsNotEmpty()
  public price: number;

  @IsNumber()
  @IsOptional()
  public durationMinutes?: number;

  @IsUUID()
  @IsNotEmpty()
  public categoryId: string;
}

export class UpdateServiceDto extends CreateServiceDto {}
