import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentMentorService } from '../service/student-mentor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student-mentor-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-mentor-sessions.html',
  styleUrls: ['./student-mentor-sessions.css']
})
export class StudentMentorSessionsComponent implements OnInit {
  loading = true;
  sessions: any[] = [];
  filteredSessions: any[] = [];
  searchText = '';
  filterStatus = '';
  stats = { total: 0, upcoming: 0, completed: 0 };

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
          this.sessions = d.sessions || [];
          this.stats.total = this.sessions.length;
          this.stats.upcoming = d.upcomingSessions || 0;
          this.stats.completed = d.completedSessions || 0;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load session data');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.sessions];
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter((s: any) =>
        s.mentorName?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q)
      );
    }
    if (this.filterStatus) {
      result = result.filter((s: any) => s.status === this.filterStatus);
    }
    this.filteredSessions = result;
  }

  onSearch(): void {
    this.applyFilters();
  }
}
