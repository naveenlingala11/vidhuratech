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
import { RouterLink, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ModalService } from '../../services/modal';
import { TimerService } from '../../services/timer';
import { BatchService } from '../../features/lms/batch/services/batch';
import { AuthService } from '../../features/auth/services/auth.service';
import { PublicCourseService } from '../courses/service/public-course';
import { environment } from '../../../environments/environment';
import { PublicPracticeService } from '../../features/services/public-practice.service';
import { MentorService, MentorProfile } from '../../services/mentor.service';

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
  popupInterval: any;

  // =============== COURSES =================
  courses: any[] = [];
  featuredCourses: any[] = [];

  // =============== MENTORS =================
  featuredMentors: MentorProfile[] = [];
  mentorsLoading = false;
  fallbackMentors: MentorProfile[] = [
    {
      userId: 1001,
      name: 'Naveen Lingala',
      email: 'naveen@vidhuratech.com',
      phone: '',
      profileImageUrl: '',
      currentCompany: 'Vidhura Tech',
      currentRole: 'Founder & Principal Engineer',
      yearsOfExperience: 10,
      biography: 'Specialized in building scalable backend systems, Java Spring Boot microservices, and modern Angular frontend architectures.',
      skills: 'System Design, Angular, Java, Spring Boot, PostgreSQL, Microservices',
      languages: 'English, Telugu, Hindi',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      rating: 5.0,
      reviewsCount: 78,
      pricePerHour: 1500,
      featured: true,
      active: true
    },
    {
      userId: 1002,
      name: 'Sundeep Kumar',
      email: 'sundeep@vidhuratech.com',
      phone: '',
      profileImageUrl: '',
      currentCompany: 'Amazon',
      currentRole: 'Senior Systems Architect',
      yearsOfExperience: 8,
      biography: 'Ex-Amazonian developer. Passionate about solving complex algorithms, mock interviews prep, and database optimizations.',
      skills: 'Algorithms, AWS, Python, MySQL, Redis, Mock Interviews',
      languages: 'English, Hindi, Telugu',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      rating: 4.9,
      reviewsCount: 54,
      pricePerHour: 1800,
      featured: true,
      active: true
    },
    {
      userId: 1003,
      name: 'Priya Sharma',
      email: 'priya@vidhuratech.com',
      phone: '',
      profileImageUrl: '',
      currentCompany: 'Google',
      currentRole: 'Senior Software Engineer',
      yearsOfExperience: 7,
      biography: 'Specialist in frontend frameworks, product engineering, and helping college graduates transition to big-tech roles.',
      skills: 'React, JavaScript, CSS3, System Design, Career Mentoring',
      languages: 'English, Hindi, Tamil',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      rating: 5.0,
      reviewsCount: 46,
      pricePerHour: 2000,
      featured: true,
      active: true
    }
  ];

  heroCourse: any = null;
  heroCourseIndex = 0;
  heroRotation: any;

  selectedEnrollCourse: any = null;
  selectedEnrollBatch: any = null;
  weeklyContestTopThree: any[] = [];

  showMockInterviewLeadForm = false;
  mockInterviewSubmitting = false;
  mockInterviewLeadSuccess = '';
  mockInterviewLeadError = '';

  mockInterviewLead = {
    name: '',
    email: '',
    skills: '',
    interested: 'YES',
    message: '',
  };

  // ========= PUBLIC QUICK SESSION =========
  sessionTitle = '';
  sessionDesc = '';
  sessionHostName = '';
  sessionCreated = false;
  generatedRoomLink = '';
  generatedRoomName = '';

  heroCountdown = signal({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  private heroCountdownInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: ModalService,
    private zone: NgZone,
    public timer: TimerService,
    private batchService: BatchService,
    private authService: AuthService,
    private courseService: PublicCourseService,
    private publicPracticeService: PublicPracticeService,
    private mentorService: MentorService,
    private router: Router,
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

    this.authService.authState.subscribe((status) => {
      this.isLoggedIn.set(status);
      this.authChecked.set(true);
    });

    this.loadWeeklyContestTopThree();
    this.loadFeaturedMentors();
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

  private resolveCourseStartDate(course: any): string | null {
    return (
      course?.upcomingBatch?.startDate ||
      course?.activeBatch?.startDate ||
      course?.startDate ||
      null
    );
  }

  private startHeroCountdown(): void {
    if (this.heroCountdownInterval) {
      clearInterval(this.heroCountdownInterval);
    }

    this.updateHeroCountdown();

    this.heroCountdownInterval = setInterval(() => {
      this.updateHeroCountdown();
    }, 1000);
  }

  private updateHeroCountdown(): void {
    const startDate = this.resolveCourseStartDate(this.heroCourse);

    if (!startDate) {
      this.heroCountdown.set({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
      });
      return;
    }

    const target = this.normalizeCourseStartDate(startDate).getTime();
    const diff = target - Date.now();

    if (!Number.isFinite(target) || diff <= 0) {
      this.heroCountdown.set({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      });
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);

    this.heroCountdown.set({
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      expired: false,
    });
  }

  private normalizeCourseStartDate(value: string): Date {
    const dateValue = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return new Date(`${dateValue}T09:00:00`);
    }

    return new Date(dateValue);
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

            const firstWithBatch = this.featuredCourses.find(
              (course) => course.upcomingBatch || course.activeBatch || course.startDate,
            );
            this.heroCourse = firstWithBatch || this.featuredCourses[0] || null;
            this.heroCourseIndex = this.heroCourse
              ? this.featuredCourses.findIndex((course) => course.id === this.heroCourse.id)
              : 0;

            this.activeBatch =
              this.heroCourse?.activeBatch || this.heroCourse?.upcomingBatch || null;
            this.selectedEnrollCourse = this.heroCourse;
            this.selectedEnrollBatch = this.activeBatch;
            console.log('Hero course date for timer:', this.heroCourse, this.heroStartDate);
            this.timer.startCountdown(this.heroStartDate);

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

  get heroStartDate(): string | null {
    return this.getBestFutureStartDate(this.heroCourse);
  }

  private getBestFutureStartDate(course: any): string | null {
    const dates = [
      course?.startDate,
      course?.courseStartDate,
      course?.batchStartDate,
      course?.upcomingBatch?.startDate,
      course?.upcomingBatch?.batchStartDate,
      course?.activeBatch?.startDate,
      course?.activeBatch?.batchStartDate,
    ].filter(Boolean);

    if (!dates.length) return null;

    const parsedDates = dates
      .map((value) => ({
        raw: String(value),
        time: this.toStartTime(value),
      }))
      .filter((item) => Number.isFinite(item.time));

    if (!parsedDates.length) return null;

    const now = Date.now();

    const futureDates = parsedDates
      .filter((item) => item.time > now)
      .sort((a, b) => a.time - b.time);

    if (futureDates.length) {
      return futureDates[0].raw;
    }

    const latestPastDate = parsedDates.sort((a, b) => b.time - a.time)[0];
    return latestPastDate.raw;
  }

  private toStartTime(value: any): number {
    const text = String(value || '').trim();

    if (!text) return Number.NaN;

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const [year, month, day] = text.split('-').map(Number);
      return new Date(year, month - 1, day, 19, 30, 0, 0).getTime();
    }

    return new Date(text).getTime();
  }

  setHeroCourse(course: any, index: number): void {
    this.heroCourse = course;
    this.heroCourseIndex = index;
    this.activeBatch = course?.activeBatch || course?.upcomingBatch || null;
    this.selectedEnrollCourse = course;
    this.selectedEnrollBatch = this.activeBatch;

    console.log('Selected course date for timer:', this.heroCourse, this.heroStartDate);
    this.timer.startCountdown(this.heroStartDate);
  }

  selectCourse(course: any): void {
    if (!course) return;

    const index = this.featuredCourses.findIndex((c) => c.id === course.id);
    this.setHeroCourse(course, index >= 0 ? index : 0);
  }

  startHeroRotation(): void {
    return;
  }

  loadWeeklyContestTopThree(): void {
    this.publicPracticeService.getWeeklyLeaderboard().subscribe({
      next: (res: any) => {
        this.weeklyContestTopThree = res?.data?.topThree || [];
      },
      error: () => {
        this.weeklyContestTopThree = [];
      },
    });
  }

  winnerBadge(rank: number): string {
    if (rank === 1) return 'Gold';
    if (rank === 2) return 'Silver';
    if (rank === 3) return 'Bronze';
    return 'Ranked';
  }

  openEnrollModal(course?: any) {
    const selected =
      course && typeof course === 'object' ? course : this.heroCourse || this.selectedEnrollCourse;

    if (!selected) return;

    this.selectedEnrollCourse = selected;
    this.selectedEnrollBatch =
      selected.activeBatch || selected.upcomingBatch || this.activeBatch || null;

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
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }

  openMockInterviewLeadForm(): void {
    this.showMockInterviewLeadForm = true;
    this.mockInterviewLeadSuccess = '';
    this.mockInterviewLeadError = '';
  }

  closeMockInterviewLeadForm(): void {
    if (this.mockInterviewSubmitting) return;

    this.showMockInterviewLeadForm = false;
    this.mockInterviewLeadSuccess = '';
    this.mockInterviewLeadError = '';
  }

  submitMockInterviewLead(): void {
    this.mockInterviewLeadSuccess = '';
    this.mockInterviewLeadError = '';

    const payload = {
      name: this.mockInterviewLead.name.trim(),
      email: this.mockInterviewLead.email.trim(),
      skills: this.mockInterviewLead.skills.trim(),
      interested: this.mockInterviewLead.interested,
      message: this.mockInterviewLead.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.skills) {
      this.mockInterviewLeadError = 'Please enter name, email, and skills.';
      return;
    }

    this.mockInterviewSubmitting = true;

    fetch(`${environment.apiUrl}/api/leads/mock-interview-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Unable to save your request.');
        }

        this.mockInterviewLeadSuccess =
          'Your mock interview interest has been saved. Our team will contact you soon.';

        this.mockInterviewLead = {
          name: '',
          email: '',
          skills: '',
          interested: 'YES',
          message: '',
        };

        setTimeout(() => {
          this.showMockInterviewLeadForm = false;
          this.mockInterviewLeadSuccess = '';
        }, 1800);
      })
      .catch((error) => {
        this.mockInterviewLeadError = error?.message || 'Unable to save your request.';
      })
      .finally(() => {
        this.mockInterviewSubmitting = false;
      });
  }

  // ========= PUBLIC QUICK SESSION METHODS =========
  createPublicSession(): void {
    const title = this.sessionTitle.trim();
    const host = this.sessionHostName.trim();

    if (!title || !host) {
      this.mockInterviewLeadError = 'Please enter session title and your name.';
      return;
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.generatedRoomName = `VidhuraTech_Public_${timestamp}_${randomSuffix}`;
    this.generatedRoomLink = `${window.location.origin}/meeting/${this.generatedRoomName}`;
    this.sessionCreated = true;
    this.mockInterviewLeadError = '';
  }

  copyGeneratedLink(): void {
    const text = `Join my VidhuraTech session: ${this.generatedRoomLink}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.mockInterviewLeadSuccess = 'Invite link copied to clipboard!';
        setTimeout(() => (this.mockInterviewLeadSuccess = ''), 2500);
      });
    }
  }

  shareGeneratedWhatsApp(): void {
    const text = encodeURIComponent(`Join my VidhuraTech Mock Interview Session: ${this.generatedRoomLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  shareGeneratedEmail(): void {
    const subject = encodeURIComponent(`VidhuraTech Mock Interview Session Invitation`);
    const body = encodeURIComponent(`Hi,\n\nI've created a mock interview session on VidhuraTech. Please join using the link below:\n\n${this.generatedRoomLink}\n\nRegards,\n${this.sessionHostName}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }

  startCreatedSession(): void {
    this.router.navigate(['/meeting', this.generatedRoomName]);
  }

  resetPublicSessionForm(): void {
    this.sessionTitle = '';
    this.sessionDesc = '';
    this.sessionHostName = '';
    this.sessionCreated = false;
    this.generatedRoomLink = '';
    this.generatedRoomName = '';
    this.mockInterviewLeadSuccess = '';
    this.mockInterviewLeadError = '';
    this.showMockInterviewLeadForm = false;
  }

  ngOnDestroy() {
    this.timer.stopCountdown();
  }

  safeProfileImageUrl(value: any): string {
    const url = String(value || '').trim();
    return url.startsWith('https://') ? url : '';
  }

  winnerAvatarUrl(winner: any): string {
    if (!winner || winner.__avatarFailed) return '';

    return this.safeProfileImageUrl(
      winner.profileImageUrl ||
        winner.userProfileImageUrl ||
        winner.authorProfileImageUrl ||
        winner.imageUrl ||
        winner.photoURL ||
        winner.photoUrl ||
        winner.picture ||
        winner.avatarUrl ||
        winner.user?.profileImageUrl ||
        winner.user?.picture ||
        winner.student?.profileImageUrl ||
        winner.participant?.profileImageUrl,
    );
  }

  winnerInitial(winner: any): string {
    const name = String(
      winner?.name ||
        winner?.studentName ||
        winner?.fullName ||
        winner?.participantName ||
        winner?.userName ||
        winner?.email ||
        'P',
    ).trim();

    return name ? name.charAt(0).toUpperCase() : 'P';
  }

  markWinnerAvatarFailed(winner: any): void {
    if (winner) winner.__avatarFailed = true;
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

      startDate: c.startDate || null,
      endDate: c.endDate || null,

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

  loadFeaturedMentors() {
    this.mentorsLoading = true;
    this.mentorService.getPublicMentors().subscribe({
      next: (res) => {
        const active = (res?.data || []).filter(m => m.active);
        if (active.length > 0) {
          this.featuredMentors = active.slice(0, 3);
        } else {
          this.featuredMentors = this.fallbackMentors;
        }
        this.mentorsLoading = false;
      },
      error: () => {
        this.featuredMentors = this.fallbackMentors;
        this.mentorsLoading = false;
      }
    });
  }

  getSkillsList(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getMentorInitial(name: string): string {
    const text = String(name || '').trim();
    return text ? text.charAt(0).toUpperCase() : 'M';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }
}
