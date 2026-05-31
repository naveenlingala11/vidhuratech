import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.css'],
})
export class CourseListComponent implements OnInit {
  courses: any[] = [];
  page = 0;
  size = 12;
  totalElements = 0;
  loading = false;
  savingId: number | null = null;

  filters = {
    keyword: '',
    level: '',
    status: '',
    active: '',
    featured: '',
    monthly: '',
  };

  constructor(
    private courseService: CourseService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  get visibleCourses(): any[] {
    return this.courses.filter((course) => {
      const featuredOk =
        !this.filters.featured || String(!!course.featuredOnHome) === this.filters.featured;

      const monthlyOk =
        !this.filters.monthly || String(!!course.autoMonthlyBatchEnabled) === this.filters.monthly;

      return featuredOk && monthlyOk;
    });
  }

  get draftCount(): number {
    return this.courses.filter((c) => c.status === 'DRAFT').length;
  }

  get featuredCount(): number {
    return this.courses.filter((c) => c.featuredOnHome).length;
  }

  get monthlyCount(): number {
    return this.courses.filter((c) => c.autoMonthlyBatchEnabled).length;
  }

  get publishedCount(): number {
    return this.courses.filter((c) => c.status === 'PUBLISHED').length;
  }

  loadCourses(): void {
    this.loading = true;

    const params: any = {
      page: this.page,
      size: this.size,
    };

    if (this.filters.keyword) params.keyword = this.filters.keyword;
    if (this.filters.level) params.level = this.filters.level;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.active) params.active = this.filters.active;

    this.courseService.getCourses(params).subscribe({
      next: (res: any) => {
        this.courses = res?.data?.content || [];
        this.totalElements = res?.data?.totalElements || 0;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Failed to load courses');
      },
    });
  }

  toggleFeatured(course: any, event?: Event): void {
    event?.stopPropagation();

    const next = !course.featuredOnHome;
    const rank = course.featuredRank || this.nextFeaturedRank();

    this.patchCourse(
      course,
      {
        featuredOnHome: next,
        featuredRank: rank,
      },
      next ? 'Course enabled on home hero' : 'Course removed from home hero',
    );
  }

  updateFeaturedRank(course: any, event?: Event): void {
    event?.stopPropagation();

    if (!course.featuredOnHome) return;

    this.patchCourse(
      course,
      {
        featuredRank: Number(course.featuredRank || 100),
      },
      'Featured rank updated',
    );
  }

  toggleMonthly(course: any, event?: Event): void {
    event?.stopPropagation();

    const next = !course.autoMonthlyBatchEnabled;

    this.patchCourse(
      course,
      {
        autoMonthlyBatchEnabled: next,
        monthlyBatchDurationMonths: course.monthlyBatchDurationMonths || 3,
      },
      next ? 'Monthly batch automation enabled' : 'Monthly batch automation disabled',
    );
  }

  publish(course: any, event?: Event): void {
    event?.stopPropagation();

    this.savingId = course.id;

    this.courseService.publishCourse(course.id).subscribe({
      next: (res: any) => {
        this.savingId = null;
        this.toastr.success(res?.message || 'Course published, batch created, trainer assigned');
        this.loadCourses();
      },
      error: (err) => {
        this.savingId = null;
        this.toastr.error(err?.error?.message || 'Publish failed');
      },
    });
  }

  // archive(course: any, event?: Event): void {
  //   event?.stopPropagation();

  //   if (!confirm('Archive this course?')) return;

  //   this.savingId = course.id;

  //   this.courseService.archiveCourse(course.id).subscribe({
  //     next: () => {
  //       this.savingId = null;
  //       this.toastr.warning('Course archived');
  //       this.loadCourses();
  //     },
  //     error: (err) => {
  //       this.savingId = null;
  //       this.toastr.error(err?.error?.message || 'Archive failed');
  //     },
  //   });
  // }

  unpublish(course: any, event?: Event): void {
    event?.stopPropagation();

    if (!confirm('Unpublish this course? It will be hidden from public pages.')) return;

    this.savingId = course.id;

    this.courseService.unpublishCourse(course.id).subscribe({
      next: (res: any) => {
        this.savingId = null;
        this.toastr.warning(res?.message || 'Course unpublished');
        this.loadCourses();
      },
      error: (err) => {
        this.savingId = null;
        this.toastr.error(err?.error?.message || 'Unpublish failed');
      },
    });
  }

  delete(course: any, event?: Event): void {
    event?.stopPropagation();

    if (!confirm('Are you sure you want to delete this course?')) return;

    this.savingId = course.id;

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.savingId = null;
        this.toastr.success('Course deleted');
        this.loadCourses();
      },
      error: (err) => {
        this.savingId = null;
        this.toastr.error(err?.error?.message || 'Delete failed');
      },
    });
  }

  resetFilters(): void {
    this.filters = {
      keyword: '',
      level: '',
      status: '',
      active: '',
      featured: '',
      monthly: '',
    };
    this.page = 0;
    this.loadCourses();
  }

  editCourse(course: any): void {
    this.router.navigate(['/dashboard/lms/courses', course.id, 'edit']);
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

  statusLabel(status: string): string {
    if (status === 'PUBLISHED') return 'Published';
    if (status === 'ARCHIVED') return 'Archived';
    return 'Draft';
  }

  statusClass(status: string): string {
    if (status === 'PUBLISHED') return 'published';
    if (status === 'ARCHIVED') return 'archived';
    return 'draft';
  }

  private patchCourse(course: any, changes: any, message: string): void {
    this.savingId = course.id;

    const payload = this.buildPayload(course, changes);

    this.courseService.updateCourse(course.id, payload).subscribe({
      next: () => {
        Object.assign(course, payload);
        this.savingId = null;
        this.toastr.success(message);
      },
      error: (err) => {
        this.savingId = null;
        this.toastr.error(err?.error?.message || 'Course update failed');
      },
    });
  }

  private buildPayload(course: any, changes: any = {}): any {
    const next = { ...course, ...changes };

    return {
      title: next.title,
      code: next.code,
      description: next.description || '',
      level: next.level,
      durationHours: Number(next.durationHours || 1),
      startDate: next.startDate || null,
      endDate: next.endDate || null,
      price: Number(next.price || 0),
      metadataJson: next.metadataJson || '',
      featuredOnHome: !!next.featuredOnHome,
      featuredRank: Number(next.featuredRank || 100),
      autoMonthlyBatchEnabled: !!next.autoMonthlyBatchEnabled,
      monthlyBatchDurationMonths: Number(next.monthlyBatchDurationMonths || 3),
      defaultTrainerId: next.defaultTrainerId || null,
    };
  }

  private nextFeaturedRank(): number {
    const ranks = this.courses
      .filter((c) => c.featuredOnHome)
      .map((c) => Number(c.featuredRank || 0));

    return ranks.length ? Math.max(...ranks) + 1 : 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.size));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);

    const pages: number[] = [];

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) return;

    this.page = page;
    this.loadCourses();
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  prevPage(): void {
    this.goToPage(this.page - 1);
  }

  changePageSize(): void {
    this.page = 0;
    this.loadCourses();
  }
}
