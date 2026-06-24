import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrainerInterviewQuestionService } from '../../../services/trainer-interview-questions-service';
import { TrainerBatchLookupService } from '../../../services/trainer-batch-lookup.service';

type ViewMode = 'GRID' | 'TABLE';

@Component({
  selector: 'app-trainer-interview-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-interview-questions.html',
  styleUrls: ['./trainer-interview-questions.css'],
})
export class TrainerInterviewQuestionsComponent implements OnInit {
  loading = false;
  saving = false;
  toast = '';
  search = '';
  editingId: number | null = null;
  showJson = false;
  jsonText = '';
  viewMode: ViewMode = 'GRID';

  companyFilter = '';
  roleFilter = '';
  difficultyFilter = '';
  publishFilter: 'ALL' | 'PUBLIC' | 'PRIVATE' = 'ALL';

  questions: any[] = [];
  batches: any[] = [];
  selected: any = null;

  roles = ['JAVA', 'PYTHON', 'SQL', 'APTITUDE', 'HR'];
  types = ['CONCEPTUAL', 'SCENARIO', 'IMPLEMENTATION', 'HR'];
  difficulties = ['EASY', 'MEDIUM', 'HARD'];

  form: {
    batchId: string;
    company: string;
    role: string;
    type: string;
    topic: string;
    difficulty: string;
    question: string;
    answer: string;
    askedYear?: number;
  } = this.emptyForm();

  constructor(
    private service: TrainerInterviewQuestionService,
    private batchLookup: TrainerBatchLookupService,
  ) { }

  ngOnInit(): void {
    this.loadBatches();
    this.loadQuestions();
  }

  loadBatches(): void {
    this.batchLookup.getMyBatches().subscribe({
      next: (res: any) => {
        this.batches = res?.data || [];
        if (this.batches.length && !this.form.batchId)
          this.form.batchId = String(this.batches[0].id);
      },
      error: () => this.showToast('Unable to load batches'),
    });
  }

  loadQuestions(): void {
    this.loading = true;
    this.service.list().subscribe({
      next: (res: any) => {
        this.questions = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.questions = [];
        this.showToast(err?.error?.message || 'Unable to load interview questions');
      },
    });
  }

  get filteredQuestions(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.questions.filter((q) => {
      const text = [
        q.company,
        q.role,
        q.type,
        q.topic,
        q.difficulty,
        q.question,
        q.answer,
        q.batchId,
      ]
        .join(' ')
        .toLowerCase();

      const companyOk =
        !this.companyFilter ||
        String(q.company || '')
          .toLowerCase()
          .includes(this.companyFilter.toLowerCase());
      const roleOk = !this.roleFilter || q.role === this.roleFilter;
      const difficultyOk = !this.difficultyFilter || q.difficulty === this.difficultyFilter;
      const publishOk =
        this.publishFilter === 'ALL' ||
        (this.publishFilter === 'PUBLIC' && q.publicVisible) ||
        (this.publishFilter === 'PRIVATE' && !q.publicVisible);

      return text.includes(term) && companyOk && roleOk && difficultyOk && publishOk;
    });
  }

  get stats() {
    return {
      total: this.questions.length,
      public: this.questions.filter((q) => q.publicVisible).length,
      private: this.questions.filter((q) => !q.publicVisible).length,
      companies: new Set(this.questions.map((q) => String(q.company || 'General').toLowerCase()))
        .size,
    };
  }

  save(): void {
    if (!this.isValid()) return;

    this.saving = true;
    const request = this.editingId
      ? this.service.update(this.editingId, this.buildPayload())
      : this.service.create(this.buildPayload());

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showToast(
          this.editingId ? 'Question updated successfully' : 'Question created successfully',
        );
        this.reset();
        this.loadQuestions();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Unable to save question');
      },
    });
  }

  edit(q: any): void {
    this.editingId = q.id;
    this.form = {
      batchId: String(q.batchId !== null && q.batchId !== undefined ? q.batchId : 0),
      company: q.company || '',
      role: q.role || 'JAVA',
      type: q.type || 'CONCEPTUAL',
      topic: q.topic || '',
      difficulty: q.difficulty || 'MEDIUM',
      question: q.question || '',
      answer: q.answer || '',
      askedYear: q.askedYear ? Number(q.askedYear) : undefined,
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Question loaded for editing');
  }

  delete(id: number): void {
    if (!confirm('Delete this interview question?')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.questions = this.questions.filter((q) => q.id !== id);
        if (this.selected?.id === id) this.selected = null;
        this.showToast('Question deleted');
      },
      error: () => this.showToast('Unable to delete question'),
    });
  }

  preview(q: any): void {
    this.selected = q;
  }

  closePreview(): void {
    this.selected = null;
  }

  reset(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  clearFilters(): void {
    this.search = '';
    this.companyFilter = '';
    this.roleFilter = '';
    this.difficultyFilter = '';
    this.publishFilter = 'ALL';
  }

  loadSampleJson(): void {
    this.showJson = true;
    this.jsonText = JSON.stringify(
      [
        {
          batchId: Number(this.form.batchId || this.batches?.[0]?.id || 1),
          company: 'TCS',
          role: 'JAVA',
          type: 'CONCEPTUAL',
          topic: 'OOP',
          difficulty: 'MEDIUM',
          question: 'What is polymorphism in Java?',
          answer:
            'Definition: Polymorphism allows one interface to have many implementations.\nExplanation: In Java it happens through method overloading and overriding.\nExample: A parent reference can point to child objects.\nReal-world Scenario: Payment can be processed by card, UPI, or wallet using the same method name.\nInterview Tip: Explain compile-time and runtime polymorphism separately.',
        },
      ],
      null,
      2,
    );
  }

  uploadJson(): void {
    let parsed: any;

    try {
      parsed = JSON.parse(this.jsonText);
    } catch {
      this.showToast('Invalid JSON');
      return;
    }

    const fallbackBatchId = Number(this.form.batchId || this.batches?.[0]?.id || 0);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    const payload = items.map((item) => ({
      batchId: Number(item.batchId || fallbackBatchId),
      company: String(item.company || this.form.company || 'General').trim(),
      role: String(item.role || this.form.role || 'JAVA')
        .trim()
        .toUpperCase(),
      type: String(item.type || 'CONCEPTUAL')
        .trim()
        .toUpperCase(),
      topic: String(item.topic || 'General').trim(),
      difficulty: String(item.difficulty || 'MEDIUM')
        .trim()
        .toUpperCase(),
      question: String(item.question || '').trim(),
      answer: String(item.answer || '').trim(),
      askedYear: item.askedYear ? Number(item.askedYear) : (this.form.askedYear ? Number(this.form.askedYear) : null),
    }));

    const invalid = payload.find(
      (x) => (x.batchId === undefined || x.batchId === null) || !x.question || !x.answer || !x.company || !x.role,
    );

    if (invalid) {
      this.showToast('Every JSON item needs batchId, company, role, question and answer');
      return;
    }

    this.saving = true;
    this.service.bulk(payload).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.saving = false;
        this.showJson = false;
        this.jsonText = '';
        this.showToast(`Uploaded ${data?.successCount || payload.length} questions`);
        this.loadQuestions();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Bulk upload failed');
      },
    });
  }

  get jsonPreviewCount(): number {
    if (!this.jsonText.trim()) return 0;
    try {
      const parsed = JSON.parse(this.jsonText);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 0;
    }
  }

  onJsonFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.showToast('Upload a valid JSON file');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.jsonText = String(reader.result || '');
      this.showToast('JSON file loaded');
      input.value = '';
    };
    reader.onerror = () => this.showToast('Unable to read JSON file');
    reader.readAsText(file);
  }

  clearJson(): void {
    this.jsonText = '';
  }

  getSection(answer: string, start: string, end: string): string {
    if (!answer) return 'Content not available.';
    const startIndex = answer.indexOf(start);
    if (startIndex === -1) return start === 'Definition:' ? answer : 'Content not available.';
    const remaining = answer.substring(startIndex + start.length);
    const endIndex = end ? remaining.indexOf(end) : -1;
    return endIndex === -1 ? remaining.trim() : remaining.substring(0, endIndex).trim();
  }

  private isValid(): boolean {
    if (this.form.batchId === undefined || this.form.batchId === null || this.form.batchId === '') return this.fail('Batch is required');
    if (!this.form.company.trim()) return this.fail('Company is required');
    if (!this.form.role.trim()) return this.fail('Role is required');
    if (!this.form.topic.trim()) return this.fail('Topic is required');
    if (!this.form.question.trim()) return this.fail('Question is required');
    if (!this.form.answer.trim()) return this.fail('Answer is required');
    return true;
  }

  private buildPayload(): any {
    return {
      batchId: Number(this.form.batchId),
      company: this.form.company.trim(),
      role: this.form.role.trim().toUpperCase(),
      type: this.form.type,
      topic: this.form.topic.trim(),
      difficulty: this.form.difficulty,
      question: this.form.question.trim(),
      answer: this.form.answer.trim(),
      askedYear: this.form.askedYear ? Number(this.form.askedYear) : null,
    };
  }

  private fail(message: string): boolean {
    this.showToast(message);
    return false;
  }

  private emptyForm(): {
    batchId: string;
    company: string;
    role: string;
    type: string;
    topic: string;
    difficulty: string;
    question: string;
    answer: string;
    askedYear?: number;
  } {
    return {
      batchId: '0',
      company: '',
      role: 'JAVA',
      type: 'CONCEPTUAL',
      topic: '',
      difficulty: 'MEDIUM',
      question: '',
      answer: '',
      askedYear: new Date().getFullYear(),
    };
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }
}
