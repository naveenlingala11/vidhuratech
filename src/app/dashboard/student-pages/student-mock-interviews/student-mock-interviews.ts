import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../service/student-dashboard';
import { StudentWorkflowService } from '../service/student-workflow';

type MockFilter = 'ALL' | 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'REJECTED';

interface StudentCourse {
  name?: string;
  courseName?: string;
  batchName?: string;
  batchId?: number | string;
}

@Component({
  selector: 'app-student-mock-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-mock-interviews.html',
  styleUrls: ['./student-mock-interviews.css'],
})
export class StudentMockInterviewsComponent implements OnInit {
  loading = true;
  submitting = false;
  toast = '';
  searchText = '';
  selectedFilter: MockFilter = 'ALL';

  myCourses: StudentCourse[] = [];
  mockRequests: any[] = [];

  mockForm = {
    batchId: '',
    topic: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  };

  constructor(
    private dashboardService: StudentDashboardService,
    private workflow: StudentWorkflowService,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadMockInterviews();
  }

  loadCourses(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        this.myCourses = res?.data?.sections?.myCourses || [];

        if (!this.mockForm.batchId && this.myCourses.length) {
          this.mockForm.batchId = String(this.myCourses[0]?.batchId || '');
        }
      },
      error: () => (this.myCourses = []),
    });
  }

  loadMockInterviews(): void {
    this.loading = true;

    this.workflow.getMockInterviews().subscribe({
      next: (res: any) => {
        this.mockRequests = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.mockRequests = [];
        this.loading = false;
        this.showToast('Unable to load mock interviews');
      },
    });
  }

  submitMockInterviewRequest(): void {
    if (
      !this.mockForm.batchId ||
      !this.mockForm.topic.trim() ||
      !this.mockForm.preferredDate ||
      !this.mockForm.preferredTime
    ) {
      this.showToast('Fill batch, topic, date, and time');
      return;
    }

    this.submitting = true;

    this.workflow
      .requestMockInterview({
        ...this.mockForm,
        topic: this.mockForm.topic.trim(),
        notes: this.mockForm.notes.trim(),
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showToast('Mock interview request sent');
          this.resetForm();
          this.loadMockInterviews();
        },
        error: () => {
          this.submitting = false;
          this.showToast('Unable to send request');
        },
      });
  }

  resetForm(): void {
    this.mockForm = {
      batchId: String(this.myCourses[0]?.batchId || ''),
      topic: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    };
  }

  get filteredRequests(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.mockRequests.filter((item) => {
      const matchesStatus = this.selectedFilter === 'ALL' || item.status === this.selectedFilter;

      const searchable = [
        item.topic,
        item.status,
        item.batch,
        item.preferredDate,
        item.preferredTime,
        item.notes,
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

  getCourseName(course: StudentCourse): string {
    return course.name || course.courseName || course.batchName || 'Batch';
  }

  statusLabel(status: string): string {
    return status ? status.replaceAll('_', ' ') : 'REQUESTED';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  trackById(_: number, item: any): any {
    return item.id || item.topic;
  }
}
