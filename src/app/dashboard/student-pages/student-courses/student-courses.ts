import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-courses.html',
  styleUrl: './student-courses.css',
})
export class StudentCoursesComponent implements OnInit {
  courses: any[] = [];
  constructor(
    private service: StudentService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.service.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        console.log(this.courses);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  openCourse(batchId: number | undefined): void {
    if (!batchId) {
      console.error('Batch ID missing');
      return;
    }
    this.router.navigate([
      '/dashboard/student/lms',
      batchId
    ]);
  }
}