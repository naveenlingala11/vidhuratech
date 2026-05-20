import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';

type FilterMode = 'ALL' | 'WITH_ATTEMPTS' | 'NO_ATTEMPTS';

@Component({
  selector: 'app-trainer-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-assessments.html',
  styleUrls: ['./trainer-assessments.css'],
})
export class TrainerAssessmentsComponent implements OnInit {
  assessments: any[] = [];
  loading = true;
  toast = '';
  search = '';
  filterMode: FilterMode = 'ALL';
  selectedAssessment: any = null;
  previewLoading = false;

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.loading = true;

    this.assessmentService.getTrainerAssessments().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.content)
            ? res.data.content
            : Array.isArray(res?.content)
              ? res.content
              : Array.isArray(res)
                ? res
                : [];

        this.assessments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Trainer assessments error:', err);
        this.assessments = [];
        this.loading = false;
        this.showToast('Unable to load assessments');
      },
    });
  }

  get filteredAssessments(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.assessments.filter((a) => {
      const attemptCount = Number(a.attemptCount || 0);

      const matchesFilter =
        this.filterMode === 'ALL' ||
        (this.filterMode === 'WITH_ATTEMPTS' && attemptCount > 0) ||
        (this.filterMode === 'NO_ATTEMPTS' && attemptCount === 0);

      const searchable = [a.title, a.description, a.batchId, a.batchName, a.courseName]
        .join(' ')
        .toLowerCase();

      return matchesFilter && (!term || searchable.includes(term));
    });
  }

  get totalAssessments(): number {
    return this.assessments.length;
  }

  get totalAttempts(): number {
    return this.assessments.reduce((sum, a) => sum + Number(a.attemptCount || 0), 0);
  }

  get totalQuestions(): number {
    return this.assessments.reduce((sum, a) => sum + Number(a.questionCount || 0), 0);
  }

  get noAttemptCount(): number {
    return this.assessments.filter((a) => Number(a.attemptCount || 0) === 0).length;
  }

  viewResults(id: number): void {
    if (!id) {
      this.showToast('Invalid assessment');
      return;
    }

    this.router.navigate(['/dashboard/trainer/assessments', id, 'results']);
  }

  deleteAssessment(id: number): void {
    if (!id) {
      this.showToast('Invalid assessment');
      return;
    }

    if (!confirm('Delete this assessment?')) return;

    this.assessmentService.deleteAssessment(id).subscribe({
      next: () => {
        this.assessments = this.assessments.filter((a) => a.id !== id);
        this.showToast('Assessment deleted');
      },
      error: () => this.showToast('Unable to delete assessment'),
    });
  }

  setFilter(mode: FilterMode): void {
    this.filterMode = mode;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '-';
  }

  previewAssessment(id: number): void {
    if (!id) {
      this.showToast('Invalid assessment');
      return;
    }

    this.previewLoading = true;

    this.assessmentService.getTrainerAssessmentDetails(id).subscribe({
      next: (res: any) => {
        this.selectedAssessment = res?.data || res;
        this.previewLoading = false;
      },
      error: () => {
        this.previewLoading = false;
        this.showToast('Unable to load assessment preview');
      },
    });
  }

  closePreview(): void {
    this.selectedAssessment = null;
  }

  downloadAssessment(assessment: any): void {
    if (!assessment?.id) {
      this.showToast('Invalid assessment');
      return;
    }

    this.assessmentService.getTrainerAssessmentDetails(assessment.id).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const fileName = `${(data.title || 'assessment')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')}.json`;

        const payload = {
          batchId: data.batchId,
          title: data.title,
          description: data.description,
          totalMarks: data.totalMarks,
          durationMinutes: data.durationMinutes,
          questions: data.questions || [],
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(url);
      },
      error: () => this.showToast('Unable to download assessment'),
    });
  }

  getOptionValue(options: any, key: string): string {
    return options?.[key] || '';
  }
}
