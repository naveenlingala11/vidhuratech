import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  signal,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ModalService } from '../../services/modal';
import { TimerService } from '../../services/timer';
import { BatchService } from '../../features/lms/batch/services/batch';
import { AuthService } from '../../features/auth/services/auth.service';
import { PublicCourseService } from '../courses/service/public-course';
import { environment } from '../../../environments/environment';
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
  // ================= DATA =================
  seats = 25;
  activeBatch: any;
  names = ['Ravi', 'Suresh', 'Kavya', 'Anil', 'Priya', 'Rahul', 'Krishna'];
  cities = ['Hyderabad', 'Bangalore', 'Chennai', 'Vizag', 'Pune', 'Tirupathi'];
  popupInterval: any;
  // =============== COURSES =================
  courses: any[] = [];
  featuredCourses: any[] = [];

  heroCourse: any = null;
  heroCourseIndex = 0;
  heroRotation: any;

  selectedEnrollCourse: any = null;
  selectedEnrollBatch: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: ModalService,
    private zone: NgZone,
    public timer: TimerService,
    private batchService: BatchService,
    private authService: AuthService,
    private courseService: PublicCourseService,
  ) {}
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
    //this.loadBatch(2);
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
    this.authService.authState.subscribe((status) => {
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
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
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
  loading = false;

  loadCourses(): void {
    this.loading = true;

    this.courseService.getFeaturedCourses().subscribe({
      next: (res: any) => {
        const list = res?.data || [];

        if (!list.length) {
          this.featuredCourses = [];
          this.heroCourse = null;
          this.activeBatch = null;
          this.loading = false;
          return;
        }

        const requests: Observable<any>[] = list.map((course: any) =>
          forkJoin({
            activeBatch: this.batchService.getActiveBatch(course.id).pipe(
              map((res: any) => res?.data || null),
              catchError(() => of(null)),
            ),
            upcomingBatch: this.batchService.getUpcomingBatch(course.id).pipe(
              map((res: any) => res?.data || null),
              catchError(() => of(null)),
            ),
          }).pipe(
            map(({ activeBatch, upcomingBatch }) => ({
              ...this.mapPublicCourse(course),
              activeBatch,
              upcomingBatch,
            })),
          ),
        );

        forkJoin(requests).subscribe({
          next: (courses: any[]) => {
            const topFourCourses = courses
              .sort((a, b) => Number(a.featuredRank || 100) - Number(b.featuredRank || 100))
              .slice(0, 4);

            this.featuredCourses = topFourCourses;

            const firstWithBatch = this.featuredCourses.find((course) => course.activeBatch);
            this.heroCourse = firstWithBatch || this.featuredCourses[0] || null;
            this.heroCourseIndex = this.heroCourse
              ? this.featuredCourses.findIndex((course) => course.id === this.heroCourse.id)
              : 0;

            this.activeBatch = this.heroCourse?.activeBatch || null;
            this.selectedEnrollCourse = this.heroCourse;
            this.selectedEnrollBatch = this.activeBatch;

            this.loading = false;
          },
          error: () => {
            this.featuredCourses = [];
            this.heroCourse = null;
            this.activeBatch = null;
            this.loading = false;
          },
        });
      },
      error: () => {
        this.featuredCourses = [];
        this.heroCourse = null;
        this.activeBatch = null;
        this.loading = false;
      },
    });
  }

  setHeroCourse(course: any, index: number): void {
    if (!course) return;

    this.heroCourseIndex = index;
    this.heroCourse = course;
    this.activeBatch = course.activeBatch || null;
    this.selectedEnrollCourse = course;
    this.selectedEnrollBatch = course.activeBatch || null;
  }

  selectCourse(course: any): void {
    if (!course) return;

    const index = this.featuredCourses.findIndex((c) => c.id === course.id);
    this.setHeroCourse(course, index >= 0 ? index : 0);
  }

  // startHeroRotation(): void {
  //   if (this.heroRotation) {
  //     clearInterval(this.heroRotation);
  //   }

  //   if (this.featuredCourses.length <= 1) return;

  //   this.heroRotation = setInterval(() => {
  //     const nextIndex = (this.heroCourseIndex + 1) % this.featuredCourses.length;
  //     this.setHeroCourse(this.featuredCourses[nextIndex], nextIndex);
  //   }, 4500);
  // }

  startHeroRotation(): void {
    return;
  }

  openEnrollModal(course?: any) {
    const selected =
      course && typeof course === 'object' ? course : this.heroCourse || this.selectedEnrollCourse;

    if (!selected) return;

    this.selectedEnrollCourse = selected;
    this.selectedEnrollBatch = selected.activeBatch || this.activeBatch || null;

    this.modalService.open({
      course: selected.title,
      courseId: selected.id,
      price: selected.price,
      batchId: this.selectedEnrollBatch?.id,
      batch: this.selectedEnrollBatch?.name,
    });
  }

  startTyping() {
    const text = 'print("Job Ready")';
    let i = 0;
    const el = document.querySelector('.typing-text') as HTMLElement | null;

    if (!el) return;

    el.innerHTML = '';

    const typing = setInterval(() => {
      if (i < text.length) {
        el.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(typing);
      }
    }, 60);
  }

  loadBatch(courseId: number) {
    const matched = this.featuredCourses.find((course) => Number(course.id) === Number(courseId));

    if (matched?.activeBatch) {
      this.activeBatch = matched.activeBatch;
      this.selectedEnrollBatch = matched.activeBatch;
      return;
    }

    this.activeBatch = null;
    this.selectedEnrollBatch = null;
  }

  courseImage(url: string | null | undefined): string {
    if (!url) return '';

    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }

    return `${environment.apiUrl}${url}`;
  }

  ngOnDestroy() {
    if (this.popupInterval) {
      clearInterval(this.popupInterval);
    }
  }

  mapPublicCourse(c: any) {
    let meta: any = {};

    try {
      meta = c.metadataJson ? JSON.parse(c.metadataJson) : {};
    } catch {
      meta = {};
    }

    return {
      id: c.id,
      code: c.code,
      title: c.title,
      desc: c.description || '',
      price: c.price || 0,
      oldPrice: meta.oldPrice || Math.round(Number(c.price || 0) * 1.4),
      discountLabel: meta.discountLabel || '',
      duration: (c.durationHours || 0) + ' hrs',
      durationHours: c.durationHours || 0,
      level: c.level,
      thumbnailUrl: c.thumbnailUrl,
      highlights: meta.highlights || [],
      outcomes: meta.outcomes || [],
      featuredOnHome: !!c.featuredOnHome,
      featuredRank: c.featuredRank || 100,
      autoMonthlyBatchEnabled: !!c.autoMonthlyBatchEnabled,
    };
  }

  switchCourse(course: 'java' | 'python') {
    this.activeCourse.set(course);
    const courseMap: any = {
      java: 1,
      python: 2,
    };
    this.loadBatch(courseMap[course]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
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
      const courseName = this.heroCourse?.title || 'our live course';
      const message = `🔥 ${name} from ${city} joined ${courseName} just now`;
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
    const nextTime = Date.now() + 10 * 60 * 1000;
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
