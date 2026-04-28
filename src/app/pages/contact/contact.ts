import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) { }

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
            message: ''
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
}
