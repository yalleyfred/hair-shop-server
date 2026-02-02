import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
}
