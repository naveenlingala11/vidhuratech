import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

type MockFilter = 'ALL' | 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'REJECTED';

@Component({
  selector: 'app-trainer-mock-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-mock-interviews.html',
  styleUrls: ['./trainer-mock-interviews.css'],
})
export class TrainerMockInterviewsComponent implements OnInit {
  loading = true;
  savingId: number | null = null;
  toast = '';

  searchText = '';
  selectedFilter: MockFilter = 'ALL';
  mockRequests: any[] = [];

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadMockInterviews();
  }

  loadMockInterviews(): void {
    this.loading = true;

    this.service.getMockInterviewRequests().subscribe({
      next: (res: any) => {
        this.mockRequests = (res?.data || []).map((item: any) => ({
          ...item,
          meetingLink: item.meetingLink || '',
          trainerRemarks: item.trainerRemarks || '',
        }));
        this.loading = false;
      },
      error: () => {
        this.mockRequests = [];
        this.loading = false;
        this.showToast('Unable to load mock interviews');
      },
    });
  }

  get filteredRequests(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.mockRequests.filter((item) => {
      const matchesStatus = this.selectedFilter === 'ALL' || item.status === this.selectedFilter;

      const searchable = [
        item.student,
        item.topic,
        item.batch,
        item.status,
        item.preferredDate,
        item.preferredTime,
        item.meetingLink,
        item.trainerRemarks,
      ]
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }

  get requestedCount(): number {
    return this.mockRequests.filter((item) => item.status === 'REQUESTED').length;
  }

  get scheduledCount(): number {
    return this.mockRequests.filter((item) => item.status === 'SCHEDULED').length;
  }

  get completedCount(): number {
    return this.mockRequests.filter((item) => item.status === 'COMPLETED').length;
  }

  get rejectedCount(): number {
    return this.mockRequests.filter((item) => item.status === 'REJECTED').length;
  }

  updateMock(item: any, status: MockFilter): void {
    if (status === 'ALL') return;

    if (status === 'SCHEDULED' && !String(item.meetingLink || '').trim()) {
      this.showToast('Meeting link required to schedule');
      return;
    }

    if (
      (status === 'COMPLETED' || status === 'REJECTED') &&
      !String(item.trainerRemarks || '').trim()
    ) {
      this.showToast('Trainer comments required');
      return;
    }

    this.savingId = item.id;

    this.service
      .updateMockInterview(item.id, {
        status,
        meetingLink: item.meetingLink || '',
        trainerRemarks: item.trainerRemarks || '',
      })
      .subscribe({
        next: () => {
          this.savingId = null;
          this.showToast('Mock interview updated');
          this.loadMockInterviews();
        },
        error: () => {
          this.savingId = null;
          this.showToast('Unable to update mock interview');
        },
      });
  }

  statusLabel(status: string): string {
    return status ? status.replaceAll('_', ' ') : 'UNKNOWN';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  trackById(_: number, item: any): any {
    return item.id;
  }
}
