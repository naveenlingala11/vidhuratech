import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../../service/trainer-dashboard';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trainer-assigned-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-assigned-courses.html',
  styleUrls: ['./trainer-assigned-courses.css'],
})
export class TrainerAssignedCoursesComponent implements OnInit {
  loading = true;
  toast = '';

  courses: any[] = [];
  searchText = '';
  levelFilter = '';
  autoFilter: 'ALL' | 'AUTO' | 'MANUAL' = 'ALL';

  constructor(private trainerService: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;

    this.trainerService.getAssignedCourses().subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.courses = [];
        this.loading = false;
        this.showToast('Unable to load assigned courses');
      },
    });
  }

  get filteredCourses(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.courses.filter((course) => {
      const matchesText =
        !term ||
        String(course.title || '')
          .toLowerCase()
          .includes(term) ||
        String(course.code || '')
          .toLowerCase()
          .includes(term) ||
        String(course.description || '')
          .toLowerCase()
          .includes(term);

      const matchesLevel = !this.levelFilter || course.level === this.levelFilter;

      const matchesAuto =
        this.autoFilter === 'ALL' ||
        (this.autoFilter === 'AUTO' && course.autoMonthlyBatchEnabled) ||
        (this.autoFilter === 'MANUAL' && !course.autoMonthlyBatchEnabled);

      return matchesText && matchesLevel && matchesAuto;
    });
  }

  get levels(): string[] {
    return Array.from(new Set(this.courses.map((course) => course.level).filter(Boolean)));
  }

  get stats() {
    return {
      total: this.courses.length,
      autoMonthly: this.courses.filter((course) => course.autoMonthlyBatchEnabled).length,
      manual: this.courses.filter((course) => !course.autoMonthlyBatchEnabled).length,
      filtered: this.filteredCourses.length,
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }
  courseImage(url: string | null | undefined): string {
    if (!url) return '';

    if (url.startsWith('data:')) {
      return url;
    }

    if (url.startsWith('http')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${environment.apiUrl}${url}`;
    }

    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }
  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  trackByCourse(_: number, course: any): number {
    return course.courseId || course.assignmentId;
  }
}
