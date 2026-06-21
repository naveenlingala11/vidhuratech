import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorDashboardService } from '../../service/mentor-dashboard';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-sessions.html',
  styleUrls: ['./mentor-sessions.css']
})
export class MentorSessionsComponent implements OnInit {
  loading = true;
  sessions: any[] = [];
  filteredSessions: any[] = [];
  searchText = '';
  filterType = '';
  stats = { total: 0, upcoming: 0, completed: 0 };

  // Schedule modal
  showScheduleModal = false;
  mentees: any[] = [];
  scheduleForm = {
    mentee: '',
    date: '',
    time: '',
    type: 'Mock Interview',
    link: ''
  };

  constructor(
    private dashboardService: MentorDashboardService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data;
          this.mentees = d.menteeProgressList || [];
          this.sessions = (d.upcomingMeetingsList || []).map((s: any, i: number) => ({
            ...s,
            id: i + 1,
            status: 'Upcoming',
            statusClass: 'upcoming'
          }));
          this.stats.total = this.sessions.length;
          this.stats.upcoming = d.upcomingSessionsCount || this.sessions.length;
          this.stats.completed = d.completedSessionsCount || 0;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load sessions data');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.sessions];
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(s =>
        s.mentee?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q)
      );
    }
    if (this.filterType) {
      result = result.filter(s => s.type === this.filterType);
    }
    this.filteredSessions = result;
  }

  onSearch(): void {
    this.applyFilters();
  }

  getUniqueTypes(): string[] {
    return [...new Set(this.sessions.map(s => s.type))];
  }

  openScheduleModal(): void {
    this.scheduleForm = {
      mentee: this.mentees.length > 0 ? this.mentees[0].name : '',
      date: '',
      time: '',
      type: 'Mock Interview',
      link: 'https://zoom.us/j/' + Math.floor(100000000 + Math.random() * 900000000)
    };
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  submitSchedule(): void {
    if (!this.scheduleForm.mentee || !this.scheduleForm.date || !this.scheduleForm.time) {
      this.toastr.warning('Please fill in all fields');
      return;
    }

    const body = {
      studentName: this.scheduleForm.mentee,
      date: this.scheduleForm.date,
      time: this.scheduleForm.time,
      type: this.scheduleForm.type,
      link: this.scheduleForm.link
    };

    this.dashboardService.scheduleSession(body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Session scheduled for ${this.scheduleForm.mentee}!`);
          this.closeScheduleModal();
          this.loadData();
        }
      },
      error: () => {
        this.toastr.error('Failed to schedule session');
      }
    });
  }
}
