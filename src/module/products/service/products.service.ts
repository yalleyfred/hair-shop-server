import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto, UpdateProductDto } from '../../../Dtos/products.dto';
import { ProductsEntity } from '../../../entities/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(ProductsEntity)
        private readonly productRepository: Repository<ProductsEntity>,
    ) {}

    public async findAll(): Promise<ProductsEntity[]> {
        return await this.productRepository.find();
    }

    public async findOne(id: string): Promise<ProductsEntity | null> {
        return await this.productRepository.findOneBy({id});
    }

    public async create(createProductDto: CreateProductDto, productUrl: string): Promise<ProductsEntity> {
        const product = this.productRepository.create({...createProductDto, productUrl});
        return await this.productRepository.save(product);
    }

    public async update(id: string, updateProductDto: UpdateProductDto, productUrl?: string) {
        return await this.productRepository.update(id, {...updateProductDto, productUrl});
    }

    public async remove(id: string) {
        return await this.productRepository.softDelete(id);
    }
}
