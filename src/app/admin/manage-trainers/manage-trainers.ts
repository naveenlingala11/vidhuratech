import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCourseTrainerService } from '../services/admin-course-trainers';
import { CourseService } from '../../features/lms/course/services/course';

@Component({
  selector: 'app-manage-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-trainers.html',
  styleUrls: ['./manage-trainers.css'],
})
export class ManageTrainersComponent implements OnInit {
  loading = false;
  saving = false;
  generatingCurrent = false;
  generatingNext = false;
  deactivatingId: number | null = null;

  toast = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  trainers: any[] = [];
  courses: any[] = [];
  assignments: any[] = [];

  searchText = '';
  trainerFilter = 0;
  courseFilter = 0;

  form = {
    courseId: 0,
    trainerId: 0,
  };

  constructor(
    private trainerService: AdminCourseTrainerService,
    private courseService: CourseService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    this.trainerService.getTrainers().subscribe({
      next: (res: any) => {
        this.trainers = res?.data || [];
      },
      error: () => this.showToast('Unable to load trainers', 'error'),
    });

    this.courseService.getCourses({ page: 0, size: 200 }).subscribe({
      next: (res: any) => {
        this.courses = res?.data?.content || [];
      },
      error: () => this.showToast('Unable to load courses', 'error'),
    });

    this.trainerService.getAssignments().subscribe({
      next: (res: any) => {
        this.assignments = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load trainer assignments', 'error');
      },
    });
  }

  assign(): void {
    if (!this.form.courseId || !this.form.trainerId) {
      this.showToast('Select course and trainer', 'error');
      return;
    }

    this.saving = true;

    this.trainerService
      .assignTrainer({
        courseId: Number(this.form.courseId),
        trainerId: Number(this.form.trainerId),
      })
      .subscribe({
        next: (res: any) => {
          this.saving = false;
          this.form = { courseId: 0, trainerId: 0 };
          this.showToast(res?.message || 'Trainer assigned successfully', 'success');
          this.loadAll();
        },
        error: (err) => {
          console.error('Assignment failed:', err);
          this.saving = false;
          this.showToast(err?.error?.message || err?.error?.error || 'Assignment failed', 'error');
        },
      });
  }

  deactivate(item: any): void {
    if (!item?.id) return;

    if (!confirm(`Remove ${item.trainerName} from ${item.courseTitle}?`)) return;

    this.deactivatingId = item.id;

    this.trainerService.deactivateAssignment(item.id).subscribe({
      next: (res: any) => {
        this.deactivatingId = null;
        this.showToast(res?.message || 'Assignment deactivated', 'success');
        this.loadAll();
      },
      error: (err) => {
        console.error('Deactivate failed:', err);
        this.deactivatingId = null;
        this.showToast(err?.error?.message || err?.error?.error || 'Unable to deactivate', 'error');
      },
    });
  }

  generateCurrent(): void {
    this.generatingCurrent = true;

    this.trainerService.generateCurrentMonth().subscribe({
      next: (res: any) => {
        this.generatingCurrent = false;
        this.showToast(`Current month batches created: ${res?.data?.created || 0}`, 'success');
        this.loadAll();
      },
      error: (err) => {
        this.generatingCurrent = false;
        this.showToast(err?.error?.message || 'Batch generation failed', 'error');
      },
    });
  }

  generateNext(): void {
    this.generatingNext = true;

    this.trainerService.generateNextMonth().subscribe({
      next: (res: any) => {
        this.generatingNext = false;
        this.showToast(`Next month batches created: ${res?.data?.created || 0}`, 'success');
        this.loadAll();
      },
      error: (err) => {
        this.generatingNext = false;
        this.showToast(err?.error?.message || 'Batch generation failed', 'error');
      },
    });
  }

  get selectedCourse(): any {
    return this.courses.find((course) => Number(course.id) === Number(this.form.courseId));
  }

  get selectedTrainer(): any {
    return this.trainers.find((trainer) => Number(trainer.id) === Number(this.form.trainerId));
  }

  get filteredAssignments(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.assignments.filter((item) => {
      const matchesText =
        !term ||
        String(item.courseTitle || '')
          .toLowerCase()
          .includes(term) ||
        String(item.courseCode || '')
          .toLowerCase()
          .includes(term) ||
        String(item.trainerName || '')
          .toLowerCase()
          .includes(term) ||
        String(item.trainerEmail || '')
          .toLowerCase()
          .includes(term);

      const matchesTrainer =
        !this.trainerFilter || Number(item.trainerId) === Number(this.trainerFilter);

      const matchesCourse =
        !this.courseFilter || Number(item.courseId) === Number(this.courseFilter);

      return matchesText && matchesTrainer && matchesCourse;
    });
  }

  get assignedTrainerIds(): Set<number> {
    return new Set(this.assignments.map((item) => Number(item.trainerId)));
  }

  get assignedCourseIds(): Set<number> {
    return new Set(this.assignments.map((item) => Number(item.courseId)));
  }

  get stats() {
    return {
      assignments: this.assignments.length,
      trainers: this.trainers.length,
      assignedTrainers: this.assignedTrainerIds.size,
      assignedCourses: this.assignedCourseIds.size,
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toast = message;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
