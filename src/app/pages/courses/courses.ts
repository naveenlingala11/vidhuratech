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
  keyword = '';
  selectedLevel = '';
  selectedMode = '';
  isLoggedIn = false;
  isAdmin = false;
  selectedCurriculum: any = null;
  showCurriculum = false;
  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

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
      if (this.courses.length) {
        this.attachEnrollmentStatuses();
      }
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

        const requests: Observable<any>[] = list.map((course: any) =>
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
              this.courses.find((c) => c.batch?.status === 'ACTIVE') || this.courses[0] || null;

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
      durationHours: c.durationHours || 0,
      level: c.level,
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

    if (!this.auth.isLoggedIn() || role !== 'STUDENT') {
      return;
    }

    this.courses.forEach((course) => {
      if (!course.batch?.id) return;

      this.http
        .get(`${environment.apiUrl}/api/lms/batches/${course.batch.id}/is-enrolled`)
        .subscribe({
          next: (res: any) => {
            course.isEnrolled = !!res?.data;
            this.cdr.detectChanges();
          },
        });
    });
  }

  applyFilters(): void {
    const keyword = this.keyword.trim().toLowerCase();

    let data = [...this.courses];

    if (keyword) {
      data = data.filter((c) =>
        `${c.title} ${c.code} ${c.desc} ${c.level}`.toLowerCase().includes(keyword),
      );
    }

    if (this.selectedLevel) {
      data = data.filter((c) => c.level === this.selectedLevel);
    }

    if (this.selectedMode === 'LIVE') {
      data = data.filter((c) => c.batch?.status === 'ACTIVE');
    }

    if (this.selectedMode === 'UPCOMING') {
      data = data.filter((c) => !c.batch || c.batch?.status !== 'ACTIVE');
    }

    this.filteredCourses = data;
  }

  setActiveCourse(course: any): void {
    this.activeCourse = course;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      alert('Curriculum will be available when a batch is active');
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
            alert('Curriculum not available');
            return;
          }

          let full: any;

          try {
            full = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            alert('Curriculum data corrupted');
            return;
          }

          if (!full?.curriculum || !Array.isArray(full.curriculum)) {
            alert('Curriculum not available');
            return;
          }

          this.selectedCurriculum = this.auth.isLoggedIn()
            ? full
            : {
                ...full,
                curriculum: full.curriculum.slice(0, 2),
              };

          this.selectedCurriculum.curriculum.forEach((m: any) => {
            m.open = false;
          });

          this.showCurriculum = true;

          setTimeout(() => {
            document
              .getElementById('curriculum-section')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: () => alert('Failed to load curriculum'),
      });
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
}
