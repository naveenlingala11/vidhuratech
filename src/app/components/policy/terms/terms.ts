import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  year = new Date().getFullYear();

  openWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }
}
