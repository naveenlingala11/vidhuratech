import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrDashboardService } from '../service/hr-dashboard';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-dashboard.html',
  styleUrls: ['./hr-dashboard.css']
})
export class HrDashboard implements OnInit {

  loading = true;

  stats = {
    totalCandidates: 0,
    interviewsToday: 0,
    offersReleased: 0,
    pendingReviews: 0,
    hiredThisMonth: 0,
    rejected: 0
  };

  pipeline: any[] = [];
  interviews: any[] = [];
  activities: any[] = [];

  constructor(
    private hrService: HrDashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.hrService.getDashboardData().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
        this.pipeline = res.pipeline;
        this.interviews = res.interviews;
        this.activities = res.activities;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}