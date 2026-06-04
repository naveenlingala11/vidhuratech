import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PseudoChallengeService } from '../../services/pseudo-challenge';

type StudentFilter = 'ALL' | 'NOT_ATTEMPTED' | 'PASS' | 'FAIL';
type SortMode = 'LATEST' | 'TITLE' | 'COMPANY' | 'DIFFICULTY' | 'MARKS' | 'SCORE' | 'ATTEMPTS';

@Component({
  selector: 'app-student-pseudo-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-pseudo-challenges.html',
  styleUrls: ['./student-pseudo-challenges.css'],
})
export class StudentPseudoChallengesComponent implements OnInit {
  loading = false;
  toast = '';
  error = '';

  search = '';
  statusFilter: StudentFilter = 'ALL';
  companyFilter = '';
  difficultyFilter = '';
  sortBy: SortMode = 'LATEST';

  challenges: any[] = [];

  page = 1;
  pageSize = 10;

  readonly pageSizes = [5, 10, 15, 25];
  readonly statuses: StudentFilter[] = ['ALL', 'NOT_ATTEMPTED', 'PASS', 'FAIL'];
  readonly difficulties = ['EASY', 'MEDIUM', 'HARD'];

  constructor(
    private service: PseudoChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  get filteredChallenges(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.challenges.filter((item) => {
      const status = this.resolveStatus(item);
      const difficulty = this.resolveDifficulty(item);

      const haystack = [
        item.title,
        item.problemStatement,
        item.challengeGroupTitle,
        item.companyName,
        item.skill,
        item.batchId,
        difficulty,
        status,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!term || haystack.includes(term)) &&
        (this.statusFilter === 'ALL' || status === this.statusFilter) &&
        (!this.companyFilter || this.resolveCompany(item) === this.companyFilter) &&
        (!this.difficultyFilter || difficulty === this.difficultyFilter)
      );
    });
  }

  get sortedChallenges(): any[] {
    return [...this.filteredChallenges].sort((a, b) => this.sortChallenges(a, b));
  }

  get pagedChallenges(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedChallenges.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedChallenges.length / this.pageSize));
  }

  get fromItem(): number {
    if (!this.sortedChallenges.length) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.page * this.pageSize, this.sortedChallenges.length);
  }

  get companies(): string[] {
    return this.unique(this.challenges.map((item) => this.resolveCompany(item))).filter(Boolean);
  }

  get completedCount(): number {
    return this.challenges.filter((item) => ['PASS', 'FAIL'].includes(this.resolveStatus(item)))
      .length;
  }

  get passedCount(): number {
    return this.challenges.filter((item) => this.resolveStatus(item) === 'PASS').length;
  }

  get failedCount(): number {
    return this.challenges.filter((item) => this.resolveStatus(item) === 'FAIL').length;
  }

  get pendingCount(): number {
    return this.challenges.filter((item) => this.resolveStatus(item) === 'NOT_ATTEMPTED').length;
  }

  get averageScore(): number {
    const attempted = this.challenges.filter(
      (item) => this.resolveStatus(item) !== 'NOT_ATTEMPTED',
    );

    if (!attempted.length) return 0;

    const total = attempted.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    return Math.round(total / attempted.length);
  }

  get completionPercent(): number {
    if (!this.challenges.length) return 0;
    return Math.round((this.completedCount / this.challenges.length) * 100);
  }

  loadChallenges(): void {
    this.loading = true;
    this.error = '';

    this.service.getStudentChallenges().subscribe({
      next: (res: any) => {
        this.challenges = this.extractChallenges(res?.data ?? res);
        this.loading = false;
        this.page = 1;
      },
      error: (error) => {
        console.error(error);
        this.challenges = [];
        this.loading = false;
        this.error = 'Unable to load challenges';
        this.showToast('Unable to load challenges');
      },
    });
  }

  applyMetricFilter(filter: StudentFilter): void {
    this.statusFilter = filter;
    this.page = 1;
  }

  resetFilters(): void {
    this.search = '';
    this.statusFilter = 'ALL';
    this.companyFilter = '';
    this.difficultyFilter = '';
    this.sortBy = 'LATEST';
    this.pageSize = 10;
    this.page = 1;
  }

  onFilterChange(): void {
    this.page = 1;
  }

  changePage(nextPage: number): void {
    this.page = Math.min(Math.max(nextPage, 1), this.totalPages);
  }

  pages(): number[] {
    const total = this.totalPages;
    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    const end = Math.min(total, start + 4);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  startChallenge(item: any): void {
    this.openChallenge(Number(item.id));
  }

  viewResult(item: any): void {
    this.openChallenge(Number(item.id));
  }

  reAttempt(item: any): void {
    this.openChallenge(Number(item.id));
  }

  openChallenge(id: number): void {
    if (!id) {
      this.showToast('Challenge id missing');
      return;
    }

    this.router.navigate(['/dashboard/student/pseudocode-lab', id]);
  }

  trackById(_: number, item: any): number {
    return Number(item.id || 0);
  }

  resolveStatus(item: any): StudentFilter {
    const status = String(item?.status || 'NOT_ATTEMPTED').toUpperCase();
    return status === 'PASS' || status === 'FAIL' ? status : 'NOT_ATTEMPTED';
  }

  resolveCompany(item: any): string {
    return String(item?.companyName || 'General').trim() || 'General';
  }

  resolveDifficulty(item: any): string {
    return String(item?.difficultyLevel || item?.difficulty || 'MEDIUM')
      .trim()
      .toUpperCase();
  }

  resolveSkill(item: any): string {
    return String(item?.skill || 'Logic').trim() || 'Logic';
  }

  getStatusLabel(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'Passed';
    if (status === 'FAIL') return 'Failed';
    return 'Pending';
  }

  getStatusClass(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'status-pass';
    if (status === 'FAIL') return 'status-fail';
    return 'status-pending';
  }

  getStatusIcon(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'bi-check-circle-fill';
    if (status === 'FAIL') return 'bi-x-circle-fill';
    return 'bi-clock-history';
  }

  getDifficultyClass(item: any): string {
    const difficulty = this.resolveDifficulty(item);

    if (difficulty === 'EASY') return 'difficulty-easy';
    if (difficulty === 'HARD') return 'difficulty-hard';
    return 'difficulty-medium';
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2500);
  }

  private extractChallenges(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.challenges)) return payload.challenges;
    return [];
  }

  private sortChallenges(a: any, b: any): number {
    if (this.sortBy === 'TITLE') {
      return String(a.title || '').localeCompare(String(b.title || ''));
    }

    if (this.sortBy === 'COMPANY') {
      return this.resolveCompany(a).localeCompare(this.resolveCompany(b));
    }

    if (this.sortBy === 'DIFFICULTY') {
      return (
        this.difficultyRank(this.resolveDifficulty(a)) -
        this.difficultyRank(this.resolveDifficulty(b))
      );
    }

    if (this.sortBy === 'MARKS') {
      return Number(b.totalMarks || 0) - Number(a.totalMarks || 0);
    }

    if (this.sortBy === 'SCORE') {
      return Number(b.percentage || 0) - Number(a.percentage || 0);
    }

    if (this.sortBy === 'ATTEMPTS') {
      return Number(b.attemptCount || 0) - Number(a.attemptCount || 0);
    }

    return Number(b.id || 0) - Number(a.id || 0);
  }

  private difficultyRank(value: string): number {
    if (value === 'EASY') return 1;
    if (value === 'MEDIUM') return 2;
    if (value === 'HARD') return 3;
    return 4;
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }
}
