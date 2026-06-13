import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class JobPostAdmin implements OnInit {
  jobForm = {
    title: '',
    company: '',
    location: '',
    experience: '',
    type: '',
    category: '',
    link: '',
  };

  categories: string[] = [];
  showPreview = false;
  selectedCity = '';
  fromDate = '';
  toDate = '';
  cities: string[] = [];

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categories = ['IT', 'Non-IT', 'Core', 'Finance', 'HR'];
  }

  previewJob() {
    if (!this.jobForm.title || !this.jobForm.company || !this.jobForm.type) {
      this.errorMessage = 'Please fill all required fields (Job Title, Company, and Job Type).';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }
    this.showPreview = true;
  }

  confirmPost() {
    this.showPreview = false;
    this.postJob();
  }

  postJob() {
    if (!this.jobForm.title || !this.jobForm.company || !this.jobForm.type) {
      this.errorMessage = 'Please fill all required fields before posting.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    const payload = {
      title: this.jobForm.title,
      company: this.jobForm.company,
      location: this.jobForm.location || 'Remote',
      experience: this.jobForm.experience || 'N/A',
      jobType: this.jobForm.type,
      category: this.jobForm.category || 'IT',
      applyLink: this.jobForm.link || '',
      source: 'Admin',
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/jobs/admin/add`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Job "${payload.title}" at ${payload.company} posted successfully!`;
        setTimeout(() => this.successMessage = '', 4000);
        this.jobForm = {
          title: '',
          company: '',
          location: '',
          experience: '',
          type: '',
          category: '',
          link: '',
        };
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to post job. Please try again.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
}
