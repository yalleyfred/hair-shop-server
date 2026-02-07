import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
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

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    public quantity: number;
}

export class UpdateProductDto extends CreateProductDto {}

export interface Products {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    productUrl: string;
}