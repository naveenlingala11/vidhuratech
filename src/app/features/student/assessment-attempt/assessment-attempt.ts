import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AssessmentService } from '../../services/assessment.service';
import { AssessmentUtils } from '../../assessments/utils/assessment.utils';
import { IAssessment, IStudentAnswer, OptionKey } from '../../assessments/models/assessment.model';

@Component({
  selector: 'app-assessment-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-attempt.html',
  styleUrls: ['./assessment-attempt.css'],
})
export class AssessmentAttemptComponent implements OnInit, OnDestroy {
  readonly optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  assessmentId!: number;
  assessment!: IAssessment;
  answers: IStudentAnswer[] = [];
  criticalTimeAlertShown = false;
  submitted = false;
  loading = false;
  submitting = false;
  result: any = null;

  currentQuestionIndex = 0;
  bookmarkedQuestions: number[] = [];
  answeredQuestions: number[] = [];
  questionResults: any[] = [];

  showDetailedResults = false;
  showSubmitConfirm = false;

  timeRemaining = 0;
  totalDurationSeconds = 0;
  timerInterval: any;
  timeAlertShown = false;

  toast = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
  ) {}

  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAssessment();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (!this.assessment || this.submitted || this.showSubmitConfirm) return;

    const key = event.key.toUpperCase();

    if (['A', 'B', 'C', 'D'].includes(key)) {
      this.selectAnswer(key as OptionKey);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.goNext();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goPrevious();
      return;
    }

    if (key === 'B') {
      this.toggleBookmark(this.currentQuestionIndex);
      return;
    }

    if (key === 'U') {
      this.goToNextUnanswered();
      return;
    }

    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.openSubmitConfirm();
    }
  }

  loadAssessment(): void {
    this.loading = true;

    this.assessmentService.getAssessmentById(this.assessmentId).subscribe({
      next: (res) => {
        this.assessment = res.data;
        this.initializeAnswers();
        this.startTimer();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showToast('Unable to load assessment');
      },
    });
  }

  initializeAnswers(): void {
    this.answers = (this.assessment?.questions || []).map((q) => ({
      questionId: q.id!,
      selectedAnswer: '',
    }));
    this.updateAnsweredQuestions();
  }

  startTimer(): void {
    this.stopTimer();

    this.totalDurationSeconds = (this.assessment.durationMinutes || 60) * 60;
    this.timeRemaining = this.totalDurationSeconds;
    this.timeAlertShown = false;
    this.criticalTimeAlertShown = false;

    this.timerInterval = setInterval(() => {
      this.timeRemaining = Math.max(this.timeRemaining - 1, 0);

      if (this.timeRemaining === 300 && !this.timeAlertShown) {
        this.timeAlertShown = true;
        this.showToast('Only 5 minutes remaining');
      }

      if (this.timeRemaining === 30 && !this.criticalTimeAlertShown) {
        this.criticalTimeAlertShown = true;
        this.showToast('Final 30 seconds. Assessment will auto-submit.');
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.autoSubmitAssessment();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  autoSubmitAssessment(): void {
    if (this.submitted || this.submitting) return;

    this.showSubmitConfirm = false;
    this.showToast('Time is up. Auto-submitting your assessment now.');
    this.submitAssessment();
  }

  get currentQuestion(): any {
    return this.assessment?.questions?.[this.currentQuestionIndex];
  }

  get totalQuestions(): number {
    return this.assessment?.questions?.length || 0;
  }

  get unansweredCount(): number {
    return Math.max(this.totalQuestions - this.answeredQuestions.length, 0);
  }

  get bookmarkedCount(): number {
    return this.bookmarkedQuestions.length;
  }

  getFormattedTime(): string {
    return AssessmentUtils.formatTimeRemaining(this.timeRemaining);
  }
  getTimeRemainingClass(): string {
    if (this.timeRemaining <= 30) return 'critical';
    if (this.timeRemaining <= 300) return 'danger';
    if (this.timeRemaining <= 600) return 'warning';
    return 'normal';
  }

  getTimerPercentage(): number {
    if (!this.totalDurationSeconds) return 0;
    return Math.round((this.timeRemaining / this.totalDurationSeconds) * 100);
  }

  isCriticalTime(): boolean {
    return this.timeRemaining > 0 && this.timeRemaining <= 30;
  }

  getAttemptPageClass(): string {
    return this.isCriticalTime() ? 'critical-time-mode' : '';
  }

  selectQuestion(index: number): void {
    if (index < 0 || index >= this.totalQuestions) return;
    this.currentQuestionIndex = index;
  }

  goPrevious(): void {
    this.selectQuestion(this.currentQuestionIndex - 1);
  }

  goNext(): void {
    this.selectQuestion(this.currentQuestionIndex + 1);
  }

  goToNextUnanswered(): void {
    const next = this.answers.findIndex((answer, index) => {
      return index > this.currentQuestionIndex && !AssessmentUtils.isAnswered(answer);
    });

    if (next > -1) {
      this.selectQuestion(next);
      return;
    }

    const first = this.answers.findIndex((answer) => !AssessmentUtils.isAnswered(answer));

    if (first > -1) {
      this.selectQuestion(first);
      return;
    }

    this.showToast('All questions are answered');
  }

  isQuestionAnswered(index: number): boolean {
    return AssessmentUtils.isAnswered(this.answers[index]);
  }

  toggleBookmark(index: number): void {
    const existing = this.bookmarkedQuestions.indexOf(index);

    if (existing > -1) {
      this.bookmarkedQuestions.splice(existing, 1);
      this.showToast(`Removed bookmark from question ${index + 1}`);
      return;
    }

    this.bookmarkedQuestions.push(index);
    this.showToast(`Bookmarked question ${index + 1}`);
  }

  isQuestionBookmarked(index: number): boolean {
    return this.bookmarkedQuestions.includes(index);
  }

  selectAnswer(option: OptionKey): void {
    if (!this.answers[this.currentQuestionIndex]) return;

    this.answers[this.currentQuestionIndex].selectedAnswer = option;
    this.onAnswerChange();
  }

  clearCurrentAnswer(): void {
    if (!this.answers[this.currentQuestionIndex]) return;

    this.answers[this.currentQuestionIndex].selectedAnswer = '';
    this.onAnswerChange();
    this.showToast('Answer cleared');
  }

  onAnswerChange(): void {
    this.updateAnsweredQuestions();
  }

  updateAnsweredQuestions(): void {
    this.answeredQuestions = this.answers
      .map((answer, index) => (AssessmentUtils.isAnswered(answer) ? index : -1))
      .filter((index) => index !== -1);
  }

  getProgressPercentage(): number {
    if (!this.totalQuestions) return 0;
    return Math.round((this.answeredQuestions.length / this.totalQuestions) * 100);
  }

  openSubmitConfirm(): void {
    if (this.submitted || this.loading || this.submitting) return;
    this.showSubmitConfirm = true;
  }

  closeSubmitConfirm(): void {
    this.showSubmitConfirm = false;
  }

  submitAssessment(): void {
    if (this.submitted || this.loading || this.submitting) return;

    this.updateAnsweredQuestions();

    this.submitting = true;
    this.loading = true;
    this.showSubmitConfirm = false;

    const payload = {
      answers: this.answers,
    };

    this.assessmentService.submitAssessment(this.assessmentId, payload).subscribe({
      next: (res: any) => {
        this.result = res.data;
        this.submitted = true;
        this.loading = false;
        this.submitting = false;

        this.stopTimer();
        this.processResults();

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Assessment submitted successfully');
      },
      error: (err) => {
        console.error('Assessment Submit Error', err);
        this.loading = false;
        this.submitting = false;
        this.showToast(err?.error?.message || 'Submission failed');
      },
    });
  }

  processResults(): void {
    if (!this.result || !this.assessment?.questions?.length) return;

    this.questionResults = this.assessment.questions.map((question, index) => {
      const studentAnswer = this.answers[index]?.selectedAnswer || '';
      const isCorrect = studentAnswer === question.correctAnswer;

      return {
        question,
        studentAnswer,
        isCorrect,
        marksObtained: isCorrect ? question.marks : 0,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || 'No explanation available.',
      };
    });
  }

  getOptionValue(options: any, key: OptionKey): string {
    return options?.[key] || '';
  }

  getTotalScore(): number {
    if (this.result?.score != null) return this.result.score;

    return this.questionResults.reduce((sum, item) => sum + item.marksObtained, 0);
  }

  getPercentageScore(): number {
    if (this.result?.percentage != null) return this.result.percentage;

    if (!this.assessment?.totalMarks) return 0;

    return Math.round((this.getTotalScore() / this.assessment.totalMarks) * 100);
  }

  getCorrectCount(): number {
    if (this.result?.correctAnswers != null) return this.result.correctAnswers;

    return this.questionResults.filter((item) => item.isCorrect).length;
  }

  getPassStatus(): 'pass' | 'fail' {
    return this.getPercentageScore() >= 40 ? 'pass' : 'fail';
  }

  viewDetailedResults(): void {
    this.showDetailedResults = true;
  }

  hideDetailedResults(): void {
    this.showDetailedResults = false;
  }

  backToAssessments(): void {
    this.router.navigate(['/dashboard/student/assessments']);
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }
}
