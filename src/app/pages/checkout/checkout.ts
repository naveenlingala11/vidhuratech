import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceTemplateComponent } from "../../admin/invoice-template/invoice-template";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HttpClient } from '@angular/common/http';
import { CourseService } from '../../features/lms/course/services/course';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, InvoiceTemplateComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private courseService: CourseService   // ✅ ADD THIS

  ) { }

  loading = signal(false);
  paymentInitiated = signal(false);
  paymentSuccess = signal(false);
  currentStep = signal(1);
  selectedMethod: 'CARD' | 'UPI' | 'NETBANKING' = 'UPI';

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
    course: '',
    batch: '',
    amount: 0
  };

  supportNumber = '9108057464';
  batchId = 0;
  activeBatch: any = null;
  coursesList: any[] = [];

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params['batch']) this.formData.batch = params['batch'];

      if (params['batchId']) {
        this.batchId = +params['batchId'];
        localStorage.setItem("batchId", this.batchId.toString());
      }
    });

    // fallback
    const storedBatch = localStorage.getItem("batchId");
    if (storedBatch) {
      this.batchId = +storedBatch;
    }

    this.loadCourses(); // 👈 IMPORTANT (courses first)
  }

  selectCourse(course: any) {
    this.formData.course = course.title;
    this.formData.amount = course.price;

    this.activeBatch = course.activeBatch || null;
    this.batchId = this.activeBatch?.id || 0;
    this.formData.batch = this.activeBatch?.name || '';

    if (this.batchId) {
      localStorage.setItem('batchId', this.batchId.toString());
    }
  }

  // VALIDATION
  isValidPhone() {
    return /^[6-9][0-9]{9}$/.test(this.formData.phone);
  }

  isValidEmail() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email);
  }

  // STEPPER
  nextStep() {
    if (this.currentStep() === 1 && (!this.isValidPhone() || !this.isValidEmail())) {
      alert("Enter valid details");
      return;
    }
    this.currentStep.update(v => v + 1);
  }

  prevStep() {
    this.currentStep.update(v => v - 1);
  }

  loadCourses() {
    this.http.get<any>(`${environment.apiUrl}/api/public/courses`)
      .subscribe({
        next: (res) => {
          const list = res?.data || [];

          if (!list.length) {
            this.coursesList = [];
            return;
          }

          const activeChecks: Observable<any | null>[] = list.map((c: any) =>
            this.http.get<any>(`${environment.apiUrl}/api/lms/batches/course/${c.id}/active`)
              .pipe(
                map(batchRes => ({
                  id: c.id,
                  title: c.title,
                  price: c.price,
                  activeBatch: batchRes?.data || null
                })),
                catchError(() => of(null))
              )
          );

          forkJoin(activeChecks).subscribe((courses: any[]) => {
            this.coursesList = courses.filter(c =>
              c && c.activeBatch && c.activeBatch.status === 'ACTIVE'
            );

            const selectedCourseId = this.route.snapshot.queryParamMap.get('courseId');
            const selectedCourseTitle = this.route.snapshot.queryParamMap.get('course');

            let match = null;

            if (selectedCourseId) {
              match = this.coursesList.find(c => c.id === Number(selectedCourseId));
            }

            if (!match && selectedCourseTitle) {
              match = this.coursesList.find(c => c.title === selectedCourseTitle);
            }

            if (match) {
              this.selectCourse(match);
              return;
            }

            if (this.coursesList.length) {
              this.selectCourse(this.coursesList[0]);
            }
          });
        },
        error: () => {
          console.error('Failed to load courses');
        }
      });
  }

  startCheckoutAndPay() {
    if (!this.validate()) return;
    // ✅ ALWAYS STORE BEFORE PAYMENT
    localStorage.setItem("batchId", this.batchId.toString());
    if (!this.batchId) {
      alert("No active batch for selected course");
      return;
    }
    console.log("🚀 Sending batchId:", this.batchId);
    this.loading.set(true);

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
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      }).then(data => {

        this.loading.set(false);
        this.invoiceId = data.invoiceId;

        const options: any = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Vidhura Tech',
          description: this.formData.course,
          order_id: data.orderId,

          // ✅ MAIN SUCCESS HANDLER
          handler: async (response: any) => {
            try {

              // 🔐 STEP 1: VERIFY SIGNATURE
              const verifyRes = await fetch(
                `${environment.apiUrl}/api/checkout/verify-payment`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response)
                }
              );

              if (!verifyRes.ok) {
                throw new Error("Signature verification failed");
              }

              // ✅ STEP 2: SAFE SUCCESS FLOW
              this.zone.run(async () => {
                await this.callConfirm(response);
              });

            } catch (err) {
              console.error("Verification failed", err);
              alert("Payment verification failed. Contact support.");
            }
          },

          // ❗ VERY IMPORTANT
          modal: {
            ondismiss: () => {
              this.zone.run(() => {
                console.warn("User closed payment popup");
                this.loading.set(false);
                this.paymentInitiated.set(false);
                alert("Payment cancelled");
              });
            }
          },

          retry: {
            enabled: true
          },

          prefill: {
            name: this.formData.name,
            email: this.formData.email,
            contact: this.formData.phone
          }
        };

        const rzp = new (window as any).Razorpay(options);

        // ❗ HANDLE FAILURES
        rzp.on('payment.failed', (response: any) => {
          console.error("Payment failed:", response.error);

          this.zone.run(() => {
            this.loading.set(false);
            this.paymentInitiated.set(false);
            alert("Payment failed: " + response.error.description);
          });
        });

        rzp.open();
      })
      .catch(err => {
        console.error(err);
        this.loading.set(false);
        alert("Unable to start payment");
      });
  }

  async callConfirm(response: any) {

    try {

      // ✅ SHOW SUCCESS UI FIRST
      this.paymentSuccess.set(true);

      // 🔄 WAIT FOR UI RENDER
      await new Promise(res => setTimeout(res, 400));

      // 🧾 BUILD INVOICE DATA
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

      await new Promise(res => setTimeout(res, 400));

      const pdfBlob = await this.generateInvoicePdfBlob();

      const formData = new FormData();
      formData.append('invoiceId', this.invoiceId);
      formData.append('razorpayOrderId', response.razorpay_order_id);
      formData.append('razorpayPaymentId', response.razorpay_payment_id);
      formData.append('razorpaySignature', response.razorpay_signature);
      formData.append('invoicePdf', pdfBlob, `${this.invoiceId}.pdf`);

      const finalBatchId =
        this.activeBatch?.id ||
        this.batchId ||
        Number(localStorage.getItem("batchId"));

      formData.append('batchId', finalBatchId.toString());

      await fetch(`${environment.apiUrl}/api/checkout/confirm`, {
        method: 'POST',
        body: formData
      });

      console.log("✅ Payment confirmed + invoice sent");

    } catch (err) {
      console.error("Confirm failed:", err);
      alert("Payment processed but confirmation failed. Contact support.");
    }
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
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      }).then(data => this.statusData = data)
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
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      }).then(order => {

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

  payNow() {
    this.http.post<any>('http://localhost:8080/api/checkout/create-order?amount=500', {})
      .subscribe(order => {

        const options: any = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'Vidhura Tech',
          description: 'Course Payment',
          order_id: order.orderId,

          handler: (response: any) => {

            this.http.post('http://localhost:8080/api/checkout/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }).subscribe({
              next: () => alert('✅ Payment Success'),
              error: () => alert('❌ Verification failed')
            });
          },

          modal: {
            ondismiss: () => {
              alert('Payment cancelled');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
  }

}