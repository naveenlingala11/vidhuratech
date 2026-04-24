import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceTemplateComponent } from "../../admin/invoice-template/invoice-template";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, InvoiceTemplateComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) { }

  loading = signal(false);
  paymentInitiated = signal(false);
  paymentSuccess = signal(false);

  invoiceId = '';
  upiUrl = '';
  invoiceData: any = null;
  today = new Date();

  utrNumber = '';
  screenshotFile!: File;

  // STATUS CHECK
  statusPhone = '';
  statusInvoiceId = '';
  statusData: any = null;

  formData = {
    name: '',
    phone: '',
    email: '',
    city: '',
    experience: '',
    course: 'Python + DS',
    batch: 'May 2nd 2026 - 7:30 PM',
    amount: 2999
  };

  supportNumber = '9108057464';
  batchId = 0;
  activeBatch: any = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['course']) this.switchCourse(params['course']);
      if (params['batch']) this.formData.batch = params['batch'];
      if (params['batchId']) this.batchId = +params['batchId']; // ✅ ADD
    });
    // ✅ ADD THIS BLOCK
    const courseId = 2; // ⚠️ dynamic cheyyali later

    fetch(`${environment.apiUrl}/api/lms/batches/course/${courseId}/active`)
      .then(res => res.json())
      .then(res => {
        this.activeBatch = res.data;
        this.batchId = this.activeBatch.id; // fallback

        console.log("ACTIVE BATCH FROM API:", this.activeBatch);
      });
  }

  switchCourse(course: string) {
    this.formData.course = course;

    if (course.includes('Java')) {
      this.formData.amount = 3499;
      this.formData.batch = 'May 2nd 2026 - Java Batch';
    } else {
      this.formData.amount = 2999;
      this.formData.batch = 'May 2nd 2026 - Python Batch';
    }
  }

  startCheckoutAndPay() {
    if (!this.validate()) return;

    fetch(`${environment.apiUrl}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: this.formData,
        amount: this.formData.amount,
        paymentMethod: 'RAZORPAY',
        batchId: this.batchId
      })
    })
      .then(res => res.json())
      .then(data => {

        this.invoiceId = data.invoiceId;

        const options: any = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Vidhura Tech',
          description: this.formData.course,
          order_id: data.orderId,

          handler: async (response: any) => {

            this.zone.run(() => {

              // ✅ STEP 1: INSTANT SUCCESS UI
              this.paymentSuccess.set(true);

              // ✅ STEP 2: BACKGROUND PROCESS (NO WAIT)
              setTimeout(async () => {
                try {

                  this.invoiceData = {
                    id: this.invoiceId,
                    name: this.formData.name,
                    email: this.formData.email,
                    mobile: this.formData.phone,
                    studentAddress: this.formData.city,
                    course: this.formData.course,
                    batch: this.formData.batch,
                    amount: this.formData.amount,
                    discount: 0,
                    scholarship: 0,
                    paidAmount: this.formData.amount,
                    remainingAmount: 0,
                    paymentStatus: 'PAID',
                    paymentMethod: 'RAZORPAY'
                  };

                  this.cd.detectChanges();

                  await new Promise(res => setTimeout(res, 500));

                  const pdfBlob = await this.generateInvoicePdfBlob();

                  const formData = new FormData();
                  formData.append('invoiceId', this.invoiceId);
                  formData.append('razorpayOrderId', response.razorpay_order_id);
                  formData.append('razorpayPaymentId', response.razorpay_payment_id);
                  formData.append('razorpaySignature', response.razorpay_signature);
                  formData.append('invoicePdf', pdfBlob, `${this.invoiceId}.pdf`);
                  console.log("ACTIVE BATCH:", this.activeBatch);
                  const finalBatchId = this.activeBatch?.id || this.batchId;

                  if (!finalBatchId) {
                    alert("Batch not loaded. Try again.");
                    return;
                  }

                  formData.append('batchId', finalBatchId.toString());

                  await fetch(`${environment.apiUrl}/api/checkout/confirm`, {
                    method: 'POST',
                    body: formData
                  });

                } catch (e) {
                  console.error('Background process failed', e);
                }
              }, 0);

            });

          },

          prefill: {
            name: this.formData.name,
            email: this.formData.email,
            contact: this.formData.phone
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
  }

  async generateInvoicePdfBlob(): Promise<Blob> {

    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('invoice');

    if (!element) {
      throw new Error('Invoice element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    return pdf.output('blob');
  }

  goToAccess() {
    const token = localStorage.getItem('vt_token');

    if (token) {
      this.router.navigate(['/dashboard/student']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          email: this.formData.email,
          redirect: '/dashboard/student'
        }
      });
    }
  }

  openUpiIntent() {
    window.location.href = this.upiUrl;
  }

  onScreenshotUpload(event: any) {
    this.screenshotFile = event.target.files[0];
  }

  submitProof() {
    if (!this.utrNumber) {
      alert('Please enter UTR number');
      return;
    }

    const formData = new FormData();
    formData.append('invoiceId', this.invoiceId);
    formData.append('utrNumber', this.utrNumber);

    if (this.screenshotFile) {
      formData.append('screenshot', this.screenshotFile);
    }

    fetch(`${environment.apiUrl}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: this.formData,
        amount: this.formData.amount,
        paymentMethod: 'UPI',
        batchId: this.batchId
      })
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Request failed');
        }
        return res.json();
      })
      .then(data => {
        this.invoiceId = data.invoiceId;
        this.upiUrl = data.upiUrl;
        this.paymentInitiated.set(true);
      })
      .catch(err => {
        console.error(err);
        alert(err.message || 'Failed to initiate checkout');
      });
  }

  checkStatus() {
    if (!this.statusPhone || !this.statusInvoiceId) {
      alert('Enter Phone & Invoice ID');
      return;
    }

    fetch(
      `${environment.apiUrl}/api/checkout/status?phone=${this.statusPhone}&invoiceId=${this.statusInvoiceId}`
    )
      .then(res => res.json())
      .then(data => this.statusData = data)
      .catch(() => alert('Unable to fetch status'));
  }

  validate(): boolean {
    if (!this.formData.name || this.formData.name.length < 3) {
      alert('Enter valid name');
      return false;
    }

    if (!/^[6-9][0-9]{9}$/.test(this.formData.phone)) {
      alert('Enter valid mobile');
      return false;
    }

    return true;
  }

  get qrImageUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(this.upiUrl)}`;
  }

  startRazorpayPayment() {

    fetch(`${environment.apiUrl}/api/checkout/razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: this.formData.amount,
        batchId: this.batchId
      })
    })
      .then(res => res.json())
      .then(order => {

        const options: any = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'Vidhura Tech',
          description: this.formData.course,
          order_id: order.orderId,

          method: {
            upi: true,
            card: true,
            netbanking: true
          },

          handler: (response: any) => {

            fetch(`${environment.apiUrl}/api/checkout/confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: this.invoiceId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })
            })
              .then(res => {
                if (!res.ok) throw new Error('Verification failed');
                this.paymentSuccess.set(true);
              })
              .catch(() => {
                alert('Payment verification failed, contact support');
              });
          },

          prefill: {
            name: this.formData.name,
            email: this.formData.email,
            contact: this.formData.phone
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
  }
}