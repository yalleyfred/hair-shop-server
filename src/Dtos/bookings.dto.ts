import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ServiceType, ServiceTypeEnum } from "src/models/bookings.model";


export class CreateBookingDto {
    @IsNotEmpty()
    @IsEnum(ServiceTypeEnum)
    public serviceType: ServiceTypeEnum;

    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @IsNotEmpty()
    @IsDate()
    public appointmentDate: Date;

    @IsString()
    @IsNotEmpty()
    public appointmentTime: string;

    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public email: string;

    @IsString()
    @IsNotEmpty()
    public phone: string;
    
}

export class UpdateBookingDto extends CreateBookingDto {}