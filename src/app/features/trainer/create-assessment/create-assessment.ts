import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import {
  AssessmentUtils
} from '../../assessments/utils/assessment.utils';
import {
  IAssessment,
  IBulkAssessmentValidationResult,
  OptionKey
} from '../../assessments/models/assessment.model';
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
  readonly optionKeys: OptionKey[] = [
    'A',
    'B',
    'C',
    'D'
  ];
  mode: 'manual' | 'bulk' = 'manual';
  loading = false;
  successMessage = '';
  errorMessages: string[] = [];
  validationErrors: any[] = [];
  assessment: IAssessment = {
    batchId: 0,
    title: '',
    description: '',
    totalMarks: 100,
    durationMinutes: 60,
    questions: []
  };
  bulkJsonInput = '';
  bulkAssessment: IAssessment | null = null;
  validationResult:
    IBulkAssessmentValidationResult | null = null;
  showPreview = false;
  constructor(
    private assessmentService: AssessmentService
  ) { }
  switchMode(
    mode: 'manual' | 'bulk'
  ) {
    this.mode = mode;
  }
  addQuestion() {
    this.assessment.questions.push({
      question: '',
      options: {
        A: '',
        B: '',
        C: '',
        D: ''
      },
      correctAnswer: 'A',
      marks: 10,
      explanation: ''
    });
  }
  removeQuestion(index: number) {
    this.assessment.questions.splice(index, 1);
  }
  getOptionValue(
    options: any,
    key: OptionKey
  ): string {
    return options?.[key] || '';
  }
  submitAssessment() {
    this.loading = true;
    this.errorMessages = [];
    this.successMessage = '';
    this.assessmentService
      .createAssessment(this.assessment)
      .subscribe({
        next: () => {
          this.successMessage =
            'Assessment Created Successfully';
          this.loading = false;
          this.resetManualForm();
        },
        error: (err) => {
          console.error(err);
          this.errorMessages = [
            'Assessment Creation Failed'
          ];
          this.loading = false;
        }
      });
  }
  parseBulkJSON() {
    this.errorMessages = [];
    this.validationErrors = [];
    this.showPreview = false;
    this.validationResult =
      AssessmentUtils.validateAssessmentJSON(
        this.bulkJsonInput
      );
    if (!this.validationResult.valid) {
      this.validationErrors =
        this.validationResult.errors;
      return;
    }
    const parsed = JSON.parse(
      this.bulkJsonInput
    );
    this.bulkAssessment = {
      batchId: parsed.batchId,
      title: parsed.title,
      description:
        parsed.description || '',
      totalMarks:
        parsed.totalMarks || 100,
      durationMinutes:
        parsed.durationMinutes || 60,
      questions:
        AssessmentUtils.parseQuestions(
          parsed.questions
        )
    };
    this.showPreview = true;
  }
  submitBulkAssessment() {
    if (!this.bulkAssessment) {
      return;
    }
    this.loading = true;
    this.assessmentService
      .bulkUploadAssessments(
        this.bulkAssessment
      )
      .subscribe({
        next: () => {
          this.successMessage =
            'Bulk assessment uploaded successfully';
          this.loading = false;
          this.resetBulkForm();
        },
        error: (err) => {
          console.error(err);
          this.errorMessages = [
            'Bulk upload failed'
          ];
          this.loading = false;
        }
      });
  }
  resetManualForm() {
    this.assessment = {
      batchId: 0,
      title: '',
      description: '',
      totalMarks: 100,
      durationMinutes: 60,
      questions: []
    };
  }
  resetBulkForm() {
    this.bulkJsonInput = '';
    this.bulkAssessment = null;
    this.showPreview = false;
  }
  copyJsonTemplate(): void {
    const template = `{
  "batchId": 1,
  "title": "Angular Assessment",
  "description": "Angular Basics Test",
  "totalMarks": 20,
  "durationMinutes": 30,
  "questions": [
    {
      "question": "What is Angular?",
      "options": {
        "A": "Framework",
        "B": "Database",
        "C": "Browser",
        "D": "OS"
      },
      "correctAnswer": "A",
      "marks": 10,
      "explanation": "Angular is a frontend framework"
    }
  ]
}`;
    navigator.clipboard.writeText(
      template
    );
    alert(
      'JSON template copied'
    );
  }
}