import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../features/lms/batch/services/batch';
import { PublicCourseService } from './service/public-course';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {

  courses: any[] = [];
  filteredCourses: any[] = [];

  activeCourse: any = null;
  upcomingCourses: any[] = [];

  loading = false;
  error = '';
  keyword = '';
  selectedLevel = '';
  isLoggedIn = false;

  selectedCurriculum: any = null;
  showCurriculum = false;

  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  constructor(
    private courseService: PublicCourseService,
    private batchService: BatchService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) { }

  isAdmin = false;

  ngOnInit(): void {

    const role = localStorage.getItem('role');
    this.isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    // 🔥 REACTIVE LOGIN STATE
    this.auth.authState.subscribe(isLogged => {
      this.isLoggedIn = isLogged;

      // Optional: reload batches if login happens
      if (isLogged) {
        this.attachActiveBatches();
      }
    });

    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    console.log(this.courses);

    this.courseService.getCourses(this.isAdmin).subscribe({
      next: (res: any) => {

        const list = res?.data || [];

        this.courses = list.map((c: any) => {

          let meta: any = {};
          try {
            meta = c.metadataJson ? JSON.parse(c.metadataJson) : {};
          } catch { }

          return {
            id: c.id,
            title: c.title,
            desc: c.description || '',
            duration: (c.durationHours || 0) + ' hrs',
            level: c.level,
            status: c.status,
            batch: null,
            open: false,

            highlights: meta.highlights || [],
            syllabus: meta.syllabus || [],
            outcomes: meta.outcomes || []
          };
        });

        this.attachActiveBatches();
      },
      error: () => {
        this.error = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  publish(course: any) {
    this.http.patch(
      `${environment.apiUrl}/api/lms/courses/${course.id}/publish`, {}
    ).subscribe(() => {
      course.status = 'PUBLISHED';
      alert('✅ Published');
    });
  }

  attachActiveBatches() {
    let completed = 0;

    this.courses.forEach(course => {

      this.batchService.getActiveBatch(course.id).subscribe({
        next: (res: any) => {
          course.batch = res?.data || null;

          // ✅ CORRECT PLACE
          const role = localStorage.getItem('role');

          if (course.batch && this.auth.isLoggedIn() && role === 'STUDENT') {
            this.http.get(
              `${environment.apiUrl}/api/lms/batches/${course.batch.id}/is-enrolled`
            ).subscribe((res: any) => {
              course.isEnrolled = res.data;
            });
          }
        },
        error: () => {
          course.batch = null;
        },
        complete: () => {
          completed++;

          if (completed === this.courses.length) {
            this.processCourses();
          }
        }
      });
    });
  }

  goToCheckout(course: any) {

    if (!this.auth.isLoggedIn()) {
      localStorage.setItem('checkoutCourse', course.id);
      window.location.href = '/login';
      return;
    }

    window.location.href = `/checkout?courseId=${course.id}`;
  }

  goToLearning(course: any) {
    window.location.href = `/dashboard/student/lms/${course.batch.id}`;
  }

  processCourses() {

    this.activeCourse = this.courses.find(c =>
      c.batch?.status === 'ACTIVE'
    );

    this.upcomingCourses = this.courses.filter(c =>
      c.batch?.status !== 'ACTIVE'
    );

    this.applyFilters();
    this.loading = false;
    this.cdr.detectChanges();
  }

  applyFilters() {

    let data = [...this.upcomingCourses];

    if (this.keyword) {
      data = data.filter(c =>
        c.title.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }

    if (this.selectedLevel) {
      data = data.filter(c => c.level === this.selectedLevel);
    }

    this.filteredCourses = data;
  }

  toggle(c: any) {
    c.open = !c.open;
  }

  viewCurriculum(course: any) {
    const batchId = course?.batch?.id;

    if (!batchId) {
      alert('No active batch found');
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/api/trainer/public-curriculum`, {
      params: { batchId: batchId.toString() }
    }).subscribe({
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
          console.error('Invalid curriculum JSON:', raw);
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
            curriculum: full.curriculum.slice(0, 2)
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
        console.error('Curriculum API failed:', err);

        if (err.status === 403) {
          alert('Curriculum API is blocked. Please allow public access in backend.');
          return;
        }

        if (err.status === 404) {
          alert('Curriculum not available for this batch');
          return;
        }

        alert('Failed to load curriculum');
      }
    });
  }

}