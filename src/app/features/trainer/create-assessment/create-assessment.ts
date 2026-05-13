import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
@Component({
  selector: 'app-create-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-assessment.html',
  styleUrls: ['./create-assessment.css']
})
export class CreateAssessmentComponent {
  loading = false;
  assessment: any = {
    batchId: '',
    title: '',
    description: '',
    totalMarks: 100,
    durationMinutes: 60,
    questions: []
  };
  constructor(
    private assessmentService: AssessmentService
  ) {}
  addQuestion() {
    this.assessment.questions.push({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      marks: 10
    });
  }
  removeQuestion(index: number) {
    this.assessment.questions.splice(index, 1);
  }
  submitAssessment() {
    this.loading = true;
    this.assessmentService
      .createAssessment(this.assessment)
      .subscribe({
        next: (res) => {
          console.log(res);
          alert('Assessment Created Successfully');
          this.loading = false;
          this.assessment = {
            batchId: '',
            title: '',
            description: '',
            totalMarks: 100,
            durationMinutes: 60,
            questions: []
          };
        },
        error: (err) => {
          console.error(err);
          alert('Assessment Creation Failed');
          this.loading = false;
        }
      });
  }
}