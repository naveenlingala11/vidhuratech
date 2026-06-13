import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './refund.html',
  styleUrl: './refund.css',
})
export class Refund {
  year = new Date().getFullYear();

  openWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }
}