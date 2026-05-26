import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PseudoChallengeService } from '../../services/pseudo-challenge';

type StudentFilter = 'ALL' | 'NOT_ATTEMPTED' | 'PASS' | 'FAIL';

interface ChallengeGroup {
  id: string;
  title: string;
  companyName: string;
  batchId: number | string;
  challenges: any[];
  totalMarks: number;
  attemptCount: number;
  completedCount: number;
  passedCount: number;
  failedCount: number;
  pendingCount: number;
  latestSubmittedAt: any;
}

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
  search = '';
  statusFilter: StudentFilter = 'ALL';

  challenges: any[] = [];

  page = 1;
  pageSize = 6;
  expandedGroups: Record<string, boolean> = {};

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
      const text = [
        item.title,
        item.problemStatement,
        item.batchId,
        item.challengeGroupTitle,
        item.companyName,
        status,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(term) && (this.statusFilter === 'ALL' || status === this.statusFilter);
    });
  }

  get groupedChallenges(): ChallengeGroup[] {
    const groups = new Map<string, ChallengeGroup>();

    for (const item of this.filteredChallenges) {
      const status = this.resolveStatus(item);
      const id = item.challengeGroupId || `LEGACY-${item.id}`;
      const existing = groups.get(id);

      if (existing) {
        existing.challenges.push(item);
        existing.totalMarks += Number(item.totalMarks || 0);
        existing.attemptCount += Number(item.attemptCount || 0);
        existing.completedCount += status === 'PASS' || status === 'FAIL' ? 1 : 0;
        existing.passedCount += status === 'PASS' ? 1 : 0;
        existing.failedCount += status === 'FAIL' ? 1 : 0;
        existing.pendingCount += status === 'NOT_ATTEMPTED' ? 1 : 0;
        existing.latestSubmittedAt = existing.latestSubmittedAt || item.lastSubmittedAt;
        continue;
      }

      groups.set(id, {
        id,
        title: item.challengeGroupTitle || item.title || 'Challenge Group',
        companyName: item.companyName || 'General',
        batchId: item.batchId,
        challenges: [item],
        totalMarks: Number(item.totalMarks || 0),
        attemptCount: Number(item.attemptCount || 0),
        completedCount: status === 'PASS' || status === 'FAIL' ? 1 : 0,
        passedCount: status === 'PASS' ? 1 : 0,
        failedCount: status === 'FAIL' ? 1 : 0,
        pendingCount: status === 'NOT_ATTEMPTED' ? 1 : 0,
        latestSubmittedAt: item.lastSubmittedAt,
      });
    }

    return Array.from(groups.values());
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.groupedChallenges.length / this.pageSize));
  }

  get pagedGroups(): ChallengeGroup[] {
    const start = (this.page - 1) * this.pageSize;
    return this.groupedChallenges.slice(start, start + this.pageSize);
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
    if (!this.challenges.length) return 0;
    const total = this.challenges.reduce((sum, item) => sum + Number(item.lastScore || 0), 0);
    return Math.round(total / this.challenges.length);
  }

  loadChallenges(): void {
    this.loading = true;

    this.service.getStudentChallenges().subscribe({
      next: (res: any) => {
        this.challenges = res?.data || [];
        this.loading = false;
        this.page = 1;
      },
      error: (error) => {
        console.error(error);
        this.challenges = [];
        this.loading = false;
        this.showToast('Unable to load challenges');
      },
    });
  }

  applyMetricFilter(filter: StudentFilter): void {
    this.statusFilter = filter;
    this.page = 1;
  }

  changePage(nextPage: number): void {
    this.page = Math.min(Math.max(nextPage, 1), this.totalPages);
  }

  toggleGroup(groupId: string): void {
    this.expandedGroups[groupId] = !this.expandedGroups[groupId];
  }

  openChallenge(id: number): void {
    this.router.navigate(['/dashboard/student/pseudocode-lab', id]);
  }

  openGroupPrimary(group: ChallengeGroup): void {
    const pending = group.challenges.find((item) => this.resolveStatus(item) === 'NOT_ATTEMPTED');
    const failed = group.challenges.find((item) => this.resolveStatus(item) === 'FAIL');
    const first = pending || failed || group.challenges[0];

    if (first?.id) {
      this.openChallenge(first.id);
    }
  }

  trackByGroup(_: number, group: ChallengeGroup): string {
    return group.id;
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  resolveStatus(item: any): StudentFilter {
    return item?.status || 'NOT_ATTEMPTED';
  }

  getGroupStatusClass(group: ChallengeGroup): string {
    if (group.pendingCount > 0) return 'status-pending';
    if (group.failedCount > 0) return 'status-fail';
    return 'status-pass';
  }

  getGroupStatusLabel(group: ChallengeGroup): string {
    if (group.pendingCount > 0) return `${group.pendingCount} Pending`;
    if (group.failedCount > 0) return `${group.failedCount} Retry`;
    return 'Completed';
  }

  getActionLabel(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'View Result';
    if (status === 'FAIL') return 'Re-attempt';
    return 'Start Challenge';
  }

  getActionIcon(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'bi-eye-fill';
    if (status === 'FAIL') return 'bi-arrow-repeat';
    return 'bi-play-fill';
  }

  getActionClass(item: any): string {
    const status = this.resolveStatus(item);

    if (status === 'PASS') return 'action-view';
    if (status === 'FAIL') return 'action-retry';
    return 'action-start';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PASS':
        return 'status-pass';
      case 'FAIL':
        return 'status-fail';
      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PASS':
        return 'bi-check-circle-fill';
      case 'FAIL':
        return 'bi-x-circle-fill';
      default:
        return 'bi-clock-history';
    }
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2500);
  }
}
