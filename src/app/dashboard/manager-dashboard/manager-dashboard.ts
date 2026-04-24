import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerDashboardService } from '../service/manager-dashboard';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboard implements OnInit {

  loading = true;

  stats = {
    teamMembers: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    escalations: 0,
    avgPerformance: 0,
    attendanceRate: 0
  };

  departments: any[] = [];
  teamPerformance: any[] = [];
  recentActivities: any[] = [];

  constructor(
    private managerService: ManagerDashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.managerService.getDashboardData().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
        this.departments = res.departments;
        this.teamPerformance = res.teamPerformance;
        this.recentActivities = res.recentActivities;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}