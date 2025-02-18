import { ServiceTypeEnum } from "src/models/bookings.model";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('boookings')
export class BookingsEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public serviceType: ServiceTypeEnum;

    @Column({ type: 'timestamptz' })
    public appointmentDate: Date;

    @Column({ type: 'time' })
    public appointmentTime: string;

    @Column()
    public name: string;

    @Column()
    public email: string;

    @Column()
    public phone: string;
}