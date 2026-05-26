import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PseudoChallengeService } from '../../services/pseudo-challenge';

type SubmissionFilter = 'ALL' | 'PASS' | 'FAIL';
type SubmissionSort = 'LATEST' | 'SCORE' | 'STUDENT' | 'CHALLENGE';

interface StudentSubmissionGroup {
  id: string;
  studentName: string;
  studentEmail: string;
  submissions: any[];
  passedCount: number;
  failedCount: number;
  averageScore: number;
  latestSubmittedAt: any;
}

@Component({
  selector: 'app-trainer-pseudo-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-pseudo-submissions.html',
  styleUrls: ['./trainer-pseudo-submissions.css'],
})
export class TrainerPseudoSubmissionsComponent implements OnInit {
  loading = false;
  toast = '';

  submissions: any[] = [];
  selectedSubmission: any = null;

  search = '';
  statusFilter: SubmissionFilter = 'ALL';
  sortBy: SubmissionSort = 'LATEST';

  page = 1;
  pageSize = 4;
  expandedStudents: Record<string, boolean> = {};
  studentSubmissionPages: Record<string, number> = {};
  studentSubmissionPageSize = 4;

  constructor(
    private service: PseudoChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  get filteredSubmissions(): any[] {
    const term = this.search.trim().toLowerCase();

    const list = this.submissions.filter((item) => {
      const status = item.status || 'FAIL';

      const text = [
        item.studentName,
        item.studentEmail,
        item.challengeTitle,
        item.problemStatement,
        item.batchId,
        item.companyName,
        item.challengeGroupTitle,
        item.language,
        status,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(term) && (this.statusFilter === 'ALL' || status === this.statusFilter);
    });

    return list.sort((a, b) => {
      if (this.sortBy === 'SCORE') {
        return Number(b.percentage || 0) - Number(a.percentage || 0);
      }

      if (this.sortBy === 'STUDENT') {
        return String(a.studentName || '').localeCompare(String(b.studentName || ''));
      }

      if (this.sortBy === 'CHALLENGE') {
        return String(a.challengeTitle || '').localeCompare(String(b.challengeTitle || ''));
      }

      return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
    });
  }

  get groupedByStudent(): StudentSubmissionGroup[] {
    const groups = new Map<string, StudentSubmissionGroup>();

    for (const item of this.filteredSubmissions) {
      const id = item.studentEmail || String(item.studentId || item.studentName || 'student');
      const existing = groups.get(id);

      if (existing) {
        existing.submissions.push(item);
        existing.passedCount += item.status === 'PASS' ? 1 : 0;
        existing.failedCount += item.status === 'FAIL' ? 1 : 0;
        existing.latestSubmittedAt = this.pickLatestDate(
          existing.latestSubmittedAt,
          item.submittedAt,
        );

        const total = existing.submissions.reduce(
          (sum, submission) => sum + Number(submission.percentage || 0),
          0,
        );
        existing.averageScore = Math.round(total / existing.submissions.length);
        continue;
      }

      groups.set(id, {
        id,
        studentName: item.studentName || 'Student',
        studentEmail: item.studentEmail || '',
        submissions: [item],
        passedCount: item.status === 'PASS' ? 1 : 0,
        failedCount: item.status === 'FAIL' ? 1 : 0,
        averageScore: Number(item.percentage || 0),
        latestSubmittedAt: item.submittedAt,
      });
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (this.sortBy === 'SCORE') return b.averageScore - a.averageScore;
      if (this.sortBy === 'STUDENT') return a.studentName.localeCompare(b.studentName);
      if (this.sortBy === 'CHALLENGE') {
        return b.submissions.length - a.submissions.length;
      }

      return (
        new Date(b.latestSubmittedAt || 0).getTime() - new Date(a.latestSubmittedAt || 0).getTime()
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.groupedByStudent.length / this.pageSize));
  }

  get pagedStudentGroups(): StudentSubmissionGroup[] {
    const start = (this.page - 1) * this.pageSize;
    return this.groupedByStudent.slice(start, start + this.pageSize);
  }

  get passedCount(): number {
    return this.submissions.filter((item) => item.status === 'PASS').length;
  }

  get failedCount(): number {
    return this.submissions.filter((item) => item.status === 'FAIL').length;
  }

  get averageScore(): number {
    if (!this.submissions.length) return 0;

    const total = this.submissions.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    return Math.round(total / this.submissions.length);
  }

  get uniqueStudents(): number {
    return new Set(this.submissions.map((item) => item.studentEmail || item.studentId)).size;
  }

  get hasPagination(): boolean {
    return this.groupedByStudent.length > this.pageSize;
  }

  get pageStart(): number {
    if (!this.groupedByStudent.length) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.page * this.pageSize, this.groupedByStudent.length);
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);

    for (let item = start; item <= end; item++) {
      pages.push(item);
    }

    return pages;
  }

  loadSubmissions(): void {
    this.loading = true;

    this.service.getTrainerSubmissions().subscribe({
      next: (res: any) => {
        this.submissions = res?.data || [];
        this.loading = false;
        this.page = 1;
        this.expandedStudents = {};
        this.studentSubmissionPages = {};
      },
      error: (error) => {
        console.error(error);
        this.submissions = [];
        this.loading = false;
        this.showToast('Unable to load submissions');
      },
    });
  }

  applyFilter(filter: SubmissionFilter): void {
    this.statusFilter = filter;
    this.page = 1;
  }

  changePage(nextPage: number): void {
    this.page = Math.min(Math.max(nextPage, 1), this.totalPages);
    this.expandedStudents = {};
    this.studentSubmissionPages = {};

    setTimeout(() => {
      document.querySelector('.submission-surface')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.expandedStudents = {};
  }

  isFilterActive(filter: SubmissionFilter): boolean {
    return this.statusFilter === filter;
  }

  openSubmission(item: any): void {
    this.selectedSubmission = item;
  }

  closeSubmission(): void {
    this.selectedSubmission = null;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trainer/pseudo-challenges']);
  }

  getScoreClass(item: any): string {
    if (item.status === 'PASS') return 'score-pass';
    return 'score-fail';
  }

  getStatusIcon(status: string): string {
    return status === 'PASS' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  }

  getPassedTests(item: any): number {
    return (item.testResults || []).filter((test: any) => test.status === 'PASS').length;
  }

  getFailedTests(item: any): number {
    return (item.testResults || []).filter((test: any) => test.status !== 'PASS').length;
  }

  get passRate(): number {
    if (!this.submissions.length) return 0;
    return Math.round((this.passedCount / this.submissions.length) * 100);
  }

  get needsReviewCount(): number {
    return this.failedCount;
  }

  get latestSubmission(): any | null {
    if (!this.submissions.length) return null;

    return [...this.submissions].sort(
      (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime(),
    )[0];
  }

  get latestSubmissionLabel(): string {
    if (!this.latestSubmission?.submittedAt) return 'No activity';
    return new Date(this.latestSubmission.submittedAt).toLocaleDateString();
  }

  get topPerformer(): StudentSubmissionGroup | null {
    if (!this.groupedByStudent.length) return null;

    return [...this.groupedByStudent].sort((a, b) => {
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return b.passedCount - a.passedCount;
    })[0];
  }

  get activeFilterLabel(): string {
    if (this.statusFilter === 'PASS') return 'Passed submissions';
    if (this.statusFilter === 'FAIL') return 'Needs review';
    return 'All submissions';
  }

  getStudentSubmissionPage(studentId: string): number {
    return this.studentSubmissionPages[studentId] || 1;
  }

  getStudentSubmissionTotalPages(group: StudentSubmissionGroup): number {
    return Math.max(1, Math.ceil(group.submissions.length / this.studentSubmissionPageSize));
  }

  getPagedStudentSubmissions(group: StudentSubmissionGroup): any[] {
    const page = this.getStudentSubmissionPage(group.id);
    const start = (page - 1) * this.studentSubmissionPageSize;

    return group.submissions.slice(start, start + this.studentSubmissionPageSize);
  }

  changeStudentSubmissionPage(group: StudentSubmissionGroup, nextPage: number): void {
    const totalPages = this.getStudentSubmissionTotalPages(group);
    this.studentSubmissionPages[group.id] = Math.min(Math.max(nextPage, 1), totalPages);
  }

  getStudentSubmissionPageStart(group: StudentSubmissionGroup): number {
    if (!group.submissions.length) return 0;
    return (this.getStudentSubmissionPage(group.id) - 1) * this.studentSubmissionPageSize + 1;
  }

  getStudentSubmissionPageEnd(group: StudentSubmissionGroup): number {
    return Math.min(
      this.getStudentSubmissionPage(group.id) * this.studentSubmissionPageSize,
      group.submissions.length,
    );
  }

  getTestPercentage(test: any): number {
    const marks = Number(test?.marks || test?.marksObtained || 0);
    const obtained = Number(test?.marksObtained || 0);

    if (!marks) {
      return test?.status === 'PASS' ? 100 : 0;
    }

    return Math.round((obtained / marks) * 100);
  }

  copySourceCode(item: any): void {
    const code = item?.sourceCode || '';

    if (!code.trim()) {
      this.showToast('No source code found');
      return;
    }

    navigator.clipboard
      ?.writeText(code)
      .then(() => this.showToast('Source code copied'))
      .catch(() => this.showToast('Unable to copy source code'));
  }

  trackByAttempt(_: number, item: any): number {
    return item.attemptId;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }

  toggleStudent(studentId: string): void {
    this.expandedStudents[studentId] = !this.expandedStudents[studentId];

    if (!this.studentSubmissionPages[studentId]) {
      this.studentSubmissionPages[studentId] = 1;
    }
  }

  openStudentPrimary(group: StudentSubmissionGroup): void {
    if (group.submissions[0]) {
      this.openSubmission(group.submissions[0]);
    }
  }

  trackByStudent(_: number, group: StudentSubmissionGroup): string {
    return group.id;
  }

  private pickLatestDate(a: any, b: any): any {
    if (!a) return b;
    if (!b) return a;

    return new Date(a).getTime() > new Date(b).getTime() ? a : b;
  }
}
