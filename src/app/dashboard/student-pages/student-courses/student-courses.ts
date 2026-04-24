import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-courses',
  imports: [CommonModule],
  templateUrl: './student-courses.html',
  styleUrl: './student-courses.css',
})
export class StudentCoursesComponent implements OnInit {

  courses: any[] = [];

  constructor(private service: StudentService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.service.getCourses().subscribe((res: any) => {
      this.courses = res.data;
      this.cdr.detectChanges();
    });
  }

  openCourse(batchId: number) {
    this.router.navigate(['/dashboard/student/lms', batchId]);
  }
}
