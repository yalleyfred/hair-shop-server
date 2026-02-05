import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public description: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    public price: number;
}

export class UpdateProductDto extends CreateProductDto {}

export interface Products {
    id: string;
    name: string;
    description: string;
    price: number;
    productUrl: string;
}