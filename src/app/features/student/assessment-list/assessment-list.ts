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
  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.loadAssessments();
  }
  loadAssessments() {
    this.assessmentService
      .getStudentAssessments()
      .subscribe({
        next: (res) => {
          this.assessments = res.data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  startAssessment(id: number) {
    this.router.navigate([
      '/student/assessment-attempt',
      id
    ]);
  }
}