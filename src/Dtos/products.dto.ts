import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public description: string;

    @IsNumber()
    @IsNotEmpty()
    public price: number;

    @IsString()
    @IsNotEmpty()
    public productUrl: string;
}

export class UpdateProductDto extends CreateProductDto {}

export interface Products {
    id: string;
    name: string;
    description: string;
    price: number;
    productUrl: string;
}