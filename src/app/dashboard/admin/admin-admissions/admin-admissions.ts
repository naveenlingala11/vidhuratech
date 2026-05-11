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

  form: any = {

    name: '',
    email: '',
    phone: '',

    batchId: '',

    amount: '',

    paymentMethod: 'CASH',

    paymentStatus: 'PAID'
  };

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches() {

    this.http.get<any>(
      `${environment.apiUrl}/api/lms/batches`
    ).subscribe({

      next: (res) => {

        console.log(res);

        this.batches = res?.data || [];
      },

      error: (err) => {

        console.error(err);

        alert('Failed to load batches');
      }
    });
  }

  submit() {

    if (!this.validate()) return;

    this.loading = true;

    this.http.post<any>(
      `${environment.apiUrl}/api/admin/admissions`,
      this.form
    ).subscribe({

      next: (res: any) => {

        console.log(res);

        const data = res?.data;

        let message = ` Admission Created Successfully

                        Student Email:
                        ${data?.studentEmail}

                        Student Created:
                        ${data?.studentCreated}

                        Existing Student:
                        ${data?.existingStudent}

                        Enrollment Created:
                        ${data?.enrollmentCreated}

                        Invoice Generated:
                        ${data?.invoiceGenerated}

                        Mail Status:
                        ${data?.setupPasswordStatus}

                        Next Step:
                        ${data?.nextStep} `;

        alert(message);

        this.reset();

        this.loading = false;
      },

      error: (err) => {

        console.error(err);

        alert(
          err?.error?.message ||
          'Admission failed'
        );

        this.loading = false;
      }
    });
  }

  validate(): boolean {

    if (!this.form.name) {
      alert('Name required');
      return false;
    }

    if (!this.form.email) {
      alert('Email required');
      return false;
    }

    if (!this.form.phone) {
      alert('Phone required');
      return false;
    }

    if (!this.form.batchId) {
      alert('Select batch');
      return false;
    }

    if (!this.form.amount) {
      alert('Amount required');
      return false;
    }

    return true;
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