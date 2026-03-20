import { Component, Inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EnrollModal } from './shared/enroll-modal/enroll-modal';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, Footer, EnrollModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('vidhuratech');

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
  ) {}
  showPreview = false;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      Promise.resolve().then(() => {
        this.showPreview = true;
      });
    }, 3000);
  }

  openWhatsApp() {
    const message = `Hi, I am interested in Java Full Stack Course`;

    window.open(`https://wa.me/919108057464?text=${encodeURIComponent(message)}`, '_blank');
  }
}
