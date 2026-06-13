import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit {
  year = new Date().getFullYear();
  email = '';
  isLightTheme = false;

  /* Subscribe State */
  isSubscribing = false;
  subscribeSuccess = false;
  subscribeError = '';

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    this.isLightTheme = theme === 'light';
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.remove('light-mode');
    }

    // Check if already subscribed
    const subscribed = localStorage.getItem('vt_subscribed');
    if (subscribed) {
      this.subscribeSuccess = true;
    }
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }

  subscribe() {
    this.subscribeError = '';

    if (!this.email || !this.email.trim()) {
      this.subscribeError = 'Please enter your email address.';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email.trim())) {
      this.subscribeError = 'Please enter a valid email address.';
      return;
    }

    this.isSubscribing = true;

    // Simulate API call (replace with real HTTP POST to backend when ready)
    setTimeout(() => {
      // Save to localStorage for persistence
      const subscribers = JSON.parse(localStorage.getItem('vt_subscribers') || '[]');
      const normalizedEmail = this.email.trim().toLowerCase();

      if (subscribers.includes(normalizedEmail)) {
        this.subscribeError = 'This email is already subscribed!';
        this.isSubscribing = false;
        return;
      }

      subscribers.push(normalizedEmail);
      localStorage.setItem('vt_subscribers', JSON.stringify(subscribers));
      localStorage.setItem('vt_subscribed', normalizedEmail);

      this.isSubscribing = false;
      this.subscribeSuccess = true;
      this.email = '';
    }, 1200);
  }

  openWebsite() {
    window.open('https://www.vidhuratech.com', '_blank');
  }
}