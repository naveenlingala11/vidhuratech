import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.html'
})
export class CourseListComponent implements OnInit {

  courses: any[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  loading = false;

  filters = {
    keyword: '',
    level: '',
    status: '',
    active: ''
  };

  constructor(
    private courseService: CourseService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;

    this.courseService.getCourses({
      page: this.page,
      size: this.size,
      ...this.filters
    }).subscribe({
      next: (res) => {
        this.courses = res.data.content;
        this.totalElements = res.data.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load courses');
      }
    });
  }

  publish(id: number): void {
    this.courseService.publishCourse(id).subscribe(() => {
      this.toastr.success('Course published successfully');
      this.loadCourses();
    });
  }

  archive(id: number): void {
    if (!confirm('Archive this course?')) return;

    this.courseService.archiveCourse(id).subscribe(() => {
      this.toastr.warning('Course archived');
      this.loadCourses();
    });
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) return;

    this.courseService.deleteCourse(id).subscribe(() => {
      this.toastr.success('Course deleted');
      this.loadCourses();
    });
  }
}