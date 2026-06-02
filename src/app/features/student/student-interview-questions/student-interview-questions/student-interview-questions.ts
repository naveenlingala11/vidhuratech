import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentInterviewQuestionService } from '../../../services/student-interview-questions-service';

type SortMode = 'LATEST' | 'COMPANY' | 'ROLE' | 'TOPIC' | 'DIFFICULTY' | 'CONFIDENCE';
type StatusMode = 'ALL' | 'TODO' | 'DONE' | 'SAVED';
type AnswerTab = 'ANSWER' | 'NOTES' | 'DISCUSSION';

interface InterviewQuestionItem {
  id: number;
  question: string;
  answer: string;
  company: string;
  role: string;
  topic: string;
  type: string;
  difficulty: string;
  saved: boolean;
  done: boolean;
  confidence: number;
  notes: string;
  discussionDraft: string;
  expanded: boolean;
  activeTab: AnswerTab;
}

@Component({
  selector: 'app-student-interview-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-interview-questions.html',
  styleUrls: ['./student-interview-questions.css'],
})
export class StudentInterviewQuestionsComponent implements OnInit {
  loading = false;
  error = '';
  toast = '';
  validation = '';

  questions: InterviewQuestionItem[] = [];

  page = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  search = '';
  company = '';
  topic = '';
  role = '';
  type = '';
  difficulty = '';

  sortBy: SortMode = 'LATEST';
  statusFilter: StatusMode = 'ALL';

  roles = ['JAVA', 'PYTHON', 'SQL', 'APTITUDE', 'HR'];
  difficulties = ['EASY', 'MEDIUM', 'HARD'];
  types = ['CONCEPTUAL', 'SCENARIO', 'IMPLEMENTATION', 'HR'];

  private stateStore = new Map<number, Partial<InterviewQuestionItem>>();

  constructor(private service: StudentInterviewQuestionService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.validation = '';

    if (this.search.trim().length === 1) {
      this.validation = 'Search must contain at least 2 characters.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.service
      .list({
        search: this.search.trim(),
        company: this.company.trim(),
        role: this.role.trim(),
        topic: this.topic.trim(),
        type: this.type.trim(),
        difficulty: this.difficulty.trim(),
        page: this.page,
      })
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;
          this.questions = (data?.content || []).map((q: any) => this.mapQuestion(q));
          this.totalPages = Number(data?.totalPages || 0);
          this.totalElements = Number(data?.totalElements || this.questions.length);
          this.loading = false;
        },
        error: (err) => {
          this.questions = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.loading = false;
          this.error = err?.error?.message || 'Unable to load interview questions';
        },
      });
  }

  applyFilters(): void {
    this.page = 0;
    this.load();
  }

  resetFilters(): void {
    this.search = '';
    this.company = '';
    this.topic = '';
    this.role = '';
    this.type = '';
    this.difficulty = '';
    this.sortBy = 'LATEST';
    this.statusFilter = 'ALL';
    this.page = 0;
    this.validation = '';
    this.load();
  }

  chooseRole(value: string): void {
    this.role = this.role === value ? '' : value;
    this.applyFilters();
  }

  chooseDifficulty(value: string): void {
    this.difficulty = this.difficulty === value ? '' : value;
    this.applyFilters();
  }

  toggleExpand(item: InterviewQuestionItem): void {
    item.expanded = !item.expanded;
    this.persist(item);
  }

  setTab(item: InterviewQuestionItem, tab: AnswerTab): void {
    item.activeTab = tab;
    item.expanded = true;
    this.persist(item);
  }

  toggleSave(item: InterviewQuestionItem, event?: Event): void {
    event?.stopPropagation();
    item.saved = !item.saved;
    this.persist(item);
    this.showToast(item.saved ? 'Bookmarked' : 'Bookmark removed');
  }

  toggleDone(item: InterviewQuestionItem, event?: Event): void {
    event?.stopPropagation();
    item.done = !item.done;
    this.persist(item);
    this.showToast(item.done ? 'Marked as done' : 'Moved back to todo');
  }

  setConfidence(item: InterviewQuestionItem, value: number): void {
    item.confidence = Number(value);
    this.persist(item);
  }

  prev(): void {
    if (this.page <= 0) return;
    this.page--;
    this.load();
  }

  next(): void {
    if (this.page >= this.totalPages - 1) return;
    this.page++;
    this.load();
  }

  goToPage(pageNumber: number): void {
    const target = pageNumber - 1;
    if (target < 0 || target >= this.totalPages || target === this.page) return;
    this.page = target;
    this.load();
  }

  get visibleQuestions(): InterviewQuestionItem[] {
    return this.questions
      .filter((item) => {
        if (this.statusFilter === 'SAVED') return item.saved;
        if (this.statusFilter === 'DONE') return item.done;
        if (this.statusFilter === 'TODO') return !item.done;
        return true;
      })
      .sort((a, b) => this.sortQuestions(a, b));
  }

  get stats() {
    return {
      loaded: this.questions.length,
      total: this.totalElements || this.questions.length,
      saved: this.questions.filter((q) => q.saved).length,
      done: this.questions.filter((q) => q.done).length,
      todo: this.questions.filter((q) => !q.done).length,
      avgConfidence: this.questions.length
        ? Math.round(
            this.questions.reduce((sum, q) => sum + q.confidence, 0) / this.questions.length,
          )
        : 0,
    };
  }

  get completionPercent(): number {
    if (!this.questions.length) return 0;
    return Math.round((this.stats.done / this.questions.length) * 100);
  }

  pages(): number[] {
    const total = Math.max(this.totalPages, 1);
    const current = this.page + 1;
    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  section(answer: string, start: string, end: string): string {
    if (!answer || !answer.trim()) return 'Content not available.';

    const lower = answer.toLowerCase();
    const startIndex = lower.indexOf(start.toLowerCase());

    if (startIndex === -1) {
      return start === 'Definition:' ? answer.trim() : 'Content not available.';
    }

    const rest = answer.substring(startIndex + start.length);
    const endIndex = end ? rest.toLowerCase().indexOf(end.toLowerCase()) : -1;

    return endIndex === -1 ? rest.trim() : rest.substring(0, endIndex).trim();
  }

  trackById(_: number, item: InterviewQuestionItem): number {
    return item.id;
  }

  private mapQuestion(q: any): InterviewQuestionItem {
    const id = Number(q.id || 0);
    const old = this.stateStore.get(id) || {};

    return {
      id,
      question: this.safe(q.question || q.title, 'Untitled question'),
      answer: this.safe(q.answer || q.description, ''),
      company: this.safe(q.company || q.companyName, 'General'),
      role: this.safe(q.role || q.skill, 'General'),
      topic: this.safe(q.topic, 'General'),
      type: this.safe(q.type, 'CONCEPTUAL'),
      difficulty: this.safe(q.difficulty, 'MEDIUM').toUpperCase(),
      saved: Boolean(old.saved),
      done: Boolean(old.done),
      confidence: Number(old.confidence ?? 50),
      notes: String(old.notes || ''),
      discussionDraft: String(old.discussionDraft || ''),
      expanded: Boolean(old.expanded),
      activeTab: (old.activeTab as AnswerTab) || 'ANSWER',
    };
  }

  private persist(item: InterviewQuestionItem): void {
    this.stateStore.set(item.id, {
      saved: item.saved,
      done: item.done,
      confidence: item.confidence,
      notes: item.notes,
      discussionDraft: item.discussionDraft,
      expanded: item.expanded,
      activeTab: item.activeTab,
    });
  }

  private sortQuestions(a: InterviewQuestionItem, b: InterviewQuestionItem): number {
    if (this.sortBy === 'COMPANY') return a.company.localeCompare(b.company);
    if (this.sortBy === 'ROLE') return a.role.localeCompare(b.role);
    if (this.sortBy === 'TOPIC') return a.topic.localeCompare(b.topic);
    if (this.sortBy === 'DIFFICULTY')
      return this.difficultyRank(a.difficulty) - this.difficultyRank(b.difficulty);
    if (this.sortBy === 'CONFIDENCE') return a.confidence - b.confidence;
    return b.id - a.id;
  }

  private difficultyRank(value: string): number {
    if (value === 'EASY') return 1;
    if (value === 'MEDIUM') return 2;
    if (value === 'HARD') return 3;
    return 4;
  }

  private safe(value: any, fallback: string): string {
    const text = String(value || '').trim();
    return text || fallback;
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }
}
