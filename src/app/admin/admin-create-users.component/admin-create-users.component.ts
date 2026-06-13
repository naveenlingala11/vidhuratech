import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  
  form = {
    name: '',
    email: '',
    phone: '',
    role: ''
  };
  
  loading = false;
  roles = ['TRAINER', 'ADMIN', 'HR', 'MANAGER', 'MENTOR'];

  roleDescriptions: { [key: string]: string } = {
    'ADMIN': 'Grants full administrative access including admissions management, user directories, invoicing audits, system integrity configurations, and certificates verification.',
    'TRAINER': 'Grants permission to configure scheduling cohorts, track progress, broadcast batch announcements, upload syllabus milestones, and grade coding tasks.',
    'HR': 'Grants access to recruiting modules, allowing creation of jobs, coordination of hiring partners, and monitoring of applicant leads.',
    'MANAGER': 'Grants access to lead pipeline coordination, question database moderation, and general CRM components.',
    'MENTOR': 'Grants access to review student ATS resumes, oversee mock panel interview scores, and coordinate portfolio feedback.'
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
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

  goBack() {
    this.router.navigate(['/dashboard/admin/users']);
  }
}