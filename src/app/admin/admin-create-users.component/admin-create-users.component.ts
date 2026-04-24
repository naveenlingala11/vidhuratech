import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create-users.component.html',
  styleUrls: ['./admin-create-users.component.css']
})
export class AdminCreateUserComponent {

  API = `${environment.apiUrl}/api/users/employees`;

  form: any = {
    name: '',
    email: '',
    phone: '',
    role: ''
  };

  loading = false;

  roles = ['TRAINER', 'ADMIN', 'HR', 'MANAGER', 'MENTOR'];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  submit() {

    if (!this.validate()) return;

    this.loading = true;

    this.http.post(this.API, this.form)
      .subscribe({
        next: () => {
          this.toastr.success('Employee invited successfully', 'Success');
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to invite employee', 'Error');
          this.loading = false;
        }
      });
  }

  validate(): boolean {

    if (!this.form.name?.trim()) {
      this.toastr.warning('Name is required');
      return false;
    }

    if (!this.form.email?.trim()) {
      this.toastr.warning('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.form.email)) {
      this.toastr.warning('Invalid email format');
      return false;
    }

    if (!this.form.role) {
      this.toastr.warning('Please select a role');
      return false;
    }

    return true;
  }

  resetForm() {
    this.form = {
      name: '',
      email: '',
      phone: '',
      role: ''
    };
  }
}