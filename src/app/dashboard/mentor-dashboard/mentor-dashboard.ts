import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorDashboardService } from '../service/mentor-dashboard';
import { RoleAction, RolePanel, RoleStatCard } from '../shared/role-dashboard.model';

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
  statCards: RoleStatCard[] = [];
  panels: RolePanel[] = [];
  actions: RoleAction[] = [
    { label: 'Schedule Session', helper: 'Plan a mentor meeting', tone: 'tone-blue' },
    { label: 'Add Feedback', helper: 'Record next improvement note', tone: 'tone-green' },
    { label: 'Review Goals', helper: 'Track mentee action items', tone: 'tone-purple' },
    { label: 'Progress Report', helper: 'Open mentee progress view', tone: 'tone-teal' }
  ];

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
      { label: 'Assigned Mentees', value: this.stats.mentees, helper: 'Active guidance list', tone: 'tone-blue' },
      { label: 'Upcoming Sessions', value: this.stats.upcomingSessions, helper: 'Planned touchpoints', tone: 'tone-green' },
      { label: 'Completed Sessions', value: this.stats.completedSessions, helper: 'Mentoring completed', tone: 'tone-orange' },
      { label: 'Pending Feedback', value: this.stats.pendingFeedback, helper: 'Needs mentor note', tone: 'tone-red' },
      { label: 'Average Progress', value: `${this.stats.avgProgress}%`, helper: 'Mentee progress health', tone: 'tone-purple' }
    ];

    this.panels = [
      {
        eyebrow: 'Progress',
        title: 'Mentee Progress',
        type: 'progress',
        items: this.menteeProgress.map(item => ({
          title: item.name,
          value: `${item.progress}%`,
          progress: Number(item.progress || 0)
        }))
      },
      {
        eyebrow: 'Calendar',
        title: 'Upcoming Meetings',
        type: 'list',
        items: this.upcomingMeetings.map(item => ({
          title: item.mentee,
          meta: item.date
        }))
      },
      {
        eyebrow: 'Action Items',
        title: 'Goals',
        type: 'list',
        items: this.goals.map(item => ({
          title: item.title,
          description: item.description
        }))
      }
    ];
  }

  trackByTitle(_: number, item: { title?: string; label?: string }) {
    return item.title || item.label;
  }
}
