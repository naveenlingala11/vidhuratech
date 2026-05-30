import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentInterviewQuestionService } from '../../../services/student-interview-questions-service';

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
  questions: any[] = [];
  page = 0;
  totalPages = 0;
  selected: any = null;

  roles = ['JAVA', 'PYTHON', 'SQL', 'APTITUDE', 'HR'];
  difficulties = ['EASY', 'MEDIUM', 'HARD'];

  filters = {
    company: '',
    role: '',
    search: '',
    type: '',
    difficulty: '',
    topic: '',
  };

  constructor(private service: StudentInterviewQuestionService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.service.list({ ...this.filters, page: this.page }).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.questions = (data?.content || []).map((q: any) => ({ ...q, show: false }));
        this.totalPages = data?.totalPages || 0;
        this.loading = false;
      },
      error: (err) => {
        this.questions = [];
        this.totalPages = 0;
        this.loading = false;
        this.error = err?.error?.message || 'Unable to load interview questions';
      },
    });
  }

  apply(): void {
    this.page = 0;
    this.load();
  }

  clear(): void {
    this.filters = { company: '', role: '', search: '', type: '', difficulty: '', topic: '' };
    this.page = 0;
    this.load();
  }

  chooseRole(role: string): void {
    this.filters.role = this.filters.role === role ? '' : role;
    this.apply();
  }

  toggle(q: any): void {
    q.show = !q.show;
  }

  open(q: any): void {
    this.selected = q;
  }

  close(): void {
    this.selected = null;
  }

  next(): void {
    if (this.page >= this.totalPages - 1) return;
    this.page++;
    this.load();
  }

  prev(): void {
    if (this.page === 0) return;
    this.page--;
    this.load();
  }

  get stats() {
    return {
      total: this.questions.length,
      companies: new Set(this.questions.map((q) => String(q.company || 'General').toLowerCase()))
        .size,
      medium: this.questions.filter((q) => q.difficulty === 'MEDIUM').length,
    };
  }

  getSection(answer: string, start: string, end: string): string {
    if (!answer) return 'Content not available.';
    const startIndex = answer.indexOf(start);
    if (startIndex === -1) return start === 'Definition:' ? answer : 'Content not available.';
    const remaining = answer.substring(startIndex + start.length);
    const endIndex = end ? remaining.indexOf(end) : -1;
    return endIndex === -1 ? remaining.trim() : remaining.substring(0, endIndex).trim();
  }
}
