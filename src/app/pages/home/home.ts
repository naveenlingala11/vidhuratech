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
import { PublicCourseService } from '../courses/service/public-course';
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
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);
  // ================= DATA =================
  seats = 25;
  activeBatch: any;
  names = ['Ravi', 'Suresh', 'Kavya', 'Anil', 'Priya', 'Rahul', 'Krishna'];
  cities = ['Hyderabad', 'Bangalore', 'Chennai', 'Vizag', 'Pune', 'Tirupathi'];
  popupInterval: any;
  // =============== COURSES =================
  courses: any[] = [];
  featuredCourses: any[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: ModalService,
    private zone: NgZone,
    public timer: TimerService,
    private batchService: BatchService,
    private authService: AuthService,
    private courseService: PublicCourseService
  ) { }
  // ================= INIT =================
  ngOnInit() {
    this.loadCourses();
    // seats animation
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        if (this.seats > 5) {
          this.zone.run(() => this.seats--);
        }
      }, 10000);
    });
    this.loadBatch(2);
    this.startCountdown();
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
    this.startTyping();
    const card = document.querySelector('.premium-card') as HTMLElement;
    if (!card) return;
    card.addEventListener('mousemove', (e: any) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = -(y / rect.height - 0.5) * 12;
      const rotateY = (x / rect.width - 0.5) * 12;
      card.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
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
  startTyping() {
    const text = 'print("Job Ready 🚀")';
    let i = 0;
    const el = document.querySelector('.typing-text') as HTMLElement;
    const typing = setInterval(() => {
      if (i < text.length) {
        el.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(typing);
      }
    }, 60);
  }
  isDark = true;
  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }
  // ================= COURSE =================
  loadCourses() {
    this.courseService.getCourses(false).subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        // 🔥 CURRENT LIVE COURSE
        const LIVE_COURSE_TITLE =
          'Python + Data Structures';
        this.courses = list.map((c: any) => {
          let meta: any = {};
          try {
            meta = c.metadataJson
              ? JSON.parse(c.metadataJson)
              : {};
          } catch { }
          // ✅ LIVE CHECK
          const isLive =
            c.title?.trim()?.toLowerCase() ===
            LIVE_COURSE_TITLE.toLowerCase();
          // ✅ NEXT BATCH DATE
          const today = new Date();
          const cycleDays = 15;
          const baseDate = new Date(2026, 4, 2);
          const diff =
            Math.floor(
              (today.getTime() - baseDate.getTime()) /
              (1000 * 60 * 60 * 24)
            );
          const cycles =
            Math.floor(diff / cycleDays);
          const nextBatchDate = new Date(baseDate);
          nextBatchDate.setDate(
            baseDate.getDate() +
            ((cycles + 1) * cycleDays)
          );
          return {
            id: c.id,
            title: c.title,
            desc: c.description,
            duration:
              (c.durationHours || 0) + ' hrs',
            level: c.level,
            highlights:
              meta.highlights || [],
            // ✅ NEW
            isLive,
            // ✅ ONLY LIVE COURSE GETS BATCH
            batch: isLive
              ? {
                id: c.id,
                startDate: nextBatchDate,
                name: `${c.title} Live Batch`
              }
              : null
          };
        });
        // ✅ LIVE FIRST
        this.featuredCourses = [
          ...this.courses.filter(c => c.isLive),
          ...this.courses.filter(c => !c.isLive)
        ].slice(0, 4);
      }
    });
  }
  switchCourse(course: 'java' | 'python') {
    this.activeCourse.set(course);
    const courseMap: any = {
      java: 1,
      python: 2
    };
    this.loadBatch(courseMap[course]);
  }
  loadBatch(courseId: number) {
    this.batchService
      .getActiveBatch(courseId)
      .subscribe({
        next: (res: any) => {
          this.activeBatch = res?.data || null;
        },
        error: () => {
          this.activeBatch = null;
        }
      });
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
    const today = new Date();
    // Base batch date
    const baseDate = new Date(2026, 4, 2); // May 2 2026
    // Every 15 days
    const cycleDays = 15;
    const diffDays = Math.floor(
      (today.getTime() - baseDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const cycles = Math.floor(diffDays / cycleDays);
    // Next batch date
    const nextBatchDate = new Date(baseDate);
    nextBatchDate.setDate(
      baseDate.getDate() + ((cycles + 1) * cycleDays)
    );
    // Optional batch time
    nextBatchDate.setHours(19, 30, 0, 0);
    interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance =
        nextBatchDate.getTime() - now;
      if (distance <= 0) return;
      this.days.set(
        Math.floor(distance / (1000 * 60 * 60 * 24))
      );
      this.hours.set(
        Math.floor(
          (distance % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
        )
      );
      this.minutes.set(
        Math.floor(
          (distance % (1000 * 60 * 60)) /
          (1000 * 60)
        )
      );
      this.seconds.set(
        Math.floor(
          (distance % (1000 * 60)) / 1000
        )
      );
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