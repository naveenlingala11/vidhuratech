import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { IAssessmentResult, OptionKey } from '../../assessments/models/assessment.model';

@Component({
  selector: 'app-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-results.html',
  styleUrls: ['./assessment-results.css'],
})
export class AssessmentResults implements OnInit {
  readonly optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  assessmentId!: number;
  attempts: any[] = [];
  loading = true;
  toast = '';

  selectedAttempt: any = null;
  selectedAttemptDetails: IAssessmentResult | any = null;
  showDetailedView = false;

  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.assessmentId) {
      this.loading = false;
      this.showToast('Invalid assessment ID');
      return;
    }

    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;

    this.assessmentService.getAssessmentResults(this.assessmentId).subscribe({
      next: (res: any) => {
        this.attempts = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: () => {
        this.attempts = [];
        this.loading = false;
        this.showToast('Unable to load results');
      },
    });
  }

  viewAttemptDetails(attempt: any): void {
    if (!attempt?.id) {
      this.showToast('Invalid attempt');
      return;
    }

    this.selectedAttempt = attempt;
    this.loading = true;

    this.assessmentService.getAssessmentResultsDetailed(this.assessmentId, attempt.id).subscribe({
      next: (res: any) => {
        this.selectedAttemptDetails = res?.data || res || null;
        this.showDetailedView = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load attempt details');
      },
    });
  }

  closeDetailedView(): void {
    this.showDetailedView = false;
    this.selectedAttempt = null;
    this.selectedAttemptDetails = null;
  }

  getAverageScore(): number {
    if (!this.attempts.length) return 0;

    const total = this.attempts.reduce((sum, a) => sum + Number(a.percentageScore || 0), 0);
    return Math.round(total / this.attempts.length);
  }

  getPassRate(): number {
    if (!this.attempts.length) return 0;

    const passed = this.attempts.filter((a) => Number(a.percentageScore || 0) >= 40).length;
    return Math.round((passed / this.attempts.length) * 100);
  }

  getHighestScore(): number {
    if (!this.attempts.length) return 0;

    return Math.max(...this.attempts.map((a) => Number(a.percentageScore || 0)));
  }

  getStatusClass(attempt: any): string {
    return Number(attempt?.percentageScore || 0) >= 40 ? 'pass' : 'fail';
  }

  getOptionValue(options: any, key: OptionKey): string {
    return options?.[key] || '';
  }

  formatDate(date: any): string {
    return date ? new Date(date).toLocaleString() : '-';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }
}
