import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';
import { BatchService } from '../../features/lms/batch/services/batch';
import { PublicCourseService } from './service/public-course';

type ViewMode = 'GRID' | 'LIST';
type SortMode = 'FEATURED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'DURATION' | 'TITLE' | 'LIVE';
type PriceFilter = '' | 'FREE' | 'LOW' | 'MID' | 'PREMIUM';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: any[] = [];
  filteredCourses: any[] = [];
  activeCourse: any = null;

  loading = false;
  error = '';
  toast = '';

  keyword = '';
  selectedLevel = '';
  selectedMode = '';
  selectedPrice: PriceFilter = '';
  sortMode: SortMode = 'FEATURED';
  viewMode: ViewMode = 'GRID';

  page = 1;
  pageSize = 6;

  isLoggedIn = false;
  isAdmin = false;

  selectedCurriculum: any = null;
  showCurriculum = false;

  savedCourseIds = new Set<number>();
  compareCourseIds = new Set<number>();

  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  priceFilters = [
    { label: 'Free', value: 'FREE' },
    { label: 'Under Rs. 5k', value: 'LOW' },
    { label: 'Rs. 5k - 15k', value: 'MID' },
    { label: 'Premium', value: 'PREMIUM' },
  ];

  private authSub?: Subscription;

  constructor(
    private courseService: PublicCourseService,
    private batchService: BatchService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role');
    this.isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    this.authSub = this.auth.authState.subscribe((isLogged) => {
      this.isLoggedIn = isLogged;
      if (this.courses.length) this.attachEnrollmentStatuses();
    });

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.courseService.getCourses(this.isAdmin).subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        const mapped = list.map((c: any) => this.mapCourse(c));

        if (!mapped.length) {
          this.courses = [];
          this.filteredCourses = [];
          this.activeCourse = null;
          this.loading = false;
          return;
        }

        const requests: Observable<any>[] = mapped.map((course: any) =>
          this.batchService.getActiveBatch(course.id).pipe(
            map((batchRes: any) => ({
              ...course,
              batch: batchRes?.data || null,
            })),
            catchError(() => of({ ...course, batch: null })),
          ),
        );

        forkJoin(requests).subscribe({
          next: (courses: any[]) => {
            this.courses = courses;
            this.activeCourse =
              courses.find((c) => c.batch?.status === 'ACTIVE') || courses[0] || null;

            this.attachEnrollmentStatuses();
            this.applyFilters();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load course batches';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Failed to load courses';
        this.loading = false;
      },
    });
  }

  mapCourse(c: any): any {
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
      duration: `${c.durationHours || 0} hrs`,
      durationHours: Number(c.durationHours || 0),
      level: c.level || 'BEGINNER',
      status: c.status,
      price: Number(c.price || 0),
      oldPrice: meta.oldPrice || null,
      discountLabel: meta.discountLabel || '',
      startDate: c.startDate || null,
      endDate: c.endDate || null,
      thumbnailUrl: c.thumbnailUrl,
      slug: this.getCourseSlug(c),
      batch: null,
      isEnrolled: false,
      highlights: Array.isArray(meta.highlights) ? meta.highlights : [],
      syllabus: Array.isArray(meta.syllabus) ? meta.syllabus : [],
      outcomes: Array.isArray(meta.outcomes) ? meta.outcomes : [],
      tools: Array.isArray(meta.tools) ? meta.tools : [],
    };
  }

  attachEnrollmentStatuses(): void {
    const role = localStorage.getItem('role');

    if (!this.auth.isLoggedIn() || role !== 'STUDENT') return;

    this.courses.forEach((course) => {
      if (!course.batch?.id) return;

      this.http
        .get(`${environment.apiUrl}/api/lms/batches/${course.batch.id}/is-enrolled`)
        .subscribe({
          next: (res: any) => {
            course.isEnrolled = !!res?.data;
            this.applyFilters(false);
            this.cdr.detectChanges();
          },
        });
    });
  }

  applyFilters(resetPage = true): void {
    const term = this.keyword.trim().toLowerCase();

    let data = [...this.courses];

    if (term) {
      data = data.filter((c) =>
        [
          c.title,
          c.code,
          c.desc,
          c.level,
          c.batch?.name,
          ...(c.highlights || []),
          ...(c.outcomes || []),
          ...(c.tools || []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
    }

    if (this.selectedLevel) data = data.filter((c) => c.level === this.selectedLevel);

    if (this.selectedMode === 'LIVE') data = data.filter((c) => c.batch?.status === 'ACTIVE');
    if (this.selectedMode === 'UPCOMING') data = data.filter((c) => c.batch?.status !== 'ACTIVE');
    if (this.selectedMode === 'ENROLLED') data = data.filter((c) => c.isEnrolled);

    if (this.selectedPrice) {
      data = data.filter((c) => {
        if (this.selectedPrice === 'FREE') return c.price === 0;
        if (this.selectedPrice === 'LOW') return c.price > 0 && c.price <= 5000;
        if (this.selectedPrice === 'MID') return c.price > 5000 && c.price <= 15000;
        return c.price > 15000;
      });
    }

    data.sort((a, b) => this.sortCourses(a, b));

    this.filteredCourses = data;
    if (resetPage) this.page = 1;
    this.page = Math.min(this.page, this.totalPages);

    if (!this.activeCourse && this.filteredCourses.length) {
      this.activeCourse = this.filteredCourses[0];
    }
  }

  resetFilters(): void {
    this.keyword = '';
    this.selectedLevel = '';
    this.selectedMode = '';
    this.selectedPrice = '';
    this.sortMode = 'FEATURED';
    this.pageSize = 6;
    this.applyFilters();
  }

  setLevel(level: string): void {
    this.selectedLevel = this.selectedLevel === level ? '' : level;
    this.applyFilters();
  }

  setActiveCourse(course: any): void {
    this.activeCourse = course;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSaved(course: any, event?: Event): void {
    event?.stopPropagation();
    this.savedCourseIds.has(course.id)
      ? this.savedCourseIds.delete(course.id)
      : this.savedCourseIds.add(course.id);

    this.showToast(
      this.savedCourseIds.has(course.id) ? 'Saved to shortlist' : 'Removed from shortlist',
    );
  }

  toggleCompare(course: any, event?: Event): void {
    event?.stopPropagation();

    if (!this.compareCourseIds.has(course.id) && this.compareCourseIds.size >= 3) {
      this.showToast('You can compare up to 3 courses');
      return;
    }

    this.compareCourseIds.has(course.id)
      ? this.compareCourseIds.delete(course.id)
      : this.compareCourseIds.add(course.id);
  }

  isSaved(course: any): boolean {
    return this.savedCourseIds.has(course.id);
  }

  isCompared(course: any): boolean {
    return this.compareCourseIds.has(course.id);
  }

  clearCompare(): void {
    this.compareCourseIds.clear();
  }

  viewDetails(course: any): void {
    this.router.navigate(['/courses', course.slug || this.getCourseSlug(course)]);
  }

  goToCheckout(course: any): void {
    this.router.navigate(['/checkout'], {
      queryParams: {
        courseId: course.id,
        course: course.title,
        amount: course.price,
        batchId: course.batch?.id,
        batch: course.batch?.name,
      },
    });
  }

  goToLearning(course: any): void {
    if (!course.batch?.id) return;
    this.router.navigate(['/dashboard/student/lms', course.batch.id]);
  }

  viewCurriculum(course: any): void {
    const batchId = course?.batch?.id;

    if (!batchId) {
      this.showToast('Curriculum will be available when a batch is active');
      return;
    }

    this.http
      .get<any>(`${environment.apiUrl}/api/trainer/public-curriculum`, {
        params: { batchId: batchId.toString() },
      })
      .subscribe({
        next: (res) => {
          const raw = res?.data;
          if (!raw) {
            this.showToast('Curriculum not available');
            return;
          }

          let full: any;

          try {
            full = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            this.showToast('Curriculum data corrupted');
            return;
          }

          if (!full?.curriculum || !Array.isArray(full.curriculum)) {
            this.showToast('Curriculum not available');
            return;
          }

          this.selectedCurriculum = this.auth.isLoggedIn()
            ? full
            : { ...full, curriculum: full.curriculum.slice(0, 2) };

          this.selectedCurriculum.curriculum.forEach((m: any, index: number) => {
            m.open = index === 0;
          });

          this.showCurriculum = true;

          setTimeout(() => {
            document
              .getElementById('curriculum-section')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: () => this.showToast('Failed to load curriculum'),
      });
  }

  closeCurriculum(): void {
    this.showCurriculum = false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }

  courseImage(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize));
  }

  get pagedCourses(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  get comparedCourses(): any[] {
    return this.courses.filter((c) => this.compareCourseIds.has(c.id));
  }

  get stats() {
    return {
      total: this.courses.length,
      live: this.courses.filter((c) => c.batch?.status === 'ACTIVE').length,
      saved: this.savedCourseIds.size,
      enrolled: this.courses.filter((c) => c.isEnrolled).length,
    };
  }

  get rangeLabel(): string {
    if (!this.filteredCourses.length) return '0 of 0';
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.filteredCourses.length);
    return `${start}-${end} of ${this.filteredCourses.length}`;
  }

  pages(): number[] {
    const start = Math.max(1, Math.min(this.page - 2, this.totalPages - 4));
    const safeStart = Math.max(1, start);
    const end = Math.min(this.totalPages, safeStart + 4);
    return Array.from({ length: end - safeStart + 1 }, (_, i) => safeStart + i);
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(page, 1), this.totalPages);
    window.scrollTo({ top: 520, behavior: 'smooth' });
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  getCourseSlug(course: any): string {
    const code = (course?.code || '').toUpperCase();

    const knownSlugs: Record<string, string> = {
      JAVA_FS_001: 'java-full-stack',
      JAVA_FS: 'java-full-stack',
      REACT: 'react-js',
      REACT_JS: 'react-js',
      DEVOPS: 'devops',
      PYTHON_DS: 'python-data-structures',
      ANGULAR_ENT: 'angular-enterprise',
      AWS_CLOUD: 'aws-cloud',
      SQL_DB: 'sql-database',
      POWER_BI: 'power-bi-analytics',
      NODE_BACKEND: 'nodejs-backend',
      SPRING_MICRO: 'spring-boot-microservices',
      UI_UX: 'ui-ux-design',
      CYBER_SEC: 'cyber-security',
      ML_AI: 'machine-learning',
      FLUTTER: 'flutter-mobile-apps',
      DATA_ENG: 'data-engineering',
    };

    if (knownSlugs[code]) return knownSlugs[code];

    return (course?.title || 'course')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private sortCourses(a: any, b: any): number {
    if (this.sortMode === 'PRICE_LOW') return a.price - b.price;
    if (this.sortMode === 'PRICE_HIGH') return b.price - a.price;
    if (this.sortMode === 'DURATION') return b.durationHours - a.durationHours;
    if (this.sortMode === 'TITLE') return String(a.title).localeCompare(String(b.title));
    if (this.sortMode === 'LIVE') {
      return Number(b.batch?.status === 'ACTIVE') - Number(a.batch?.status === 'ACTIVE');
    }

    return (
      Number(b.batch?.status === 'ACTIVE') - Number(a.batch?.status === 'ACTIVE') ||
      Number(b.highlights?.length || 0) - Number(a.highlights?.length || 0) ||
      Number(a.price || 0) - Number(b.price || 0)
    );
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }
}
