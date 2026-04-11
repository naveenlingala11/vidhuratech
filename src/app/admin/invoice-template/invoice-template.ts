import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-invoice-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-template.html',
  styleUrls: ['./invoice-template.css']
})
export class InvoiceTemplateComponent {

  @Input() data: any;
  @Input() today: Date = new Date();

  get finalAmount(): number {
    return (
      Number(this.data?.amount || 0)
      - (Number(this.data?.amount || 0) * Number(this.data?.discount || 0) / 100)
      - Number(this.data?.scholarship || 0)
    );
  }

  get dynamicQrUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${this.data?.paymentStatus}-${this.data?.paymentMethod}-${this.finalAmount}`;
  }

  get qrTitle(): string {
    return this.data?.paymentStatus === 'Paid'
      ? 'Payment Verified'
      : 'Payment Pending';
  }

  get qrDescription(): string {
    return this.data?.paymentStatus === 'Paid'
      ? `Paid via ${this.data?.paymentMethod}`
      : `Scan to Pay via ${this.data?.paymentMethod}`;
  }

  get amountInWords(): string {
    return this.numberToWords(Math.round(this.finalAmount)) + ' Rupees Only';
  }

  numberToWords(num: number): string {
    const belowTwenty = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
      'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
      'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty',
      'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    if (num < 20) return belowTwenty[num];

    if (num < 100) {
      return tens[Math.floor(num / 10)] +
        (num % 10 ? ' ' + belowTwenty[num % 10] : '');
    }

    if (num < 1000) {
      return belowTwenty[Math.floor(num / 100)] +
        ' Hundred ' +
        (num % 100 ? this.numberToWords(num % 100) : '');
    }

    if (num < 100000) {
      return this.numberToWords(Math.floor(num / 1000)) +
        ' Thousand ' +
        (num % 1000 ? this.numberToWords(num % 1000) : '');
    }

    if (num < 10000000) {
      return this.numberToWords(Math.floor(num / 100000)) +
        ' Lakh ' +
        (num % 100000 ? this.numberToWords(num % 100000) : '');
    }

    return this.numberToWords(Math.floor(num / 10000000)) +
      ' Crore ' +
      (num % 10000000 ? this.numberToWords(num % 10000000) : '');
  }

  getStampClass(): string {

    switch ((this.data?.paymentStatus || '').toUpperCase()) {
      case 'PAID':
        return 'stamp-paid';

      case 'PENDING':
        return 'stamp-pending';

      case 'PARTIAL':
        return 'stamp-partial';

      case 'CANCELLED':
        return 'stamp-cancelled';

      default:
        return '';
    }
  }
}