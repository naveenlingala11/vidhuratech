import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-student.html',
  styleUrls: ['./trainer-student.css']
})
export class TrainerStudentsComponent implements OnInit {
  students: any[] = [];
  mockRequests: any[] = [];
  submissions: any[] = [];
  activeTab: 'students' | 'mocks' | 'results' = 'students';
  search = '';
  toast = '';
  reviewDraft: Record<number, { marks: number; feedback: string }> = {};

  constructor(private service: TrainerDashboardService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getStudents().subscribe((res: any) => this.students = res?.data || []);
    this.service.getMockInterviewRequests().subscribe((res: any) => this.mockRequests = res?.data || []);

    this.service.getSubmissions().subscribe((res: any) => {
      this.submissions = res?.data || [];
      this.submissions.forEach(item => {
        this.reviewDraft[item.id] = {
          marks: item.marks || 0,
          feedback: item.feedback || ''
        };
      });
    });
  }

  get filteredStudents() {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.students;

    return this.students.filter(s =>
      [s.name, s.email, s.phone, s.batch, s.course].some(value =>
        String(value || '').toLowerCase().includes(q)
      )
    );
  }

  updateMock(item: any, status: string) {
    this.service.updateMockInterview(item.id, {
      status,
      meetingLink: item.meetingLink || '',
      trainerRemarks: item.trainerRemarks || ''
    }).subscribe({
      next: () => {
        this.showToast('Mock interview updated');
        this.load();
      },
      error: () => this.showToast('Update failed')
    });
  }

  review(submission: any) {
    this.service.reviewSubmission(submission.id, this.reviewDraft[submission.id]).subscribe({
      next: () => {
        this.showToast('Result saved');
        this.load();
      },
      error: () => this.showToast('Result save failed')
    });
  }

  showToast(message: string) {
    this.toast = message;
    setTimeout(() => this.toast = '', 2500);
  }
}