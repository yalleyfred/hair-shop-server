import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto, Products, UpdateProductDto } from 'src/Dtos/products.dto';
import { ProductsEntity } from 'src/entities/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(ProductsEntity)
        private readonly productRepository: Repository<Products>,
    ) {}

    public async findAll(): Promise<Products[]> {
        return await this.productRepository.find();
    }

    public async findOne(id: string): Promise<Products | null> {
        return await this.productRepository.findOneBy({id});
    }

    public async create(createProductDto: CreateProductDto, productUrl: string): Promise<Products> {
        const product = this.productRepository.create({...createProductDto, productUrl});
        return await this.productRepository.save(product);
    }

    public async update(id: string, updateProductDto: UpdateProductDto) {
        return await this.productRepository.update(id, updateProductDto);
    }

    public async remove(product: Products) {
        return await this.productRepository.softRemove(product);
    }
}
