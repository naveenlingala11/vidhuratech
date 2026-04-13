import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  loading = signal(false);
  paymentInitiated = signal(false);
  paymentSuccess = signal(false);

  invoiceId = '';
  upiUrl = '';

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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['course']) this.switchCourse(params['course']);
      if (params['batch']) this.formData.batch = params['batch'];
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

  startCheckout() {
    if (!this.validate()) return;

    this.loading.set(true);

    fetch(`${environment.apiUrl}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: this.formData,
        amount: this.formData.amount,
        paymentMethod: 'UPI'
      })
    })
      .then(res => res.json())
      .then(data => {
        this.invoiceId = data.invoiceId;
        this.upiUrl = data.upiUrl;
        this.paymentInitiated.set(true);
      })
      .catch(() => alert('Failed to initiate checkout'))
      .finally(() => this.loading.set(false));
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

    fetch(`${environment.apiUrl}/api/checkout/submit-proof`, {
      method: 'POST',
      body: formData
    })
      .then(() => {
        alert('Payment proof submitted. Verification in progress.');

        this.statusPhone = this.formData.phone;
        this.statusInvoiceId = this.invoiceId;

        this.checkStatus();
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
}