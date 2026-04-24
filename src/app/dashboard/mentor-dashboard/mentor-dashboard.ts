import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorDashboardService } from '../service/mentor-dashboard';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-dashboard.html',
  styleUrls: ['./mentor-dashboard.css']
})
export class MentorDashboard implements OnInit {

  loading = true;

  stats = {
    mentees: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    pendingFeedback: 0,
    avgProgress: 0
  };

  menteeProgress: any[] = [];
  upcomingMeetings: any[] = [];
  goals: any[] = [];

  constructor(
    private mentorService: MentorDashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.mentorService.getDashboardData().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
        this.menteeProgress = res.menteeProgress;
        this.upcomingMeetings = res.upcomingMeetings;
        this.goals = res.goals;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}