import {
  Component,
  OnInit
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  ActivatedRoute
} from '@angular/router';
import {
  AssessmentService
} from '../../services/assessment.service';
import {
  IAssessmentResult,
  OptionKey
} from '../../assessments/models/assessment.model';
@Component({
  selector: 'app-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-results.html',
  styleUrls: ['./assessment-results.css']
})
export class AssessmentResults
implements OnInit {
  readonly optionKeys: OptionKey[] = [
    'A',
    'B',
    'C',
    'D'
  ];
  assessmentId!: number;
  attempts: any[] = [];
  loading = true;
  selectedAttempt: any = null;
  selectedAttemptDetails:
    IAssessmentResult | null = null;
  showDetailedView = false;
  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.assessmentId = Number(
      this.route.snapshot.paramMap.get('id')
    );
    this.loadResults();
  }
  loadResults(): void {
    this.loading = true;
    this.assessmentService
      .getAssessmentResults(this.assessmentId)
      .subscribe({
        next: (res: any) => {
          this.attempts = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
  viewAttemptDetails(
    attempt: any
  ): void {
    this.selectedAttempt = attempt;
    this.loading = true;
    this.assessmentService
      .getAssessmentResultsDetailed(
        this.assessmentId,
        attempt.id
      )
      .subscribe({
        next: (res: any) => {
          this.selectedAttemptDetails =
            res.data;
          this.showDetailedView = true;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
  closeDetailedView(): void {
    this.showDetailedView = false;
    this.selectedAttempt = null;
    this.selectedAttemptDetails = null;
  }
  getAverageScore(): number {
    if (!this.attempts.length) {
      return 0;
    }
    const total =
      this.attempts.reduce(
        (sum, a) =>
          sum +
          (a.percentageScore || 0),
        0
      );
    return Math.round(
      total / this.attempts.length
    );
  }
  getPassRate(): number {
    if (!this.attempts.length) {
      return 0;
    }
    const passed =
      this.attempts.filter(
        a =>
          (a.percentageScore || 0) >= 40
      ).length;
    return Math.round(
      (
        passed /
        this.attempts.length
      ) * 100
    );
  }
  getStatusClass(
    attempt: any
  ): string {
    return (
      attempt.percentageScore >= 40
    )
      ? 'pass'
      : 'fail';
  }
  getOptionValue(
    options: any,
    key: OptionKey
  ): string {
    return options?.[key] || '';
  }
  formatDate(date: any): string {
    if (!date) {
      return '-';
    }
    return new Date(date)
      .toLocaleString();
  }
}