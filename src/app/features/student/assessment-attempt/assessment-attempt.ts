import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  AssessmentService
} from '../../services/assessment.service';
import {
  AssessmentUtils
} from '../../assessments/utils/assessment.utils';
import {
  IAssessment,
  IAssessmentResult,
  IStudentAnswer,
  OptionKey
} from '../../assessments/models/assessment.model';
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
  implements OnInit, OnDestroy {
  readonly optionKeys: OptionKey[] = [
    'A',
    'B',
    'C',
    'D'
  ];
  assessmentId!: number;
  assessment!: IAssessment;
  answers: IStudentAnswer[] = [];
  submitted = false;
  loading = false;
  result: any = null;
  currentQuestionIndex = 0;
  bookmarkedQuestions: number[] = [];
  answeredQuestions: number[] = [];
  showDetailedResults = false;
  questionResults: any[] = [];
  timeRemaining = 0;
  timerInterval: any;
  timeAlertShown = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService
  ) { }
  ngOnInit(): void {
    this.assessmentId = Number(
      this.route.snapshot.paramMap.get('id')
    );
    this.loadAssessment();
  }
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  loadAssessment() {
    this.loading = true;
    this.assessmentService
      .getAssessmentById(this.assessmentId)
      .subscribe({
        next: (res) => {
          this.assessment = res.data;
          this.initializeAnswers();
          this.startTimer();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
  initializeAnswers() {
    this.answers =
      this.assessment.questions.map(q => ({
        questionId: q.id!,
        selectedAnswer: ''
      }));
  }
  startTimer() {
    this.timeRemaining =
      (this.assessment.durationMinutes || 60)
      * 60;
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (
        this.timeRemaining === 300 &&
        !this.timeAlertShown
      ) {
        this.timeAlertShown = true;
        alert(
          'Only 5 minutes remaining'
        );
      }
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmitAssessment();
      }
    }, 1000);
  }
  autoSubmitAssessment() {
    alert('Time Up');
    this.submitAssessment();
  }
  getFormattedTime(): string {
    return AssessmentUtils.formatTimeRemaining(
      this.timeRemaining
    );
  }
  getTimeRemainingClass(): string {
    if (this.timeRemaining <= 300) {
      return 'danger';
    }
    if (this.timeRemaining <= 600) {
      return 'warning';
    }
    return 'normal';
  }
  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
  }
  isQuestionAnswered(index: number): boolean {
    return AssessmentUtils.isAnswered(
      this.answers[index]
    );
  }
  toggleBookmark(index: number) {
    const existing =
      this.bookmarkedQuestions.indexOf(index);
    if (existing > -1) {
      this.bookmarkedQuestions.splice(
        existing,
        1
      );
    } else {
      this.bookmarkedQuestions.push(index);
    }
  }
  isQuestionBookmarked(
    index: number
  ): boolean {
    return this.bookmarkedQuestions.includes(
      index
    );
  }
  onAnswerChange() {
    this.updateAnsweredQuestions();
  }
  updateAnsweredQuestions() {
    this.answeredQuestions =
      this.answers
        .map((a, i) =>
          AssessmentUtils.isAnswered(a)
            ? i
            : -1
        )
        .filter(i => i !== -1);
  }
  getProgressPercentage(): number {
    if (
      !this.assessment?.questions?.length
    ) {
      return 0;
    }
    return Math.round(
      (
        this.answeredQuestions.length /
        this.assessment.questions.length
      ) * 100
    );
  }
  submitAssessment() {
    if (this.submitted || this.loading) {
      return;
    }
    this.loading = true;
    const payload = {
      answers: this.answers
    };
    console.log(
      'Submitting Assessment Payload',
      payload
    );
    this.assessmentService
      .submitAssessment(
        this.assessmentId,
        payload
      )
      .subscribe({
        next: (res: any) => {
          console.log(
            'Assessment Submit Response',
            res
          );
          this.result = res.data;
          this.submitted = true;
          this.loading = false;
          clearInterval(
            this.timerInterval
          );
          this.processResults();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          setTimeout(() => {
            this.router.navigate([
              '/dashboard/student/assessments'
            ]);
          }, 3000);
        },
        error: (err) => {
          console.error(
            'Assessment Submit Error',
            err
          );
          this.loading = false;
          alert(
            err?.error?.message ||
            'Submission failed'
          );
        }
      });
  }
  processResults() {
    if (!this.result) {
      return;
    }
    this.questionResults =
      this.assessment.questions.map(
        (q, i) => {
          const studentAnswer =
            this.answers[i]
              ?.selectedAnswer || '';
          const isCorrect =
            studentAnswer ===
            q.correctAnswer;
          return {
            question: q,
            studentAnswer,
            isCorrect,
            marksObtained:
              isCorrect
                ? q.marks
                : 0,
            correctAnswer:
              q.correctAnswer,
            explanation:
              q.explanation ||
              'No explanation'
          };
        }
      );
  }
  getOptionValue(
    options: any,
    key: OptionKey
  ): string {
    return options?.[key] || '';
  }
  getTotalScore(): number {
    if (this.result?.score != null) {
      return this.result.score;
    }
    return this.questionResults.reduce(
      (sum, q) =>
        sum + q.marksObtained,
      0
    );
  }
  getPercentageScore(): number {
    if (this.result?.percentage != null) {
      return this.result.percentage;
    }
    return Math.round(
      (
        this.getTotalScore() /
        this.assessment.totalMarks
      ) * 100
    );
  }
  getPassStatus(): 'pass' | 'fail' {
    return this.getPercentageScore() >= 40
      ? 'pass'
      : 'fail';
  }
  viewDetailedResults() {
    this.showDetailedResults = true;
  }
  hideDetailedResults() {
    this.showDetailedResults = false;
  }
}