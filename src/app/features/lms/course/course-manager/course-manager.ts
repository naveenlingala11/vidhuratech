import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../model/course.model';
import { CourseService } from '../services/course';

type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

@Component({
  selector: 'app-course-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-manager.html',
  styleUrls: ['./course-manager.css'],
})
export class CourseManagerComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  page = 0;
  size = 10;
  totalElements = 0;
  levels: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  statuses: CourseStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
  filters = {
    keyword: '',
    level: '',
    status: '',
    active: '',
  };

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      thumbnailUrl: [''],
      level: ['BEGINNER', Validators.required],
      durationHours: [1, [Validators.required, Validators.min(1)]],
      startDate: [''],
      endDate: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      metadataJson: [''],
    });
  }

  loadCourses(resetPage = false): void {
    if (resetPage) {
      this.page = 0;
    }

    this.loading = true;
    const params: any = {
      page: this.page,
      size: this.size,
      ...this.filters,
    };

    this.courseService.getCourses(params).subscribe({
      next: (res) => {
        const data = res?.data;
        this.courses = data?.content || [];
        this.totalElements = data?.totalElements || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load courses');
      },
    });
  }

  createNew(): void {
    this.selectedCourse = null;
    this.form.reset({
      title: '',
      code: '',
      description: '',
      thumbnailUrl: '',
      level: 'BEGINNER',
      durationHours: 1,
      startDate: '',
      endDate: '',
      price: 0,
      metadataJson: '',
    });
  }

  editCourse(course: Course): void {
    this.selectedCourse = course;
    this.form.patchValue({
      title: course.title,
      code: course.code,
      description: course.description || '',
      thumbnailUrl: course.thumbnailUrl || '',
      level: course.level,
      durationHours: course.durationHours || 1,
      startDate: course.startDate || '',
      endDate: course.endDate || '',
      price: course.price || 0,
      metadataJson: course.metadataJson || '',
    });
  }

  submit(): void {
    if (this.form.invalid || !this.isMetadataValid()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.buildPayload();
    const request = this.selectedCourse?.id
      ? this.courseService.updateCourse(this.selectedCourse.id, payload)
      : this.courseService.createCourse(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.selectedCourse ? 'Course updated successfully' : 'Course created successfully',
        );
        this.saving = false;
        this.createNew();
        this.loadCourses();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message || 'Course save failed');
      },
    });
  }

  buildPayload(): Course {
    const value = this.form.value;

    return {
      title: value.title?.trim(),
      code: value.code?.trim().toUpperCase(),
      description: value.description?.trim(),
      thumbnailUrl: value.thumbnailUrl?.trim(),
      level: value.level,
      durationHours: Number(value.durationHours),
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
      price: Number(value.price),
      metadataJson: value.metadataJson?.trim(),
    };
  }

  publish(course: Course): void {
    if (!course.id) {
      return;
    }

    this.courseService.publishCourse(course.id).subscribe({
      next: () => {
        this.toastr.success('Course published');
        this.loadCourses();
      },
      error: () => this.toastr.error('Failed to publish course'),
    });
  }

  archive(course: Course): void {
    if (!course.id || !confirm(`Archive ${course.title}?`)) {
      return;
    }

    this.courseService.archiveCourse(course.id).subscribe({
      next: () => {
        this.toastr.warning('Course archived');
        this.loadCourses();
      },
      error: () => this.toastr.error('Failed to archive course'),
    });
  }

  deleteCourse(course: Course): void {
    if (!course.id || !confirm(`Delete ${course.title}? This cannot be undone.`)) {
      return;
    }

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.toastr.success('Course deleted');
        if (this.selectedCourse?.id === course.id) {
          this.createNew();
        }
        this.loadCourses();
      },
      error: () => this.toastr.error('Failed to delete course'),
    });
  }

  formatMetadata(): void {
    const raw = this.form.get('metadataJson')?.value;

    if (!raw?.trim()) {
      this.form.patchValue({
        metadataJson: JSON.stringify({ highlights: [], syllabus: [], outcomes: [] }, null, 2),
      });
      return;
    }

    try {
      this.form.patchValue({ metadataJson: JSON.stringify(JSON.parse(raw), null, 2) });
    } catch {
      this.toastr.error('Metadata JSON is invalid');
    }
  }

  isMetadataValid(): boolean {
    const raw = this.form.get('metadataJson')?.value;

    if (!raw?.trim()) {
      return true;
    }

    try {
      JSON.parse(raw);
      return true;
    } catch {
      this.toastr.error('Metadata JSON is invalid');
      return false;
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size >= this.totalElements) {
      return;
    }

    this.page++;
    this.loadCourses();
  }

  prevPage(): void {
    if (this.page === 0) {
      return;
    }

    this.page--;
    this.loadCourses();
  }

  statusClass(status?: string): string {
    return `status-${(status || 'draft').toLowerCase()}`;
  }
}
