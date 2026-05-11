import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-assessment-attempt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './assessment-attempt.html',
  styleUrls: ['./assessment-attempt.css']
})
export class AssessmentAttemptComponent
implements OnInit {

  assessmentId!: number;

  assessment: any;

  answers: any[] = [];

  submitted = false;

  result: any;

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {

    this.assessmentId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadAssessment();
  }

  loadAssessment() {

    this.assessmentService
      .getAssessmentById(this.assessmentId)
      .subscribe({
        next: (res) => {

          this.assessment = res.data;

          this.answers =
            this.assessment.questions.map((q: any) => ({
              questionId: q.id,
              selectedAnswer: ''
            }));
        },

        error: (err) => {

          console.error(err);
        }
      });
  }

  submitAssessment() {

    const payload = {
      answers: this.answers
    };

    this.assessmentService
      .submitAssessment(
        this.assessmentId,
        payload
      )
      .subscribe({
        next: (res) => {

          this.submitted = true;

          this.result = res.data;
        },

        error: (err) => {

          console.error(err);

          alert('Submission Failed');
        }
      });
  }
}