import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import { StudentLmsService } from '../../../features/lms/services/student-lms.service';
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
    private lmsService: StudentLmsService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        console.log('Enrolled courses:', this.courses);

        // Fetch sessions count for each batch to ensure accurate totals
        this.courses.forEach((course) => {
          if (course.batchId) {
            this.lmsService.getSessions(course.batchId).subscribe({
              next: (sessionRes: any) => {
                const sessionsList = sessionRes?.data || [];
                course.totalSessions = sessionsList.length;
                this.cdr.detectChanges();
              },
              error: (err: any) => {
                console.error(`Failed to fetch sessions for batch ${course.batchId}`, err);
              },
            });
          }
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  openCourse(batchId: number | undefined): void {
    if (!batchId) {
      console.error('Batch ID missing');
      return;
    }
    this.router.navigate(['/dashboard/student/lms', batchId]);
  }
}
