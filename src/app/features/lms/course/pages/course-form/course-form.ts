import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-form.html',
  styleUrls: ['./course-form.css'],
})
export class CourseFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  courseId!: number;
  saving = false;
  loading = false;
  metadataError = '';
  trainers: any[] = [];
  selectedThumbnailFile: File | null = null;
  thumbnailPreviewUrl = '';
  uploadingThumbnail = false;
  existingThumbnailUrl = '';

  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.courseId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourse();
    }
    this.loadTrainers();
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      level: ['BEGINNER', Validators.required],
      durationHours: [1, [Validators.required, Validators.min(1)]],
      startDate: [''],
      endDate: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      metadataJson: [''],

      featuredOnHome: [false],
      featuredRank: [100, [Validators.min(1)]],
      autoMonthlyBatchEnabled: [false],
      monthlyBatchDurationMonths: [3, [Validators.min(1)]],
      defaultTrainerId: [null],
    });
  }

  loadTrainers(): void {
    this.http
      .get<any>(`${environment.apiUrl}/api/users`, {
        params: { role: 'TRAINER' },
      })
      .subscribe({
        next: (res) => {
          const data = res?.data;

          this.trainers = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : Array.isArray(res?.content)
                ? res.content
                : [];
        },
        error: () => {
          this.trainers = [];
          this.toastr.error('Failed to load trainers');
        },
      });
  }

  loadCourse(): void {
    this.loading = true;

    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        const course = res?.data || {};

        this.existingThumbnailUrl = course.thumbnailUrl || '';

        this.form.patchValue({
          title: course.title || '',
          code: course.code || '',
          description: course.description || '',
          level: course.level || 'BEGINNER',
          durationHours: course.durationHours || 1,
          startDate: course.startDate || '',
          endDate: course.endDate || '',
          price: course.price || 0,
          metadataJson: course.metadataJson || '',
          featuredOnHome: !!course.featuredOnHome,
          featuredRank: course.featuredRank || 100,
          autoMonthlyBatchEnabled: !!course.autoMonthlyBatchEnabled,
          monthlyBatchDurationMonths: course.monthlyBatchDurationMonths || 3,
          defaultTrainerId: course.defaultTrainerId || null,
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load course');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please fill required fields');
      return;
    }

    this.metadataError = '';

    const metadataJson = String(this.form.value.metadataJson || '').trim();

    if (metadataJson) {
      try {
        JSON.parse(metadataJson);
      } catch {
        this.metadataError = 'Metadata JSON is invalid';
        this.toastr.error('Fix metadata JSON');
        return;
      }
    }

    this.saving = true;

    const payload = {
      ...this.form.value,
      price: Number(this.form.value.price || 0),
      durationHours: Number(this.form.value.durationHours || 1),
      featuredOnHome: !!this.form.value.featuredOnHome,
      featuredRank: Number(this.form.value.featuredRank || 100),
      autoMonthlyBatchEnabled: !!this.form.value.autoMonthlyBatchEnabled,
      monthlyBatchDurationMonths: Number(this.form.value.monthlyBatchDurationMonths || 3),
      defaultTrainerId: this.form.value.defaultTrainerId
        ? Number(this.form.value.defaultTrainerId)
        : null,
    };

    delete (payload as any).thumbnailUrl;

    const request = this.isEditMode
      ? this.courseService.updateCourse(this.courseId, payload)
      : this.courseService.createCourse(payload);

    request.subscribe({
      next: (res: any) => {
        const savedCourse = res?.data;
        const savedCourseId = savedCourse?.id || this.courseId;

        this.uploadThumbnailIfNeeded(savedCourseId, () => {
          this.saving = false;
          this.toastr.success(
            this.isEditMode ? 'Course updated successfully' : 'Course created successfully',
          );
          this.router.navigate(['/dashboard/lms/courses']);
        });
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message || 'Operation failed');
      },
    });
  }

  clearThumbnail(): void {
    this.selectedThumbnailFile = null;
    this.thumbnailPreviewUrl = '';
    this.existingThumbnailUrl = '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }

  get previewTitle(): string {
    return this.form?.value?.title || 'Course Title';
  }

  get previewDescription(): string {
    return this.form?.value?.description || 'Course description will appear here.';
  }

  get previewPrice(): number {
    return Number(this.form?.value?.price || 0);
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only JPG, PNG, and WEBP images are allowed');
      input.value = '';
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      this.toastr.error('Thumbnail image must be below 4MB');
      input.value = '';
      return;
    }

    this.selectedThumbnailFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreviewUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  clearSelectedThumbnail(): void {
    this.selectedThumbnailFile = null;
    this.thumbnailPreviewUrl = '';
  }

  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }

  private uploadThumbnailIfNeeded(courseId: number, done: () => void): void {
    if (!this.selectedThumbnailFile) {
      done();
      return;
    }

    this.uploadingThumbnail = true;

    this.courseService.uploadThumbnail(courseId, this.selectedThumbnailFile).subscribe({
      next: (res: any) => {
        this.uploadingThumbnail = false;

        const uploadedUrl = res?.data?.thumbnailUrl;
        if (uploadedUrl) {
          this.existingThumbnailUrl = uploadedUrl;
        }

        done();
      },
      error: (err) => {
        this.uploadingThumbnail = false;
        this.saving = false;
        this.toastr.error(err?.error?.message || 'Thumbnail upload failed');
      },
    });
  }

  get previewImage(): string {
    if (this.thumbnailPreviewUrl) return this.thumbnailPreviewUrl;
    return this.resolveImageUrl(this.existingThumbnailUrl);
  }

  get metadataObject(): any {
    try {
      return this.form?.value?.metadataJson ? JSON.parse(this.form.value.metadataJson) : {};
    } catch {
      return {};
    }
  }

  get previewHighlights(): string[] {
    return Array.isArray(this.metadataObject?.highlights) ? this.metadataObject.highlights : [];
  }

  get previewOutcomes(): string[] {
    return Array.isArray(this.metadataObject?.outcomes) ? this.metadataObject.outcomes : [];
  }

  get previewOldPrice(): number {
    return Number(this.metadataObject?.oldPrice || 0);
  }

  get previewDiscountLabel(): string {
    return String(this.metadataObject?.discountLabel || '');
  }

  generateCourseCode(): void {
    const title = String(this.form.value.title || '').trim();

    if (!title) {
      this.toastr.warning('Enter course title first');
      return;
    }

    const code = title
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24);

    this.form.patchValue({ code });
  }

  formatMetadata(): void {
    const raw = String(this.form.value.metadataJson || '').trim();

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      this.form.patchValue({ metadataJson: JSON.stringify(parsed, null, 2) });
      this.metadataError = '';
      this.toastr.success('Metadata formatted');
    } catch {
      this.metadataError = 'Metadata JSON is invalid';
      this.toastr.error('Invalid metadata JSON');
    }
  }

  applyMetadataTemplate(): void {
    const title = this.form.value.title || 'Career Program';

    const template = {
      oldPrice: 4999,
      discountLabel: 'Limited time offer',
      highlights: [
        'Live mentor-led classes',
        'Hands-on projects',
        'Assignments and assessments',
        'Interview preparation',
      ],
      outcomes: [
        `Complete ${title} foundation`,
        'Build portfolio-ready projects',
        'Practice real interview questions',
        'Become job-ready with confidence',
      ],
    };

    this.form.patchValue({
      metadataJson: JSON.stringify(template, null, 2),
    });

    this.metadataError = '';
  }

  setPricePreset(price: number, oldPrice: number, label: string): void {
    this.form.patchValue({ price });

    const meta = {
      ...this.metadataObject,
      oldPrice,
      discountLabel: label,
    };

    this.form.patchValue({
      metadataJson: JSON.stringify(meta, null, 2),
    });
  }

  useHomeHeroPreset(): void {
    this.form.patchValue({
      featuredOnHome: true,
      featuredRank: 1,
      autoMonthlyBatchEnabled: true,
      monthlyBatchDurationMonths: 3,
    });

    this.toastr.success('Home hero preset applied');
  }

  setDurationPreset(hours: number): void {
    this.form.patchValue({ durationHours: hours });
  }

  syncEndDateFromStart(): void {
    const startDate = this.form.value.startDate;
    const months = Number(this.form.value.monthlyBatchDurationMonths || 3);

    if (!startDate) {
      this.toastr.warning('Select start date first');
      return;
    }

    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);

    this.form.patchValue({
      endDate: date.toISOString().slice(0, 10),
    });
  }
}
