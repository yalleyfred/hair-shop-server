import { IsArray, IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
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
}

export class MobileMoneyOtpDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
