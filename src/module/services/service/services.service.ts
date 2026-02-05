import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServiceDto, UpdateServiceDto } from '../../../Dtos/services.dto';
import { ServiceCategoryEntity } from '../../../entities/service-category.entity';
import { ServiceEntity } from '../../../entities/service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceItemsService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(ServiceCategoryEntity)
    private readonly categoryRepository: Repository<ServiceCategoryEntity>,
  ) {}

  public async findAll(): Promise<ServiceEntity[]> {
    return this.serviceRepository.find({ relations: ['category'] });
  }

  public async findOne(id: string): Promise<ServiceEntity | null> {
    return this.serviceRepository.findOne({ where: { id }, relations: ['category'] });
  }

  public async create(dto: CreateServiceDto): Promise<ServiceEntity> {
    await this.ensureCategoryExists(dto.categoryId);
    const service = this.serviceRepository.create(dto);
    return this.serviceRepository.save(service);
  }

  public async update(id: string, dto: UpdateServiceDto) {
    await this.ensureCategoryExists(dto.categoryId);
    return this.serviceRepository.update(id, dto);
  }

  public async remove(id: string) {
    return this.serviceRepository.softDelete(id);
  }

  private async ensureCategoryExists(categoryId: string) {
    const exists = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!exists) {
      throw new NotFoundException('Service category not found');
    }
  }
}
