import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MentorDashboardService } from '../../service/mentor-dashboard';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-earnings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mentor-earnings.html',
  styleUrls: ['./mentor-earnings.css']
})
export class MentorEarningsComponent implements OnInit {
  loading = true;
  profile: any = null;
  stats = {
    totalEarnings: 0,
    menteesCount: 0,
    completedSessionsCount: 0,
    upcomingSessionsCount: 0
  };

  // Computed breakdowns
  hourlyRate = 0;
  weeklyRate = 0;
  monthlyRate = 0;
  projectedMonthly = 0;

  constructor(
    private dashboardService: MentorDashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data;
          this.profile = d.profile;
          this.stats.totalEarnings = d.totalEarnings || 0;
          this.stats.menteesCount = d.menteesCount || 0;
          this.stats.completedSessionsCount = d.completedSessionsCount || 0;
          this.stats.upcomingSessionsCount = d.upcomingSessionsCount || 0;

          this.hourlyRate = d.profile?.pricePerHour || 0;
          this.weeklyRate = d.profile?.pricePerWeek || 0;
          this.monthlyRate = d.profile?.pricePerMonth || 0;

          // Simple projected monthly = completedSessions * hourlyRate * 4 (4 weeks)
          const avgSessionsPerWeek = this.stats.completedSessionsCount > 0 ? this.stats.completedSessionsCount : this.stats.menteesCount;
          this.projectedMonthly = avgSessionsPerWeek * this.hourlyRate * 4;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load earnings data');
      }
    });
  }
}
