import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ServiceTypeEnum } from "src/models/bookings.model";


export class CreateBookingDto {
    @IsEnum(ServiceTypeEnum)
    @IsNotEmpty()
    public serviceType: ServiceTypeEnum;

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