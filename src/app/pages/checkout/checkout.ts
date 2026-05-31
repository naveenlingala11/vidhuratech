import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceTemplateComponent } from '../../admin/invoice-template/invoice-template';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InvoiceTemplateComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  loading = signal(false);
  pageLoading = signal(true);
  paymentSuccess = signal(false);

  invoiceId = '';
  invoiceData: any = null;
  today = new Date();

  supportNumber = '9108057464';

  selectedCourse: any = null;
  activeBatch: any = null;
  batchId = 0;

  formErrors: Record<string, string> = {};

  formData = {
    name: '',
    phone: '',
    email: '',
    city: '',
    experience: '',
    course: '',
    batch: '',
    amount: 0,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSelectedCourseOnly();
  }

  loadSelectedCourseOnly(): void {
    this.pageLoading.set(true);

    const courseId = Number(this.route.snapshot.queryParamMap.get('courseId'));
    const batchId = Number(this.route.snapshot.queryParamMap.get('batchId'));

    if (!courseId) {
      this.pageLoading.set(false);
      return;
    }

    forkJoin({
      coursesRes: this.http.get<any>(`${environment.apiUrl}/api/public/courses`),
      batchRes: this.http
        .get<any>(`${environment.apiUrl}/api/lms/batches/course/${courseId}/active`)
        .pipe(catchError(() => of({ data: null }))),
    }).subscribe({
      next: ({ coursesRes, batchRes }) => {
        const courses = coursesRes?.data || [];
        const course = courses.find((item: any) => Number(item.id) === courseId);
        const activeBatch = batchRes?.data || null;

        if (!course || !activeBatch) {
          this.selectedCourse = null;
          this.activeBatch = null;
          this.pageLoading.set(false);
          return;
        }

        this.selectedCourse = this.mapCourse(course, activeBatch);
        this.activeBatch = activeBatch;
        this.batchId = Number(batchId || activeBatch.id);

        this.formData.course = this.selectedCourse.title;
        this.formData.batch = activeBatch.name;
        this.formData.amount = Number(this.selectedCourse.price || 0);

        localStorage.setItem('batchId', String(this.batchId));

        this.pageLoading.set(false);
      },
      error: () => {
        this.selectedCourse = null;
        this.activeBatch = null;
        this.pageLoading.set(false);
      },
    });
  }

  mapCourse(course: any, activeBatch: any): any {
    let meta: any = {};

    try {
      meta = course.metadataJson ? JSON.parse(course.metadataJson) : {};
    } catch {
      meta = {};
    }

    return {
      id: Number(course.id),
      code: course.code,
      title: course.title,
      description: course.description || '',
      price: Number(course.price || 0),
      oldPrice: meta.oldPrice || Math.round(Number(course.price || 0) * 1.4),
      discountLabel: meta.discountLabel || '',
      level: course.level || '',
      durationHours: Number(course.durationHours || 0),
      duration: `${course.durationHours || 0} hrs`,
      thumbnailUrl: course.thumbnailUrl || '',
      highlights: meta.highlights || [],
      outcomes: meta.outcomes || [],
      activeBatch,
    };
  }

  courseImage(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }

  isValidPhone(): boolean {
    return /^[6-9][0-9]{9}$/.test(this.formData.phone || '');
  }

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email || '');
  }

  validate(): boolean {
    this.formErrors = {};

    if (!this.selectedCourse?.id) {
      this.formErrors['course'] = 'Selected course is not available for checkout';
    }

    if (!this.activeBatch?.id) {
      this.formErrors['batch'] = 'No active batch available for this course';
    }

    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.formErrors['name'] = 'Enter valid full name';
    }

    if (!this.isValidPhone()) {
      this.formErrors['phone'] = 'Enter valid 10 digit mobile number';
    }

    if (!this.isValidEmail()) {
      this.formErrors['email'] = 'Enter valid email address';
    }

    if (!this.formData.city || this.formData.city.trim().length < 2) {
      this.formErrors['city'] = 'Enter city';
    }

    if (!this.formData.experience) {
      this.formErrors['experience'] = 'Select experience';
    }

    if (!this.formData.amount || this.formData.amount <= 0) {
      this.formErrors['amount'] = 'Invalid course amount';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  canPay(): boolean {
    return (
      !!this.selectedCourse?.id &&
      !!this.activeBatch?.id &&
      !!this.formData.amount &&
      !!this.formData.name &&
      !!this.formData.city &&
      !!this.formData.experience &&
      this.isValidPhone() &&
      this.isValidEmail()
    );
  }

  startCheckoutAndPay(): void {
    if (!this.validate()) return;

    this.loading.set(true);

    fetch(`${environment.apiUrl}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: this.formData,
        amount: this.formData.amount,
        paymentMethod: 'RAZORPAY',
        batchId: this.batchId,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Unable to start payment');
        }

        return res.json();
      })
      .then((data) => {
        this.loading.set(false);
        this.invoiceId = data.invoiceId;

        const options: any = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Vidhura Tech',
          description: this.formData.course,
          order_id: data.orderId,
          prefill: {
            name: this.formData.name,
            email: this.formData.email,
            contact: this.formData.phone,
          },
          notes: {
            courseId: this.selectedCourse.id,
            course: this.formData.course,
            batchId: this.batchId,
            batch: this.formData.batch,
          },
          modal: {
            ondismiss: () => {
              this.zone.run(() => {
                this.loading.set(false);
                alert('Payment cancelled');
              });
            },
          },
          retry: {
            enabled: true,
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch(`${environment.apiUrl}/api/checkout/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              });

              if (!verifyRes.ok) {
                throw new Error('Signature verification failed');
              }

              this.zone.run(async () => {
                await this.callConfirm(response);
              });
            } catch (err) {
              console.error(err);
              alert('Payment verification failed. Contact support.');
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
          this.zone.run(() => {
            this.loading.set(false);
            alert('Payment failed: ' + response.error.description);
          });
        });

        rzp.open();
      })
      .catch((err) => {
        this.loading.set(false);
        alert(err.message || 'Unable to start payment');
      });
  }

  async callConfirm(response: any): Promise<void> {
    try {
      this.paymentSuccess.set(true);

      await new Promise((resolve) => setTimeout(resolve, 400));

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
        paymentMethod: 'RAZORPAY',
      };

      this.cd.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 400));

      const pdfBlob = await this.generateInvoicePdfBlob();

      const formData = new FormData();
      formData.append('invoiceId', this.invoiceId);
      formData.append('razorpayOrderId', response.razorpay_order_id);
      formData.append('razorpayPaymentId', response.razorpay_payment_id);
      formData.append('razorpaySignature', response.razorpay_signature);
      formData.append('invoicePdf', pdfBlob, `${this.invoiceId}.pdf`);
      formData.append('batchId', String(this.batchId));

      const confirmRes = await fetch(`${environment.apiUrl}/api/checkout/confirm`, {
        method: 'POST',
        body: formData,
      });

      if (!confirmRes.ok) {
        throw new Error('Payment confirmation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Payment processed but confirmation failed. Contact support.');
    }
  }

  async generateInvoicePdfBlob(): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = document.getElementById('invoice');

    if (!element) {
      throw new Error('Invoice element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    return pdf.output('blob');
  }

  goToAccess(): void {
    const token = localStorage.getItem('vt_token');

    if (token) {
      this.router.navigate(['/dashboard/student']);
      return;
    }

    this.router.navigate(['/login'], {
      queryParams: {
        email: this.formData.email,
        redirect: '/dashboard/student',
      },
    });
  }
}
