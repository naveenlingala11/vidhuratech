import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class JobPostAdmin {

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

  loadCategories() {
    this.categories = ['IT', 'Non-IT', 'Core', 'Finance', 'HR'];
  }

  previewJob() {
    if (!this.jobForm.title || !this.jobForm.company) {
      alert('Fill required fields');
      return;
    }
    this.showPreview = true;
  }

  confirmPost() {
    this.showPreview = false;
    this.postJob();
  }

  postJob() {
    const payload = {
      title: this.jobForm.title,
      company: this.jobForm.company,
      location: this.jobForm.location,
      experience: this.jobForm.experience || 'N/A',
      jobType: this.jobForm.type,
      category: this.jobForm.category || 'IT',
      applyLink: this.jobForm.link,
      source: 'Admin',
    };

    fetch(`${environment.apiUrl}/jobs/admin/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => {
      alert('Job Posted ✅');

      this.jobForm = {
        title: '',
        company: '',
        location: '',
        experience: '',
        type: '',
        category: '',
        link: '',
      };
    });
  }

}
