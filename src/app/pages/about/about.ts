import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalService } from '../../services/modal';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  constructor(
    private modalService: ModalService,
    private http: HttpClient
  ) { }

  contactData = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  submitting = false;
  successMessage = '';
  errorMessage = '';

  submitContact() {
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/api/public/contact`, this.contactData)
      .subscribe({
        next: () => {
          this.successMessage = 'Message sent successfully. Our team will contact you soon.';

          this.contactData = {
            name: '',
            email: '',
            phone: '',
            message: '',
          };

          this.submitting = false;

          setTimeout(() => {
            this.successMessage = '';
          }, 4500);
        },
        error: () => {
          this.errorMessage = 'Message not sent. Please try again after some time.';
          this.submitting = false;

          setTimeout(() => {
            this.errorMessage = '';
          }, 4500);
        }
      });
  }

  features = [
    { title: 'Industry Based Training', desc: 'Courses designed based on real industry requirements.' },
    { title: 'Hands-on Projects', desc: 'Work on real world mini and major projects.' },
    { title: 'Interview Preparation', desc: 'Mock interviews and resume preparation.' },
    { title: 'Placement Guidance', desc: 'Support until you get placed in IT companies.' },
  ];

  workflow = [
    { step: '01', title: 'Enroll', desc: 'Join the course with structured roadmap.' },
    { step: '02', title: 'Learn', desc: 'Get strong fundamentals with live training.' },
    { step: '03', title: 'Practice', desc: 'Work on real-time projects.' },
    { step: '04', title: 'Get Placed', desc: 'Crack interviews with confidence.' },
  ];

  successStories = [
    {
      name: 'Ravi Kumar',
      role: 'Software Developer',
      company: 'TCS',
      msg: 'I got placed within 3 months after training. Real projects helped me a lot.',
    },
    {
      name: 'Sneha Reddy',
      role: 'Frontend Developer',
      company: 'Infosys',
      msg: 'Best Vidhura Tech for Angular. Interview training was excellent.',
    },
    {
      name: 'Arjun',
      role: 'Java Developer',
      company: 'Wipro',
      msg: 'From zero to job-ready. Highly recommended!',
    },
  ];

  openEnrollModal() {
    this.modalService.open();
  }
}
