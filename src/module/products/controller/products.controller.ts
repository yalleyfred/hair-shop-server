import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from '../service/products.service';
import { CreateProductDto, Products, UpdateProductDto } from 'src/Dtos/products.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService, private cloudinaryService: CloudinaryService) {}

    @Get()
    public findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    public async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            throw new Error('Only image files are allowed!');
          }
          const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
        const product = await this.productsService.create(createProductDto);
        return {
            ...product,
            image: cloudinaryResponse.secure_url
        }
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
