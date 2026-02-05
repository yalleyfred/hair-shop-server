import { Controller, Post, Body, Get, Param, ParseIntPipe, Headers, HttpCode } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { BankTransferPaymentDto, CardPaymentDto, MobileMoneyOtpDto, MobileMoneyPaymentDto } from '../dto/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('mobile-money')
  public async initiateMomoPayment(@Body() paymentData: MobileMoneyPaymentDto) {
    return this.paymentService.initiateMobileMoneyPayment(paymentData);
  }

  @Post('mobile-money/otp')
  public async submitMomoOtp(@Body() otpData: MobileMoneyOtpDto) {
    return this.paymentService.submitMobileMoneyOtp(otpData.reference, otpData.otp);
  }

  @Post('bank-transfer')
  public async initiateBankTransfer(@Body() paymentData: BankTransferPaymentDto) {
    return this.paymentService.initiateBankTransfer(paymentData);
  }

  @Post('card-payment')
  public async initiateCardPayment(@Body() paymentData: CardPaymentDto) {
    return this.paymentService.initiateCardPayment(paymentData);
  }

  @Get('verify/:reference')
  public async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

  @Get('transaction/:id')
  public async getTransactionStatus(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getTransactionStatus(id);
  }

  @Post('webhook')
  @HttpCode(200)
  public async handleWebhook(@Body() payload: unknown, @Headers('x-paystack-signature') signature?: string) {
    return this.paymentService.handleWebhook(payload, signature);
  }
}