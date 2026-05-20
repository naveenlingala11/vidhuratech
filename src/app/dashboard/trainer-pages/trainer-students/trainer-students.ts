import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-students.html',
  styleUrls: ['./trainer-students.css'],
})
export class TrainerStudentsComponent implements OnInit {
  students: any[] = [];
  mockRequests: any[] = [];
  submissions: any[] = [];
  activeTab: 'students' | 'mocks' | 'results' = 'students';
  search = '';
  toast = '';

  reviewDraft: Record<number, { marks: number; feedback: string }> = {};

  constructor(
    private service: TrainerDashboardService,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.setSeo();
    this.load();
  }

  setSeo(): void {
    this.title.setTitle('Trainer Students | Vidhura Tech');

    this.meta.updateTag({
      name: 'description',
      content:
        'Trainer students dashboard to manage registered students, mock interview requests, submissions, and assessment results.',
    });

    this.meta.updateTag({
      name: 'keywords',
      content:
        'trainer students, student management, mock interviews, assessment results, Vidhura Tech trainer dashboard',
    });
  }

  load(): void {
    this.service.getStudents().subscribe({
      next: (res: any) => (this.students = res?.data || []),
      error: () => (this.students = []),
    });

    this.service.getMockInterviewRequests().subscribe({
      next: (res: any) => (this.mockRequests = res?.data || []),
      error: () => (this.mockRequests = []),
    });

    this.service.getSubmissions().subscribe({
      next: (res: any) => {
        this.submissions = res?.data || [];
        this.submissions.forEach((item) => {
          this.reviewDraft[item.id] = {
            marks: item.marks || 0,
            feedback: item.feedback || '',
          };
        });
      },
      error: () => (this.submissions = []),
    });
  }

  get filteredStudents() {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.students;

    return this.students.filter((s) =>
      [s.name, s.email, s.phone, s.batch, s.course, s.status].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  get requestedMocks() {
    return this.mockRequests.filter((item) => item.status === 'REQUESTED');
  }

  get scheduledMocks() {
    return this.mockRequests.filter((item) => item.status === 'SCHEDULED');
  }

  get completedMocks() {
    return this.mockRequests.filter((item) => item.status === 'COMPLETED');
  }

  updateMock(item: any, status: string): void {
    if (status === 'SCHEDULED' && !String(item.meetingLink || '').trim()) {
      this.showToast('Meeting link required to schedule');
      return;
    }

    this.service
      .updateMockInterview(item.id, {
        status,
        meetingLink: item.meetingLink || '',
        trainerRemarks: item.trainerRemarks || '',
      })
      .subscribe({
        next: () => {
          this.showToast('Mock interview updated');
          this.load();
        },
        error: () => this.showToast('Update failed'),
      });
  }

  review(submission: any): void {
    this.service.reviewSubmission(submission.id, this.reviewDraft[submission.id]).subscribe({
      next: () => {
        this.showToast('Result saved');
        this.load();
      },
      error: () => this.showToast('Result save failed'),
    });
  }

  getInitials(name: string): string {
    return String(name || 'ST')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }
}
