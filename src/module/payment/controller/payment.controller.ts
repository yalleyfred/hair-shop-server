import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

//   @UseGuards(JwtAuthGuard)
  @Post('mobile-money')
  public async initiateMomoPayment(@Body() paymentData: {
    amount: number;
    email: string;
    mobile_money: {
      phone: string;
      provider: string;
    };
    reference?: string;
    callback_url?: string;
  }) {
    return this.paymentService.initiateMobileMoneyPayment(paymentData);
  }

//   @UseGuards(JwtAuthGuard)
  @Post('bank-transfer')
  public async initiateBankTransfer(@Body() paymentData: {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
  }) {
    return this.paymentService.initiateBankTransfer(paymentData);
  }

//   @UseGuards(JwtAuthGuard)
  @Post('card-payment')
  public async initiateCardPayment(@Body() paymentData: {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
  }) {
    return this.paymentService.initiateCardPayment(paymentData);
  }

//   @UseGuards(JwtAuthGuard)
  @Get('verify/:reference')
  public async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

//   @UseGuards(JwtAuthGuard)
  @Get('transaction/:id')
  public async getTransactionStatus(@Param('id') id: number) {
    return this.paymentService.getTransactionStatus(id);
  }
}