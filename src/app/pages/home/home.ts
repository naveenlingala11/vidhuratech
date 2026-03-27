import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, signal, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { ModalService } from '../../services/modal';
import { TimerService } from '../../services/timer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: ModalService,
    private zone: NgZone,
    public timer: TimerService
  ) {}

  modalInstance: any;

  seats = 25;

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        if (this.seats > 5) {
          this.zone.run(() => {
            this.seats--;
          });
        }
      }, 10000);
    });

    this.timer.startCountdown();
  }

  // FEATURES
  highlights = [
    { title: '24/7 Doubt Support', desc: 'Get your doubts cleared anytime.' },
    { title: 'Recorded Classes', desc: 'Access recordings anytime.' },
    { title: 'Mini & Major Projects', desc: 'Hands-on real projects.' },
    { title: 'Placement Assistance', desc: 'Support until you get job.' },
  ];

  // COURSES
  courses = [
    { title: 'Java Full Stack', desc: 'Spring Boot, Angular, REST APIs.' },
    { title: 'Python Full Stack', desc: 'Python, Django, React.' },
    { title: 'Data Analytics', desc: 'Excel, SQL, Power BI.' },
  ];

  // TESTIMONIALS
  testimonials = [
    { name: 'Ramesh', message: 'Great training with real projects.' },
    { name: 'Suresh', message: 'Trainer explains clearly in Telugu.' },
    { name: 'Kavya', message: 'Best Java course I attended.' },
  ];

  openEnrollModal() {
    this.modalService.open();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      Promise.resolve().then(() => {
        this.openEnrollModal();
      });
    }, 1500);
  }

  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  startCountdown() {
    if (!isPlatformBrowser(this.platformId)) return; // 🔥 MUST

    const endTime = new Date().getTime() + 5 * 60 * 60 * 1000;

    interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) return;

      const h = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      // ✅ DIRECT update (NO requestAnimationFrame)
      this.hours.set(h);
      this.minutes.set(m);
      this.seconds.set(s);
    });
  }
}
