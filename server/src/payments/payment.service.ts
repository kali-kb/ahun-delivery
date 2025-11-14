import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly verificationApiKey: string;
  private readonly verificationApiUrl = 'https://verifyapi.leulzenebe.pro/verify-telebirr';

  constructor() {
    this.verificationApiKey = process.env.RECIEPT_VERIFICATION_API || '';
  }

  async verifyTelebirrPayment(reference: string): Promise<any> {
    const response = await fetch(this.verificationApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${this.verificationApiKey}`,
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Validate the response structure
    if (!result.success || !result.data) {
      throw new Error('Invalid payment verification response');
    }

    // Validate that the receiver is "Kaleb Mate"
    const receiverName = result.data.creditedPartyName?.toLowerCase().trim();
    const expectedName = 'kaleb mate megane';
    
    if (receiverName !== expectedName) {
      throw new Error(`Payment was not made to the correct recipient. Expected: Kaleb Mate, Received: ${result.data.creditedPartyName}`);
    }

    // Validate transaction status
    if (result.data.transactionStatus !== 'Completed') {
      throw new Error(`Transaction is not completed. Status: ${result.data.transactionStatus}`);
    }

    return result;
  }
}
