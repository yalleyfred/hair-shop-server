import { Inject, Injectable } from '@nestjs/common';
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
        return this.productRepository.find();
    }

    public async findOne(id: string): Promise<Products | null> {
        return this.productRepository.findOneBy({id});
    }

    public create(createProductDto: CreateProductDto): Promise<Products> {
        const product = this.productRepository.create(createProductDto);
        return this.productRepository.save(product);
    }

    public update(id: string, updateProductDto: UpdateProductDto) {
        return this.productRepository.update(id, updateProductDto);
    }

    public remove(product: Products) {
        return this.productRepository.softRemove(product);
    }
}
