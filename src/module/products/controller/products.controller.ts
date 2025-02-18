import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductsService } from '../service/products.service';
import { CreateProductDto, Products, UpdateProductDto } from 'src/Dtos/products.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    public findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    public create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Put(':id')
    public update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }   

    @Delete(':id')
    public remove(@Body() products: Products) {
        return this.productsService.remove(products);
    }
}
