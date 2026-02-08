import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_events')
export class PaymentEventEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public reference: string;

  @Column()
  public status: string;

  @Column({ type: 'jsonb', nullable: true })
  public payload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;
}
