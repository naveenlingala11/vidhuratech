import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {
  year = new Date().getFullYear();
}