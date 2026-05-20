import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../service/trainer-dashboard';
@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-dashboard.html',
  styleUrls: ['./trainer-dashboard.css'],
})
export class TrainerDashboard implements OnInit {
  loading = true;
  saving = false;
  toast = '';
  stats = {
    assignedBatches: 0,
    totalStudents: 0,
    pendingReviews: 0,
    todaysSessions: 0,
    avgAttendance: 0,
    assignmentsSubmitted: 0,
    requestedMocks: 0,
    scheduledMocks: 0,
    completedMocks: 0,
    contentUploaded: 0,
  };
  upcomingSessions: any[] = [];
  studentActivities: any[] = [];
  batches: any[] = [];
  students: any[] = [];
  mockRequests: any[] = [];
  workItems: any[] = [];
  submissions: any[] = [];
  showCurriculumPopup = false;
  selectedBatchId = '';
  selectedFile?: File;
  mode: 'file' | 'paste' = 'file';
  jsonText = '';
  reviewDraft: Record<
    number,
    {
      marks: number;
      feedback: string;
    }
  > = {};
  contentItems: any[] = [];
  contentMode: 'file' | 'json' = 'file';
  contentJsonText = '';

  contentForm = {
    batchId: '',
    type: 'PRACTICE',
    title: '',
    description: '',
  };

  selectedContentFile?: File;
  constructor(
    private trainerService: TrainerDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.loadDashboard();
    this.loadWorkspace();
  }
  loadDashboard() {
    this.loading = true;
    this.trainerService.getDashboardData().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.stats = {
          ...this.stats,
          ...(data.stats || {}),
        };
        this.batches = data.sections?.batches || [];
        this.upcomingSessions = data.sections?.upcomingSessions || [];
        this.studentActivities = data.sections?.studentActivities || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showToast('Trainer dashboard failed to load');
      },
    });
  }
  loadWorkspace() {
    this.trainerService.getStudents().subscribe({
      next: (res: any) => (this.students = res?.data || []),
      error: () => (this.students = []),
    });

    this.trainerService.getMockInterviewRequests().subscribe({
      next: (res: any) => (this.mockRequests = res?.data || []),
      error: () => (this.mockRequests = []),
    });

    this.trainerService.getWorkItems().subscribe({
      next: (res: any) => (this.workItems = res?.data || []),
      error: () => (this.workItems = []),
    });

    this.trainerService.getSubmissions().subscribe({
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

    this.trainerService.getContent().subscribe({
      next: (res: any) => (this.contentItems = res?.data || []),
      error: () => (this.contentItems = []),
    });
  }
  get pendingMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'REQUESTED');
  }
  get pendingSubmissions() {
    return this.submissions.filter((item) => item.status === 'SUBMITTED');
  }
  get scheduledMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'SCHEDULED');
  }
  get completedMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'COMPLETED');
  }
  openCurriculumPopup() {
    this.showCurriculumPopup = true;
  }
  closeCurriculumPopup() {
    this.showCurriculumPopup = false;
    this.selectedFile = undefined;
    this.jsonText = '';
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0];
  }
  submitCurriculum() {
    if (!this.selectedBatchId) {
      this.showToast('Select batch first');
      return;
    }
    if (this.mode === 'file') {
      if (!this.selectedFile) {
        this.showToast('Select curriculum file');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('batchId', this.selectedBatchId);
      this.trainerService.uploadCurriculum(formData).subscribe({
        next: () => {
          this.showToast('Curriculum uploaded successfully');
          this.closeCurriculumPopup();
        },
        error: () => this.showToast('Upload failed'),
      });
      return;
    }
    try {
      const parsed = JSON.parse(this.jsonText);
      this.trainerService
        .uploadJsonCurriculum({
          batchId: this.selectedBatchId,
          json: JSON.stringify(parsed),
        })
        .subscribe({
          next: () => {
            this.showToast('Curriculum saved successfully');
            this.closeCurriculumPopup();
          },
          error: () => this.showToast('Backend rejected this JSON'),
        });
    } catch {
      this.showToast('Invalid JSON format');
    }
  }
  updateMock(item: any, status: string) {
    if (status === 'SCHEDULED' && !String(item.meetingLink || '').trim()) {
      this.showToast('Meeting link required to schedule');
      return;
    }

    this.trainerService
      .updateMockInterview(item.id, {
        status,
        meetingLink: item.meetingLink || '',
        trainerRemarks: item.trainerRemarks || '',
      })
      .subscribe({
        next: () => {
          this.showToast('Mock interview updated');
          this.loadWorkspace();
          this.loadDashboard();
        },
        error: () => this.showToast('Unable to update request'),
      });
  }
  review(submission: any) {
    const draft = this.reviewDraft[submission.id];
    this.trainerService.reviewSubmission(submission.id, draft).subscribe({
      next: () => {
        this.showToast('Result saved');
        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => this.showToast('Unable to save result'),
    });
  }
  showToast(message: string) {
    this.toast = message;
    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }
  setContentMode(mode: 'file' | 'json'): void {
    this.contentMode = mode;

    if (mode === 'file') {
      this.contentJsonText = '';
    }

    if (mode === 'json') {
      this.selectedContentFile = undefined;
    }
  }

  onContentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedContentFile = input.files?.[0];
  }

  uploadContent(): void {
    if (!this.contentForm.batchId || !this.contentForm.type || !this.contentForm.title.trim()) {
      this.showToast('Select batch, type, and title');
      return;
    }

    const formData = new FormData();
    formData.append('batchId', this.contentForm.batchId);
    formData.append('type', this.contentForm.type);
    formData.append('title', this.contentForm.title.trim());
    formData.append('description', this.contentForm.description || '');

    if (this.contentMode === 'file') {
      if (this.selectedContentFile) {
        formData.append('file', this.selectedContentFile);
      }
    }

    if (this.contentMode === 'json') {
      if (!this.contentJsonText.trim()) {
        this.showToast('Paste JSON content');
        return;
      }

      try {
        const parsed = JSON.parse(this.contentJsonText);
        formData.append('jsonData', JSON.stringify(parsed));
      } catch {
        this.showToast('Invalid JSON format');
        return;
      }
    }

    this.trainerService.uploadContent(formData).subscribe({
      next: () => {
        this.showToast('Content uploaded successfully');

        this.contentForm = {
          batchId: '',
          type: 'PRACTICE',
          title: '',
          description: '',
        };

        this.contentMode = 'file';
        this.contentJsonText = '';
        this.selectedContentFile = undefined;

        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => this.showToast('Unable to upload content'),
    });
  }
}
