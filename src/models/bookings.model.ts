export enum ServiceTypeEnum {
    twisting = 'twisting'
}

export interface Bookings {
    id: string;
    serviceType: ServiceTypeEnum;
    appointmentDate: Date;
    appointmentTime: string;
    name: string;
    email: string;
    phone: string;
}

export type ServiceType = {
    name: ServiceTypeEnum;
    price: number;
}