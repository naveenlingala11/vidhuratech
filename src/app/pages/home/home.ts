import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  signal,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';

import { ModalService } from '../../services/modal';
import { TimerService } from '../../services/timer';
import { BatchService } from '../../features/lms/batch/services/batch';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnInit, OnDestroy {

  // ================= STATE =================
  activeCourse = signal<'java' | 'python'>('python');
  isAnimating = signal(false);
  javaCount = signal(5);
  pythonCount = signal(7);

  isLoggedIn = signal(false);
  authChecked = signal(false);

  showPopup = signal(false);
  popupMessage = signal('');
  popupClosedUntil = signal<number | null>(null);

  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  // ================= DATA =================
  seats = 25;
  activeBatch: any;

  names = ['Ravi', 'Suresh', 'Kavya', 'Anil', 'Priya', 'Rahul', 'Krishna'];
  cities = ['Hyderabad', 'Bangalore', 'Chennai', 'Vizag', 'Pune', 'Tirupathi'];

  popupInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: ModalService,
    private zone: NgZone,
    public timer: TimerService,
    private batchService: BatchService,
    private authService: AuthService
  ) { }

  // ================= INIT =================
  ngOnInit() {

    // seats animation
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        if (this.seats > 5) {
          this.zone.run(() => this.seats--);
        }
      }, 10000);
    });

    this.loadBatch(2);
    this.timer.startCountdown();

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('popupBlockUntil');

      if (saved) {
        const time = Number(saved);
        this.popupClosedUntil.set(time);

        // 🔥 IMPORTANT: if still in cooldown → block popup
        if (Date.now() < time) {
          this.showPopup.set(false);
        }
      }
    }

    this.authService.authState.subscribe(status => {

      console.log('🔐 Auth status changed:', status);

      this.isLoggedIn.set(status);
      this.authChecked.set(true);

      if (status) {
        console.log('🛑 User logged in → stopping popup');

        this.showPopup.set(false);

        if (this.popupInterval) {
          clearInterval(this.popupInterval);
          this.popupInterval = null;
        }

        return;
      }

      console.log('🟢 User not logged in → starting popup');

      this.startPopupLoop();
    });
  }
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {

      // ❌ DO NOT show modal if logged in
      if (this.isLoggedIn()) {
        console.log('🚫 Modal blocked: user logged in');
        return;
      }

      console.log('✅ Opening enroll modal');

      this.openEnrollModal();

    }, 1500);
  }

  ngOnDestroy() {
    if (this.popupInterval) {
      clearInterval(this.popupInterval);
    }
  }

  // ================= COURSE =================
  switchCourse(course: 'java' | 'python') {
    this.activeCourse.set(course);

    const courseMap: any = {
      java: 1,
      python: 2
    };

    this.loadBatch(courseMap[course]);
  }

  loadBatch(courseId: number) {
    const batchMap: any = {
      1: {
        id: 101,
        name: 'Java Batch Jan 2026',
        startDate: '2026-01-10'
      },
      2: {
        id: 202,
        name: 'Python Batch May 2026',
        startDate: '2026-05-01'
      }
    };

    this.activeBatch = batchMap[courseId] || null;
  }

  // ================= MODAL =================
  openEnrollModal(course?: string) {
    this.modalService.open({
      course: course || this.activeBatch?.courseTitle || ''
    });
  }

  // ================= COUNTDOWN =================
  startCountdown() {
    if (!isPlatformBrowser(this.platformId)) return;

    const endTime = new Date().getTime() + 5 * 60 * 60 * 1000;

    interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) return;

      this.hours.set(Math.floor(distance / (1000 * 60 * 60)));
      this.minutes.set(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      this.seconds.set(Math.floor((distance % (1000 * 60)) / 1000));
    });
  }

  // ================= POPUP =================
  startPopupLoop() {

    if (this.popupInterval) return;

    console.log('🚀 Popup loop started');

    this.popupInterval = setInterval(() => {

      console.log('⏱️ Checking popup conditions...');

      // ❌ LOGIN CHECK (MISSING BUG FIX)
      if (this.isLoggedIn()) {
        console.log('❌ Popup blocked: user is logged in');
        return;
      }

      // ❌ AUTH NOT READY
      if (!this.authChecked()) {
        console.log('⏳ Waiting for auth...');
        return;
      }

      // ❌ COOLDOWN
      if (this.popupClosedUntil() && Date.now() < this.popupClosedUntil()!) {
        console.log('⛔ Popup blocked: cooldown active');
        return;
      }

      const name = this.names[Math.floor(Math.random() * this.names.length)];
      const city = this.cities[Math.floor(Math.random() * this.cities.length)];

      const message = `🔥 ${name} from ${city} joined Python + DS just now`;

      console.log('✅ Popup OPEN:', message);

      this.popupMessage.set(message);
      this.showPopup.set(true);

      setTimeout(() => {
        console.log('❌ Popup AUTO CLOSE');
        this.showPopup.set(false);
      }, 3000);

    }, 7000);
  }

  // ✅ close popup + 10 min block
  closePopup() {
    console.log('❌ Popup MANUAL CLOSE');

    this.showPopup.set(false);

    const nextTime = Date.now() + (10 * 60 * 1000);

    console.log('⛔ Cooldown set till:', new Date(nextTime));

    this.popupClosedUntil.set(nextTime);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('popupBlockUntil', nextTime.toString());
    }

    if (this.popupInterval) {
      clearInterval(this.popupInterval);
      this.popupInterval = null;
      console.log('🛑 Popup loop stopped after manual close');
    }
  }
}