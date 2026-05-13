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
  styleUrls: ['./trainer-dashboard.css']
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
    assignmentsSubmitted: 0
  };
  upcomingSessions: any[] = [];
  studentActivities: any[] = [];
  batches: any[] = [];
  students: any[] = [];
  mockRequests: any[] = [];
  workItems: any[] = [];
  submissions: any[] = [];
  showCurriculumPopup = false;
  showWorkPopup = false;
  selectedBatchId = '';
  selectedFile?: File;
  mode: 'file' | 'paste' = 'file';
  jsonText = '';
  workForm = {
    batchId: '',
    type: 'ASSIGNMENT',
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    totalMarks: 100
  };
  reviewDraft: Record<number, { marks: number; feedback: string }> = {};
  constructor(
    private trainerService: TrainerDashboardService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.loadDashboard();
    this.loadWorkspace();
  }
  loadDashboard() {
    this.loading = true;
    this.trainerService.getDashboardData().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.stats = { ...this.stats, ...(data.stats || {}) };
        this.batches = data.sections?.batches || [];
        this.upcomingSessions = data.sections?.upcomingSessions || [];
        this.studentActivities = data.sections?.studentActivities || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showToast('Trainer dashboard failed to load');
      }
    });
  }
  loadWorkspace() {
    this.trainerService.getStudents().subscribe((res: any) => this.students = res?.data || []);
    this.trainerService.getMockInterviewRequests().subscribe((res: any) => this.mockRequests = res?.data || []);
    this.trainerService.getWorkItems().subscribe((res: any) => this.workItems = res?.data || []);
    this.trainerService.getSubmissions().subscribe((res: any) => {
      this.submissions = res?.data || [];
      this.submissions.forEach(item => {
        this.reviewDraft[item.id] = {
          marks: item.marks || 0,
          feedback: item.feedback || ''
        };
      });
    });
  }
  get pendingMockRequests() {
    return this.mockRequests.filter(item => item.status === 'REQUESTED');
  }
  get pendingSubmissions() {
    return this.submissions.filter(item => item.status === 'SUBMITTED');
  }
  openCurriculumPopup() {
    this.showCurriculumPopup = true;
  }
  closeCurriculumPopup() {
    this.showCurriculumPopup = false;
    this.selectedFile = undefined;
    this.jsonText = '';
  }
  openWorkPopup(type: 'ASSIGNMENT' | 'ASSESSMENT') {
    this.workForm = {
      batchId: this.batches[0]?.id || '',
      type,
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      totalMarks: 100
    };
    this.showWorkPopup = true;
  }
  closeWorkPopup() {
    this.showWorkPopup = false;
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
        error: () => this.showToast('Upload failed')
      });
      return;
    }
    try {
      const parsed = JSON.parse(this.jsonText);
      this.trainerService.uploadJsonCurriculum({
        batchId: this.selectedBatchId,
        json: JSON.stringify(parsed)
      }).subscribe({
        next: () => {
          this.showToast('Curriculum saved successfully');
          this.closeCurriculumPopup();
        },
        error: () => this.showToast('Backend rejected this JSON')
      });
    } catch {
      this.showToast('Invalid JSON format');
    }
  }
  createWorkItem() {
    if (!this.workForm.batchId || !this.workForm.title || !this.workForm.dueDate || !this.workForm.dueTime) {
      this.showToast('Fill batch, title, date, and time');
      return;
    }
    this.saving = true;
    this.trainerService.createWorkItem({
      batchId: this.workForm.batchId,
      type: this.workForm.type,
      title: this.workForm.title,
      description: this.workForm.description,
      dueAt: `${this.workForm.dueDate}T${this.workForm.dueTime}:00`,
      totalMarks: this.workForm.totalMarks
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showToast(`${this.workForm.type === 'ASSIGNMENT' ? 'Assignment' : 'Assessment'} created`);
        this.closeWorkPopup();
        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => {
        this.saving = false;
        this.showToast('Unable to create work item');
      }
    });
  }
  updateMock(item: any, status: string) {
    this.trainerService.updateMockInterview(item.id, {
      status,
      meetingLink: item.meetingLink || '',
      trainerRemarks: item.trainerRemarks || ''
    }).subscribe({
      next: () => {
        this.showToast('Mock interview updated');
        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => this.showToast('Unable to update request')
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
      error: () => this.showToast('Unable to save result')
    });
  }
  showToast(message: string) {
    this.toast = message;
    setTimeout(() => this.toast = '', 2600);
  }
}
