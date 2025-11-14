import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';



@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('verify-telebirr')
  async verifyTelebirrPayment(@Body('reference') reference: string) {
    if (!reference) {
      throw new Error('Payment reference is required');
    }
    return this.paymentService.verifyTelebirrPayment(reference);
  }
}
