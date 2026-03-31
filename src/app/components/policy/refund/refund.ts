import { Component } from '@angular/core';

@Component({
  selector: 'app-refund',
  standalone: true,
  templateUrl: './refund.html',
  styleUrl: './refund.css',
})
export class Refund {
  year = new Date().getFullYear();
}