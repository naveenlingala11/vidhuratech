import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MentorDashboardService } from '../../service/mentor-dashboard';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-mentees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentor-mentees.html',
  styleUrls: ['./mentor-mentees.css']
})
export class MentorMenteesComponent implements OnInit {
  loading = true;
  mentees: any[] = [];
  filteredMentees: any[] = [];
  searchText = '';
  filterStatus = '';
  stats = { total: 0, active: 0, avgProgress: 0 };

  // Feedback modal
  showFeedbackModal = false;
  feedbackForm = {
    mentee: '',
    note: '',
    progressValue: 70,
    milestone: ''
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
          this.mentees = (res.data.menteeProgressList || []).map((m: any) => ({
            ...m,
            status: m.progress >= 80 ? 'Advanced' : m.progress >= 40 ? 'Intermediate' : 'Beginner',
            statusClass: m.progress >= 80 ? 'advanced' : m.progress >= 40 ? 'intermediate' : 'beginner'
          }));
          this.stats.total = this.mentees.length;
          this.stats.active = this.mentees.length;
          this.stats.avgProgress = res.data.avgProgress || 0;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load mentees data');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.mentees];
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(m => m.name?.toLowerCase().includes(q));
    }
    if (this.filterStatus) {
      result = result.filter(m => m.status === this.filterStatus);
    }
    this.filteredMentees = result;
  }

  onSearch(): void {
    this.applyFilters();
  }

  openFeedbackModal(menteeName?: string): void {
    this.feedbackForm = {
      mentee: menteeName || (this.mentees.length > 0 ? this.mentees[0].name : ''),
      note: '',
      progressValue: 75,
      milestone: ''
    };
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
  }

  submitFeedback(): void {
    if (!this.feedbackForm.mentee || !this.feedbackForm.note.trim()) {
      this.toastr.warning('Please provide feedback notes');
      return;
    }

    const body = {
      studentName: this.feedbackForm.mentee,
      progress: this.feedbackForm.progressValue,
      milestone: this.feedbackForm.milestone,
      note: this.feedbackForm.note
    };

    this.dashboardService.submitFeedback(body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Feedback saved for ${this.feedbackForm.mentee}!`);
          this.closeFeedbackModal();
          this.loadData();
        }
      },
      error: () => {
        this.toastr.error('Failed to save review');
      }
    });
  }
}
