import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resume-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-landing.html',
  styleUrl: './resume-landing.css'
})
export class ResumeLanding {
  showcaseTier = 'FREE';

  constructor(private router: Router) { }

  enterWorkspace() {
    this.router.navigate(['/resume-workspace']);
  }

  goToScanner() {
    this.router.navigate(['/resume-scanner']);
  }

  goToCustomizer() {
    this.router.navigate(['/resume-customizer']);
  }

  goToGuide() {
    this.router.navigate(['/resume-guide']);
  }
}
