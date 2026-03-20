import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  year = new Date().getFullYear();

  email = '';

  subscribe() {
    if (!this.email) {
      alert('Please enter email');
      return;
    }

    alert('Subscribed successfully!');
    this.email = '';
  }

  openWebsite() {
    window.open('https://uptrixhub.online', '_blank');
  }
}