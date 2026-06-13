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
    if (!this.email) {
      alert('Please enter email');
      return;
    }
    alert('Subscribed successfully!');
    this.email = '';
  }

  openWebsite() {
    window.open('https://www.vidhuratech.com', '_blank');
  }
}