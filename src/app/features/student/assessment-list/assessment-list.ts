import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-list.html',
  styleUrls: ['./assessment-list.css']
})
export class AssessmentListComponent implements OnInit {
  assessments: any[] = [];
  loading = false;
  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.loadAssessments();
  }
  get passedCount(): number {
    return this.assessments.filter(a => a.status === 'PASS').length;
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
      }
    });
  }
  startAssessment(id: number): void {
    this.router.navigate(['/dashboard/student/assessment-attempt', id]);
  }
  getStatusClass(status: string): string {
    return status === 'PASS' ? 'pass' : 'fail';
  }
  formatDate(date: string): string {
    if (!date) return 'No attempts yet';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}