import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardService } from '../../service/student-dashboard';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {

  loading = true;

  stats = {
    enrolledCourses: 0,
    attendance: 0,
    assignmentsPending: 0,
    assessmentsUpcoming: 0,
    certificates: 0,
    placementStatus: 'Not Eligible'
  };

  myCourses: any[] = [];
  notifications: any[] = [];
  mentorSessions: any[] = [];

  constructor(
    private studentService: StudentDashboardService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    this.studentService.getDashboardData().subscribe({
      next: (res: any) => {
        this.stats = res.data.stats;
        this.myCourses = res.data.sections.myCourses || [];
        this.notifications = res.data.sections.notifications || [];
        this.mentorSessions = res.data.sections.mentorSessions || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}