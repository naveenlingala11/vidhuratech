import {
  IBulkAssessmentValidationResult,
  IBulkAssessmentValidationError,
  IQuestion,
  IAssessment,
  OptionKey
} from '../models/assessment.model';
export class AssessmentUtils {
  static validateAssessmentJSON(
    json: string
  ): IBulkAssessmentValidationResult {
    try {
      const parsed = JSON.parse(json);
      return this.validateAssessmentStructure(parsed);
    } catch (e) {
      return {
        valid: false,
        errors: [
          {
            questionIndex: -1,
            errors: [
              'Invalid JSON format: ' +
              (e as Error).message
            ]
          }
        ]
      };
    }
  }
  static validateAssessmentStructure(
    data: any
  ): IBulkAssessmentValidationResult {
    const errors: IBulkAssessmentValidationError[] = [];
    if (!data.title?.trim()) {
      errors.push({
        questionIndex: -1,
        errors: ['Title is required']
      });
    }
    if (!data.batchId) {
      errors.push({
        questionIndex: -1,
        errors: ['Batch ID is required']
      });
    }
    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    ) {
      errors.push({
        questionIndex: -1,
        errors: ['At least one question is required']
      });
      return {
        valid: false,
        errors
      };
    }
    let totalMarks = 0;
    data.questions.forEach((q: any, index: number) => {
      const qErrors = this.validateQuestion(q);
      if (qErrors.length > 0) {
        errors.push({
          questionIndex: index,
          errors: qErrors
        });
      } else {
        totalMarks += q.marks || 0;
      }
    });
    return {
      valid: errors.length === 0,
      errors,
      totalQuestions: data.questions.length,
      totalMarks
    };
  }
  static validateQuestion(
    question: any
  ): string[] {
    const errors: string[] = [];
    if (!question.question?.trim()) {
      errors.push('Question text required');
    }
    if (!question.options) {
      errors.push('Options required');
      return errors;
    }
    const keys: OptionKey[] = ['A', 'B', 'C', 'D'];
    keys.forEach(key => {
      if (!question.options[key]?.trim()) {
        errors.push(`Option ${key} required`);
      }
    });
    if (
      !question.correctAnswer ||
      !keys.includes(question.correctAnswer)
    ) {
      errors.push(
        'Correct answer must be A/B/C/D'
      );
    }
    if (!question.marks || question.marks <= 0) {
      errors.push('Marks must be positive');
    }
    return errors;
  }
  static formatTimeRemaining(
    seconds: number
  ): string {
    if (seconds <= 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  static isAnswered(answer: any): boolean {
    return !!(
      answer &&
      answer.selectedAnswer &&
      answer.selectedAnswer.trim() !== ''
    );
  }
  static getCorrectAnswerText(
    question: IQuestion
  ): string {
    return question.options[question.correctAnswer];
  }
  static getStudentAnswerText(
    question: IQuestion,
    selectedAnswer: string
  ): string | null {
    if (!selectedAnswer) {
      return null;
    }
    return question.options[
      selectedAnswer as OptionKey
    ];
  }
  static parseQuestions(
    questionsInput: any[]
  ): IQuestion[] {
    return questionsInput.map((q: any) => ({
      question: q.question,
      options: {
        A: q.options?.A || '',
        B: q.options?.B || '',
        C: q.options?.C || '',
        D: q.options?.D || ''
      },
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      explanation: q.explanation || ''
    }));
  }
}