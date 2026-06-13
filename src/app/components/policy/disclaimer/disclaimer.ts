import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './disclaimer.html',
  styleUrl: './disclaimer.css',
})
export class Disclaimer {
  year = new Date().getFullYear();

  openWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }
}
