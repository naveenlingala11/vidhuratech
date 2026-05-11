import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerDashboardService } from '../service/manager-dashboard';
import { RoleAction, RolePanel, RoleStatCard } from '../shared/role-dashboard.model';

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
  statCards: RoleStatCard[] = [];
  panels: RolePanel[] = [];
  actions: RoleAction[] = [
    { label: 'Approve Requests', helper: 'Review pending team approvals', tone: 'tone-blue' },
    { label: 'Assign Tasks', helper: 'Create work ownership for teams', tone: 'tone-green' },
    { label: 'View Reports', helper: 'Open team and project reports', tone: 'tone-purple' },
    { label: 'Schedule Review', helper: 'Plan performance check-in', tone: 'tone-teal' }
  ];

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
        this.buildViewModel();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  buildViewModel() {
    this.statCards = [
      { label: 'Team Members', value: this.stats.teamMembers, helper: 'Across departments', tone: 'tone-blue' },
      { label: 'Active Projects', value: this.stats.activeProjects, helper: 'Currently running', tone: 'tone-green' },
      { label: 'Pending Approvals', value: this.stats.pendingApprovals, helper: 'Needs manager decision', tone: 'tone-orange' },
      { label: 'Escalations', value: this.stats.escalations, helper: 'High priority items', tone: 'tone-red' },
      { label: 'Avg Performance', value: `${this.stats.avgPerformance}%`, helper: 'Team health score', tone: 'tone-purple' },
      { label: 'Attendance Rate', value: `${this.stats.attendanceRate}%`, helper: 'Current attendance', tone: 'tone-teal' }
    ];

    this.panels = [
      {
        eyebrow: 'Teams',
        title: 'Departments',
        type: 'pipeline',
        items: this.departments.map(item => ({
          title: item.name,
          value: item.members,
          progress: this.departmentPercent(item.members)
        }))
      },
      {
        eyebrow: 'Performance',
        title: 'Team Performance',
        type: 'progress',
        items: this.teamPerformance.map(item => ({
          title: item.employee,
          value: `${item.score}%`,
          progress: Number(item.score || 0)
        }))
      },
      {
        eyebrow: 'Updates',
        title: 'Recent Activities',
        type: 'list',
        items: this.recentActivities.map(item => ({
          title: item.title,
          description: item.description
        }))
      }
    ];
  }

  departmentPercent(members: number): number {
    const max = Math.max(...this.departments.map(item => Number(item.members || 0)), 1);
    return Math.round((Number(members || 0) / max) * 100);
  }

  trackByTitle(_: number, item: { title?: string; label?: string }) {
    return item.title || item.label;
  }
}
