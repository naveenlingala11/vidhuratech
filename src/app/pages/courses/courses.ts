import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  upcomingCourses: any[] = [];
  loading = false;
  error = '';
  keyword = '';
  selectedLevel = '';
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
      if (isLogged && this.courses.length) {
        this.attachActiveBatches();
      }
    });

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  loadCourses() {
    this.loading = true;
    this.error = '';

    this.courseService.getCourses(this.isAdmin).subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        this.courses = list.map((c: any) => this.mapCourse(c));

        if (!this.courses.length) {
          this.processCourses();
          return;
        }

        this.attachActiveBatches();
      },
      error: () => {
        this.error = 'Failed to load courses';
        this.loading = false;
      },
    });
  }

  mapCourse(c: any) {
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
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      slug: this.getCourseSlug(c),
      batch: null,
      isEnrolled: false,
      highlights: meta.highlights || [],
      syllabus: meta.syllabus || [],
      outcomes: meta.outcomes || [],
    };
  }

  publish(course: any) {
    this.http
      .patch(`${environment.apiUrl}/api/lms/courses/${course.id}/publish`, {})
      .subscribe(() => {
        course.status = 'PUBLISHED';
        alert('Published');
      });
  }

  attachActiveBatches() {
    if (!this.courses.length) {
      this.processCourses();
      return;
    }

    let completed = 0;

    this.courses.forEach((course) => {
      this.batchService.getActiveBatch(course.id).subscribe({
        next: (res: any) => {
          course.batch = res?.data || null;
          this.attachEnrollmentStatus(course);
        },
        error: () => {
          course.batch = null;
        },
        complete: () => {
          completed++;
          if (completed === this.courses.length) {
            this.processCourses();
          }
        },
      });
    });
  }

  attachEnrollmentStatus(course: any) {
    const role = localStorage.getItem('role');

    if (!course.batch || !this.auth.isLoggedIn() || role !== 'STUDENT') {
      return;
    }

    this.http
      .get(`${environment.apiUrl}/api/lms/batches/${course.batch.id}/is-enrolled`)
      .subscribe((res: any) => {
        course.isEnrolled = !!res?.data;
        this.cdr.detectChanges();
      });
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

    if (knownSlugs[code]) {
      return knownSlugs[code];
    }

    return (course?.title || 'course')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  viewDetails(course: any) {
    this.router.navigate(['/courses', course.slug || this.getCourseSlug(course)]);
  }

  goToCheckout(course: any) {
    if (!this.auth.isLoggedIn()) {
      localStorage.setItem('checkoutCourse', course.id);
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/checkout'], { queryParams: { courseId: course.id } });
  }

  goToLearning(course: any) {
    this.router.navigate(['/dashboard/student/lms', course.batch.id]);
  }

  processCourses() {
    this.activeCourse = this.courses.find((c) => c.batch?.status === 'ACTIVE') || null;
    this.upcomingCourses = this.courses.filter((c) => c.batch?.status !== 'ACTIVE');
    this.applyFilters();
    this.loading = false;
    this.cdr.detectChanges();
  }

  applyFilters() {
    const keyword = this.keyword.trim().toLowerCase();
    let data = [...this.upcomingCourses];

    if (keyword) {
      data = data.filter((c) => `${c.title} ${c.desc} ${c.level}`.toLowerCase().includes(keyword));
    }

    if (this.selectedLevel) {
      data = data.filter((c) => c.level === this.selectedLevel);
    }

    this.filteredCourses = data;
  }

  viewCurriculum(course: any) {
    const batchId = course?.batch?.id;

    if (!batchId) {
      alert('No active batch found');
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

          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 403) {
            alert('Curriculum API is blocked. Please allow public access in backend.');
            return;
          }

          if (err.status === 404) {
            alert('Curriculum not available for this batch');
            return;
          }

          alert('Failed to load curriculum');
        },
      });
  }
}
