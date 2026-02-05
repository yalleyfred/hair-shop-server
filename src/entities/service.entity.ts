import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ServiceCategoryEntity } from './service-category.entity';

@Entity('services')
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column()
  public description: string;

  @Column({ type: 'numeric' })
  public price: number;

  @Column({ type: 'int', nullable: true })
  public durationMinutes?: number;

  @Column()
  public categoryId: string;

  @ManyToOne(() => ServiceCategoryEntity, (category) => category.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  public category: ServiceCategoryEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
