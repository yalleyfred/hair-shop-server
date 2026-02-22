import { IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentProductItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class ServiceBookingMetadataDto {
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  appointmentDate: string;

  @IsString()
  @IsNotEmpty()
  appointmentTime: string;
}

export class PaymentMetadataDto {
  @IsString()
  @IsOptional()
  @IsIn(['product_purchase', 'service_booking'])
  orderType?: 'product_purchase' | 'service_booking';

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ValidateNested()
  @Type(() => ServiceBookingMetadataDto)
  @IsOptional()
  booking?: ServiceBookingMetadataDto;
}

export class MobileMoneyDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  provider: string; // MTN, VODAFONE, AIRTEL
}

export class MobileMoneyPaymentDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => MobileMoneyDto)
  mobile_money: MobileMoneyDto;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  callback_url?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentProductItemDto)
  @IsOptional()
  products?: PaymentProductItemDto[];

  @ValidateNested()
  @Type(() => PaymentMetadataDto)
  @IsOptional()
  metadata?: PaymentMetadataDto;
}

export class BankTransferPaymentDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  callback_url?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentProductItemDto)
  @IsOptional()
  products?: PaymentProductItemDto[];

  @ValidateNested()
  @Type(() => PaymentMetadataDto)
  @IsOptional()
  metadata?: PaymentMetadataDto;
}

export class CardPaymentDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  callback_url?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentProductItemDto)
  @IsOptional()
  products?: PaymentProductItemDto[];

  @ValidateNested()
  @Type(() => PaymentMetadataDto)
  @IsOptional()
  metadata?: PaymentMetadataDto;
}

export class MobileMoneyOtpDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
