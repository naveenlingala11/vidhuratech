import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentMentorService } from '../service/student-mentor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student-mentor-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-mentor-progress.html',
  styleUrls: ['./student-mentor-progress.css']
})
export class StudentMentorProgressComponent implements OnInit {
  loading = true;
  mentors: any[] = [];
  stats = {
    avgProgress: 0,
    totalMentors: 0,
    completedSessions: 0,
    upcomingSessions: 0
  };

  constructor(
    private mentorService: StudentMentorService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.mentorService.getDashboard().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data;
          this.stats.avgProgress = d.avgProgress || 0;
          this.stats.totalMentors = d.totalMentors || 0;
          this.stats.completedSessions = d.completedSessions || 0;
          this.stats.upcomingSessions = d.upcomingSessions || 0;
          this.mentors = (d.mentors || []).map((m: any) => ({
            ...m,
            level: m.progress >= 80 ? 'Advanced' : m.progress >= 40 ? 'Intermediate' : 'Beginner',
            levelClass: m.progress >= 80 ? 'advanced' : m.progress >= 40 ? 'intermediate' : 'beginner'
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load progress data');
      }
    });
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#10b981';
    if (progress >= 40) return '#3b82f6';
    return '#f59e0b';
  }
}
