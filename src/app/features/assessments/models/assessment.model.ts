export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface IOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface IQuestion {
  id?: number;
  question: string;
  options: IOption;
  correctAnswer: OptionKey;
  marks: number;
  explanation?: string;
}

export interface IAssessment {
  id?: number;
  batchId: number;
  title: string;
  description: string;
  totalMarks: number;
  durationMinutes: number;
  questions: IQuestion[];
  createdAt?: Date;
  createdBy?: number;
}

export interface IStudentAnswer {
  questionId: number;
  selectedAnswer: OptionKey | '';
  isCorrect?: boolean;
  marksObtained?: number;
}

export interface IAssessmentAttempt {
  id?: number;
  studentId: number;
  assessmentId: number;
  answers: IStudentAnswer[];
  totalScore: number;
  totalMarksObtained: number;
  completedAt?: Date;
  status: 'submitted' | 'in_progress' | 'draft';
}

export interface IQuestionResult {
  question: IQuestion;
  studentAnswer: OptionKey | '';
  isCorrect: boolean;
  marksObtained: number;
  explanation: string;
}

export interface IAssessmentResult {
  attempt: IAssessmentAttempt;
  assessment: IAssessment;
  questionResults: IQuestionResult[];
  totalScore: number;
  percentageScore: number;
  status: 'pass' | 'fail';
  studentName?: string;
  submittedAt?: Date;
}

export interface IBulkAssessmentValidationError {
  questionIndex: number;
  errors: string[];
}

export interface IBulkAssessmentValidationResult {
  valid: boolean;
  errors: IBulkAssessmentValidationError[];
  totalQuestions?: number;
  totalMarks?: number;
}