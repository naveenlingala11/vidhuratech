import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';

type FilterMode = 'ALL' | 'WITH_ATTEMPTS' | 'NO_ATTEMPTS';
type SortMode = 'LATEST' | 'TITLE' | 'ATTEMPTS_HIGH' | 'QUESTIONS_HIGH' | 'MARKS_HIGH';
type ViewMode = 'GRID' | 'TABLE';

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
  sortMode: SortMode = 'LATEST';
  sortOptions: SortMode[] = ['LATEST', 'TITLE', 'ATTEMPTS_HIGH', 'QUESTIONS_HIGH', 'MARKS_HIGH'];
  viewMode: ViewMode = 'GRID';
  page = 1;
  pageSize = 6;
  selectedAssessment: any = null;
  previewLoading = false;

  expandedDescriptions = new Set<number>();
  selectedIds = new Set<number>();

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
        this.selectedIds.clear();
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

    return [...this.assessments]
      .filter((a) => {
        const attemptCount = Number(a.attemptCount || 0);

        const matchesFilter =
          this.filterMode === 'ALL' ||
          (this.filterMode === 'WITH_ATTEMPTS' && attemptCount > 0) ||
          (this.filterMode === 'NO_ATTEMPTS' && attemptCount === 0);

        const searchable = [
          a.title,
          a.description,
          a.batchId,
          a.batchName,
          a.courseName,
          a.companyName,
          a.skill,
        ]
          .join(' ')
          .toLowerCase();

        return matchesFilter && (!term || searchable.includes(term));
      })
      .sort((a, b) => {
        if (this.sortMode === 'TITLE') {
          return String(a.title || '').localeCompare(String(b.title || ''));
        }

        if (this.sortMode === 'ATTEMPTS_HIGH') {
          return Number(b.attemptCount || 0) - Number(a.attemptCount || 0);
        }

        if (this.sortMode === 'QUESTIONS_HIGH') {
          return this.questionCount(b) - this.questionCount(a);
        }

        if (this.sortMode === 'MARKS_HIGH') {
          return Number(b.totalMarks || 0) - Number(a.totalMarks || 0);
        }

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }

  get totalAssessments(): number {
    return this.assessments.length;
  }

  get totalAttempts(): number {
    return this.assessments.reduce((sum, a) => sum + Number(a.attemptCount || 0), 0);
  }

  get totalQuestions(): number {
    return this.assessments.reduce((sum, a) => sum + this.questionCount(a), 0);
  }

  get noAttemptCount(): number {
    return this.assessments.filter((a) => Number(a.attemptCount || 0) === 0).length;
  }

  get totalMarks(): number {
    return this.assessments.reduce((sum, a) => sum + Number(a.totalMarks || 0), 0);
  }

  get averageAttempts(): number {
    if (!this.assessments.length) return 0;
    return Math.round(this.totalAttempts / this.assessments.length);
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  get pagedAssessments(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAssessments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssessments.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get startRecord(): number {
    if (!this.filteredAssessments.length) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.page * this.pageSize, this.filteredAssessments.length);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size || 6);
    this.page = 1;
  }

  resetPage(): void {
    this.page = 1;
  }

  setFilter(mode: FilterMode): void {
    this.filterMode = mode;
    this.page = 1;
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  selectVisible(): void {
    this.pagedAssessments.forEach((a) => this.selectedIds.add(a.id));
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  questionCount(a: any): number {
    return Number(a.questionCount || a.questions?.length || 0);
  }

  hasAttempts(a: any): boolean {
    return Number(a.attemptCount || 0) > 0;
  }

  shouldShowDescriptionToggle(description: string): boolean {
    return String(description || '').length > 130;
  }

  isDescriptionExpanded(id: number): boolean {
    return this.expandedDescriptions.has(id);
  }

  toggleDescription(id: number): void {
    if (this.expandedDescriptions.has(id)) {
      this.expandedDescriptions.delete(id);
      return;
    }

    this.expandedDescriptions.add(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelected(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      return;
    }

    this.selectedIds.add(id);
  }

  setSort(mode: SortMode): void {
    this.sortMode = mode;
    this.page = 1;
  }

  editAssessment(id: number): void {
    if (!id) {
      this.showToast('Invalid assessment');
      return;
    }

    this.router.navigate(['/dashboard/trainer/create-assessment'], {
      queryParams: { editId: id },
    });
  }

  sortIcon(mode: SortMode): string {
    if (mode === 'LATEST') return 'bi bi-clock-history';
    if (mode === 'TITLE') return 'bi bi-sort-alpha-down';
    if (mode === 'ATTEMPTS_HIGH') return 'bi bi-graph-up-arrow';
    if (mode === 'QUESTIONS_HIGH') return 'bi bi-question-circle';
    return 'bi bi-award';
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  viewResults(id: number): void {
    if (!id || isNaN(id)) {
      this.showToast('Invalid assessment');
      return;
    }

    this.router.navigate(['/dashboard/trainer/assessments', Number(id), 'results']);
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
        this.selectedIds.delete(id);
        this.showToast('Assessment deleted');
      },
      error: () => this.showToast('Unable to delete assessment'),
    });
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

  downloadSelected(): void {
    const items = this.assessments.filter((a) => this.selectedIds.has(a.id));

    if (!items.length) {
      this.showToast('Select assessments to export');
      return;
    }

    const payload = items.map((a) => ({
      id: a.id,
      batchId: a.batchId,
      batchName: a.batchName,
      title: a.title,
      description: a.description,
      totalMarks: a.totalMarks,
      durationMinutes: a.durationMinutes,
      questionCount: this.questionCount(a),
      attemptCount: a.attemptCount || 0,
      createdAt: a.createdAt,
    }));

    this.downloadJson(payload, 'selected-assessments.json');
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

        this.downloadJson(payload, fileName);
      },
      error: () => this.showToast('Unable to download assessment'),
    });
  }

  private downloadJson(payload: any, fileName: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  getOptionValue(options: any, key: string): string {
    return options?.[key] || '';
  }

  formatDate(date: string): string {
    return date
      ? new Date(date).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }
}
