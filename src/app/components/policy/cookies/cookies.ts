import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookies.html',
  styleUrl: './cookies.css',
})
export class Cookies {
  year = new Date().getFullYear();

  openWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }
}
