import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';

type AssessmentFilter = 'ALL' | 'PASS' | 'FAIL' | 'PENDING';
type AssessmentSort = 'LATEST' | 'SCORE_HIGH' | 'SCORE_LOW' | 'TITLE';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-list.html',
  styleUrls: ['./assessment-list.css'],
})
export class AssessmentListComponent implements OnInit {
  assessments: any[] = [];
  loading = false;
  toast = '';

  search = '';
  statusFilter: AssessmentFilter = 'ALL';
  sortBy: AssessmentSort = 'LATEST';
  expandedDescriptions = new Set<number>();

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  get passedCount(): number {
    return this.assessments.filter((item) => item.status === 'PASS').length;
  }

  get failedCount(): number {
    return this.assessments.filter((item) => item.status === 'FAIL').length;
  }

  get pendingCount(): number {
    return this.assessments.filter((item) => this.isPending(item)).length;
  }

  get attemptedCount(): number {
    return this.assessments.filter((item) => Number(item.attemptCount || 0) > 0).length;
  }

  get averageScore(): number {
    if (!this.assessments.length) return 0;

    const total = this.assessments.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    return Math.round(total / this.assessments.length);
  }

  get filteredAssessments(): any[] {
    const term = this.search.trim().toLowerCase();

    return [...this.assessments]
      .filter((item) => {
        const status = this.normalizedStatus(item);
        const searchableText = [
          item.title,
          item.description,
          status,
          item.totalMarks,
          item.durationMinutes,
          item.questionCount,
        ]
          .join(' ')
          .toLowerCase();

        const matchesSearch = !term || searchableText.includes(term);
        const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (this.sortBy === 'SCORE_HIGH') {
          return Number(b.percentage || 0) - Number(a.percentage || 0);
        }

        if (this.sortBy === 'SCORE_LOW') {
          return Number(a.percentage || 0) - Number(b.percentage || 0);
        }

        if (this.sortBy === 'TITLE') {
          return String(a.title || '').localeCompare(String(b.title || ''));
        }

        return (
          new Date(b.lastSubmittedAt || 0).getTime() - new Date(a.lastSubmittedAt || 0).getTime()
        );
      });
  }

  loadAssessments(): void {
    this.loading = true;

    this.assessmentService.getStudentAssessments().subscribe({
      next: (res) => {
        this.assessments = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showToast('Unable to load assessments');
      },
    });
  }

  startAssessment(id: number): void {
    this.router.navigate(['/dashboard/student/assessment-attempt', id]);
  }

  trackById(_: number, assessment: any): number {
    return assessment.id;
  }

  isPending(assessment: any): boolean {
    return !assessment.status || Number(assessment.attemptCount || 0) === 0;
  }

  normalizedStatus(assessment: any): AssessmentFilter {
    if (this.isPending(assessment)) return 'PENDING';
    return assessment.status === 'PASS' ? 'PASS' : 'FAIL';
  }

  getStatusClass(assessment: any): string {
    return this.normalizedStatus(assessment).toLowerCase();
  }

  getStatusLabel(assessment: any): string {
    const status = this.normalizedStatus(assessment);

    if (status === 'PASS') return 'Passed';
    if (status === 'FAIL') return 'Needs Practice';
    return 'Not Attempted';
  }

  getStatusIcon(assessment: any): string {
    const status = this.normalizedStatus(assessment);

    if (status === 'PASS') return 'bi-check-circle-fill';
    if (status === 'FAIL') return 'bi-x-circle-fill';
    return 'bi-clock-history';
  }

  getActionLabel(assessment: any): string {
    return Number(assessment.attemptCount || 0) > 0 ? 'Reattempt Test' : 'Start Test';
  }

  getScoreLabel(assessment: any): string {
    return `${Number(assessment.percentage || 0)}%`;
  }

  isDescriptionExpanded(id: number): boolean {
    return this.expandedDescriptions.has(id);
  }

  shouldShowDescriptionToggle(description: string): boolean {
    return String(description || '').length > 135;
  }

  toggleDescription(id: number): void {
    if (this.expandedDescriptions.has(id)) {
      this.expandedDescriptions.delete(id);
      return;
    }

    this.expandedDescriptions.add(id);
  }

  formatDate(date: string): string {
    if (!date) return 'No attempts yet';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2500);
  }
}
