import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-admin-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-admissions.html',
  styleUrls: ['./admin-admissions.css']
})
export class AdminAdmissionsComponent implements OnInit {
  batches: any[] = [];
  loading = false;
  
  successMessage = '';
  errorMessage = '';
  showSuccessModal = false;
  successData: any = null;
  lastAdmittedEmail = '';

  form: any = {
    name: '',
    email: '',
    phone: '',
    batchId: '',
    amount: '',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID'
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches() {
    this.loading = true;
    this.http.get<any>(
      `${environment.apiUrl}/api/lms/batches`
    ).subscribe({
      next: (res) => {
        this.batches = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to load active training batches.');
        this.loading = false;
      }
    });
  }

  submit() {
    if (!this.validate()) return;
    this.loading = true;
    this.errorMessage = '';
    
    this.http.post<any>(
      `${environment.apiUrl}/api/admin/admissions`,
      this.form
    ).subscribe({
      next: (res: any) => {
        const data = res?.data;
        this.successData = data;
        this.lastAdmittedEmail = this.form.email;
        this.showSuccessModal = true;
        this.reset();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError(err?.error?.message || 'Failed to complete admission process.');
        this.loading = false;
      }
    });
  }

  validate(): boolean {
    if (!this.form.name) {
      this.showError('Student Name is required.');
      return false;
    }
    if (!this.form.email) {
      this.showError('Student Email Address is required.');
      return false;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.form.email)) {
      this.showError('Please enter a valid Email Address.');
      return false;
    }
    if (!this.form.phone) {
      this.showError('Contact Phone Number is required.');
      return false;
    }
    if (!this.form.batchId) {
      this.showError('Please select a target training batch.');
      return false;
    }
    if (!this.form.amount || this.form.amount <= 0) {
      this.showError('Please enter a valid positive admission amount.');
      return false;
    }
    return true;
  }

  showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => {
      if (this.errorMessage === msg) {
        this.errorMessage = '';
      }
    }, 5000);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successData = null;
  }

  reset() {
    this.form = {
      name: '',
      email: '',
      phone: '',
      batchId: '',
      amount: '',
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    };
  }
}