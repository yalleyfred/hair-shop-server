import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from '../../../Dtos/services.dto';
import { ServiceCategoryEntity } from '../../../entities/service-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategoryEntity)
    private readonly categoryRepository: Repository<ServiceCategoryEntity>,
  ) {}

  public async findAll(): Promise<ServiceCategoryEntity[]> {
    return this.categoryRepository.find({ relations: ['services'] });
  }

  public async findOne(id: string): Promise<ServiceCategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id }, relations: ['services'] });
  }

  public async create(dto: CreateServiceCategoryDto): Promise<ServiceCategoryEntity> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  public async update(id: string, dto: UpdateServiceCategoryDto) {
    return this.categoryRepository.update(id, dto);
  }

  public async remove(id: string) {
    return this.categoryRepository.softDelete(id);
  }
}
