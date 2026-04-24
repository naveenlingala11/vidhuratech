import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.html'
})
export class CourseFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  courseId!: number;

  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.courseId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourse();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      thumbnailUrl: [''],
      level: ['BEGINNER', Validators.required],
      durationHours: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (res) => {
          this.form.patchValue(res.data);
        },
        error: () => {
          this.toastr.error('Failed to load course');
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.isEditMode
      ? this.courseService.updateCourse(this.courseId, this.form.value)
      : this.courseService.createCourse(this.form.value);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.isEditMode
            ? 'Course updated successfully'
            : 'Course created successfully'
        );

        this.router.navigate(['/dashboard/lms/courses']);
      },
      error: (err) => {
        this.toastr.error(
          err?.error?.message || 'Operation failed'
        );
      }
    });
  }
}