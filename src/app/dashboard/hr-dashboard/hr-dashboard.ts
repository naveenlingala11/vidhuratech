import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrDashboardService } from '../service/hr-dashboard';
import { RoleAction, RolePanel, RoleStatCard } from '../shared/role-dashboard.model';
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
  statCards: RoleStatCard[] = [];
  panels: RolePanel[] = [];
  actions: RoleAction[] = [
    { label: 'Add Candidate', helper: 'Create a new candidate profile', tone: 'tone-blue' },
    { label: 'Schedule Interview', helper: 'Book interviewer and slot', tone: 'tone-green' },
    { label: 'Release Offer', helper: 'Prepare offer communication', tone: 'tone-purple' },
    { label: 'Generate Hiring Report', helper: 'Review pipeline performance', tone: 'tone-teal' }
  ];
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
      { label: 'Total Candidates', value: this.stats.totalCandidates, helper: 'All active profiles', tone: 'tone-blue' },
      { label: 'Interviews Today', value: this.stats.interviewsToday, helper: 'Scheduled for today', tone: 'tone-green' },
      { label: 'Offers Released', value: this.stats.offersReleased, helper: 'Offer stage movement', tone: 'tone-orange' },
      { label: 'Pending Reviews', value: this.stats.pendingReviews, helper: 'Needs HR action', tone: 'tone-purple' },
      { label: 'Hired This Month', value: this.stats.hiredThisMonth, helper: 'Monthly hiring wins', tone: 'tone-teal' },
      { label: 'Rejected', value: this.stats.rejected, helper: 'Closed as rejected', tone: 'tone-red' }
    ];
    this.panels = [
      {
        eyebrow: 'Pipeline',
        title: 'Recruitment Pipeline',
        type: 'pipeline',
        items: this.pipeline.map(item => ({
          title: item.stage,
          value: item.count,
          progress: this.pipelinePercent(item.count)
        }))
      },
      {
        eyebrow: 'Calendar',
        title: 'Upcoming Interviews',
        type: 'list',
        items: this.interviews.map(item => ({
          title: item.candidate,
          description: item.role,
          meta: item.time
        }))
      },
      {
        eyebrow: 'Updates',
        title: 'Recent Activities',
        type: 'list',
        items: this.activities.map(item => ({
          title: item.title,
          description: item.description
        }))
      }
    ];
  }
  pipelinePercent(count: number): number {
    const max = Math.max(...this.pipeline.map(item => Number(item.count || 0)), 1);
    return Math.round((Number(count || 0) / max) * 100);
  }
  trackByTitle(_: number, item: { title?: string; label?: string }) {
    return item.title || item.label;
  }
}
