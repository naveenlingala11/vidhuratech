import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-trainer-assessments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trainer-assessments.html',
  styleUrls: ['./trainer-assessments.css']
})
export class TrainerAssessmentsComponent implements OnInit {
  assessments: any[] = [];
  loading = true;
  toast = '';

  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.loading = true;

    this.assessmentService.getTrainerAssessments().subscribe({
      next: (res: any) => {
        this.assessments = res?.data || res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load assessments');
      }
    });
  }

  viewResults(id: number): void {
    this.router.navigate(['/dashboard/trainer/assessments', id, 'results']);
  }

  deleteAssessment(id: number): void {
    if (!confirm('Delete this assessment?')) return;

    this.assessmentService.deleteAssessment(id).subscribe({
      next: () => {
        this.assessments = this.assessments.filter(a => a.id !== id);
        this.showToast('Assessment deleted');
      },
      error: () => this.showToast('Unable to delete assessment')
    });
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 2500);
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '-';
  }
}