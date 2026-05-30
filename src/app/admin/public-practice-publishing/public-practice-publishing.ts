import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminPublicPracticeService } from '../services/admin-public-practice';

type PublishType = 'ASSESSMENT' | 'CHALLENGE' | 'INTERVIEW';
type Tab = PublishType | 'ATTEMPTS' | 'POLICIES';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'UNPUBLISHED';
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortMode = 'LATEST' | 'TITLE' | 'COMPANY' | 'TRAINER' | 'ATTEMPTS';
type ViewMode = 'GRID' | 'TABLE';
type AttemptTypeFilter = 'ALL' | 'ASSESSMENT' | 'CHALLENGE';

@Component({
  selector: 'app-admin-public-practice-publishing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-practice-publishing.html',
  styleUrls: ['./public-practice-publishing.css'],
})
export class AdminPublicPracticePublishingComponent implements OnInit {
  loading = false;
  saving = false;
  toast = '';

  viewMode: ViewMode = 'GRID';

  assessments: any[] = [];
  challenges: any[] = [];
  assessmentAttempts: any[] = [];
  challengeAttempts: any[] = [];
  interviewQuestions: any[] = [];
  accessPolicies: any[] = [];

  search = '';
  statusFilter: StatusFilter = 'ALL';
  activeFilter: ActiveFilter = 'ALL';
  sortMode: SortMode = 'LATEST';
  page = 1;
  pageSize = 9;

  attemptSearch = '';
  attemptStatusFilter: 'ALL' | 'PASS' | 'FAIL' = 'ALL';
  attemptPage = 1;
  attemptPageSize = 9;
  selectedItem: any = null;
  activeTab: Tab = 'ASSESSMENT';
  selectedType: PublishType = 'ASSESSMENT';
  attemptTypeFilter: AttemptTypeFilter = 'ALL';
  selectedAttempt: any = null;

  showPublishDrawer = false;
  publishErrors: string[] = [];

  publishForm = {
    companyName: 'General',
    skill: 'Placement Readiness',
    accessLevel: 'LEAD_REQUIRED',
    attemptLimit: 1,
  };

  constructor(private service: AdminPublicPracticeService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    forkJoin({
      candidates: this.service.getCandidates(),
      attempts: this.service.getAttempts(),
      policies: this.service.getAccessPolicies(),
    }).subscribe({
      next: ({ candidates, attempts, policies }: any) => {
        const candidateData = candidates?.data || {};
        const attemptData = attempts?.data || {};

        this.assessments = candidateData.assessments || [];
        this.challenges = candidateData.challenges || [];
        this.assessmentAttempts = attemptData.assessmentAttempts || [];
        this.challengeAttempts = attemptData.challengeAttempts || [];
        this.interviewQuestions = candidateData.interviewQuestions || [];
        this.accessPolicies = policies?.data || [];

        this.loading = false;
        this.page = Math.min(this.page, this.totalPages);
        this.attemptPage = Math.min(this.attemptPage, this.attemptTotalPages);
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Unable to load public practice dashboard');
      },
    });
  }

  get rawCandidates(): any[] {
    if (this.activeTab === 'ASSESSMENT') return this.assessments;
    if (this.activeTab === 'CHALLENGE') return this.challenges;
    if (this.activeTab === 'INTERVIEW') return this.interviewQuestions;
    return [];
  }

  get activeItems(): any[] {
    return this.rawCandidates;
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.page = 1;
    this.attemptPage = 1;
    this.closeDetails();
    this.closeAttempt();
  }

  quickFilter(tab: PublishType, status: StatusFilter): void {
    this.activeTab = tab;
    this.statusFilter = status;
    this.page = 1;
  }

  get currentPublishType(): PublishType {
    return this.activeTab === 'INTERVIEW'
      ? 'INTERVIEW'
      : this.activeTab === 'CHALLENGE'
        ? 'CHALLENGE'
        : 'ASSESSMENT';
  }

  displayTitle(item: any): string {
    return item?.title || item?.question || `Interview Question #${item?.id || ''}`;
  }

  displayDescription(item: any): string {
    return item?.description || item?.answer || 'No description added yet.';
  }

  displayCompany(item: any): string {
    return item?.companyName || item?.company || 'General';
  }

  displaySkill(item: any): string {
    return item?.skill || item?.role || item?.topic || '-';
  }

  openDetails(item: any, type: PublishType): void {
    this.selectedItem = item;
    this.selectedType = type;
  }

  openPublish(item: any, type: PublishType): void {
    this.selectedItem = item;
    this.selectedType = type;
    this.publishErrors = [];

    this.publishForm = {
      companyName: item.companyName || item.company || 'General',
      skill:
        item.skill ||
        item.role ||
        item.topic ||
        (type === 'ASSESSMENT'
          ? 'Placement Readiness'
          : type === 'CHALLENGE'
            ? 'Coding'
            : 'Interview Preparation'),
      accessLevel: item.publicAccessLevel || 'LEAD_REQUIRED',
      attemptLimit: Number(item.publicAttemptLimit || 1),
    };

    this.showPublishDrawer = true;
  }

  get filteredCandidates(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.rawCandidates
      .filter((item) => {
        const status = item.publicVisible ? 'PUBLISHED' : 'UNPUBLISHED';
        const active = item.active ? 'ACTIVE' : 'INACTIVE';
        const searchable = [
          item.title,
          item.description,
          item.companyName,
          item.skill,
          item.trainerName,
          item.trainerEmail,
          item.batchName,
          item.batchId,
          item.courseName,
          item.publicAccessLevel,
        ]
          .join(' ')
          .toLowerCase();

        return (
          (!term || searchable.includes(term)) &&
          (this.statusFilter === 'ALL' || this.statusFilter === status) &&
          (this.activeFilter === 'ALL' || this.activeFilter === active)
        );
      })
      .sort((a, b) => this.sortCandidate(a, b));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCandidates.length / this.pageSize));
  }

  get pagedCandidates(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCandidates.slice(start, start + this.pageSize);
  }

  get allAttempts(): any[] {
    return [...this.assessmentAttempts, ...this.challengeAttempts].sort(
      (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime(),
    );
  }

  get filteredAttempts(): any[] {
    const term = this.attemptSearch.trim().toLowerCase();

    return this.allAttempts.filter((attempt) => {
      const searchable = [
        attempt.type,
        attempt.practiceTitle,
        attempt.companyName,
        attempt.skill,
        attempt.leadName,
        attempt.leadPhone,
        attempt.leadEmail,
        attempt.status,
        attempt.language,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (this.attemptTypeFilter === 'ALL' || attempt.type === this.attemptTypeFilter) &&
        (this.attemptStatusFilter === 'ALL' || attempt.status === this.attemptStatusFilter)
      );
    });
  }

  get attemptTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAttempts.length / this.attemptPageSize));
  }

  get pagedAttempts(): any[] {
    const start = (this.attemptPage - 1) * this.attemptPageSize;
    return this.filteredAttempts.slice(start, start + this.attemptPageSize);
  }

  get publishedAssessments(): number {
    return this.assessments.filter((x) => x.publicVisible).length;
  }

  get publishedChallenges(): number {
    return this.challenges.filter((x) => x.publicVisible).length;
  }

  get totalAttempts(): number {
    return this.assessmentAttempts.length + this.challengeAttempts.length;
  }

  get passRate(): number {
    if (!this.allAttempts.length) return 0;
    return Math.round(
      (this.allAttempts.filter((x) => x.status === 'PASS').length / this.allAttempts.length) * 100,
    );
  }

  toPublishType(item?: any): PublishType {
    const itemType = String(item?.type || '').toUpperCase();

    if (itemType === 'ASSESSMENT') return 'ASSESSMENT';
    if (itemType === 'CHALLENGE') return 'CHALLENGE';
    if (itemType === 'INTERVIEW') return 'INTERVIEW';

    if (this.activeTab === 'ASSESSMENT') return 'ASSESSMENT';
    if (this.activeTab === 'CHALLENGE') return 'CHALLENGE';
    if (this.activeTab === 'INTERVIEW') return 'INTERVIEW';

    return 'ASSESSMENT';
  }

  closeDetails(): void {
    if (!this.showPublishDrawer) this.selectedItem = null;
  }

  closePublish(): void {
    if (this.saving) return;

    this.showPublishDrawer = false;
    this.publishErrors = [];
  }

  publish(): void {
    if (!this.validatePublish()) return;

    this.saving = true;

    const payload = {
      companyName: (this.publishForm.companyName || 'General').trim(),
      skill: (this.publishForm.skill || 'Coding').trim(),
      accessLevel: this.publishForm.accessLevel || 'LEAD_REQUIRED',
      attemptLimit: Math.max(1, Number(this.publishForm.attemptLimit || 1)),
    };

    const type = this.toPublishType(this.selectedItem);

    const request =
      type === 'ASSESSMENT'
        ? this.service.publishAssessment(this.selectedItem.id, payload)
        : type === 'CHALLENGE'
          ? this.service.publishChallenge(this.selectedItem.id, payload)
          : this.service.publishInterviewQuestion(this.selectedItem.id, payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showPublishDrawer = false;
        this.selectedItem = null;
        this.publishErrors = [];

        this.showToast('Published successfully');
        this.loadDashboard();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || err?.error?.error || 'Unable to publish item');
      },
    });
  }

  unpublish(item: any, type: PublishType): void {
    if (!confirm(`Unpublish "${item.title}" from public catalog?`)) return;

    this.saving = true;

    const request =
      type === 'ASSESSMENT'
        ? this.service.unpublishAssessment(item.id)
        : type === 'CHALLENGE'
          ? this.service.unpublishChallenge(item.id)
          : this.service.unpublishInterviewQuestion(item.id);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showToast('Item unpublished successfully');
        this.loadDashboard();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Unable to unpublish item');
      },
    });
  }

  validatePublish(): boolean {
    this.publishErrors = [];

    if (!this.selectedItem) this.publishErrors.push('Please select an item');
    if (!this.selectedItem?.active) this.publishErrors.push('Inactive items cannot be published');
    if (!this.publishForm.companyName.trim()) this.publishErrors.push('Company is required');
    if (!this.publishForm.skill.trim()) this.publishErrors.push('Skill is required');
    if (!this.publishForm.accessLevel) this.publishErrors.push('Access policy is required');

    const limit = Number(this.publishForm.attemptLimit);
    if (!Number.isInteger(limit) || limit < 1) {
      this.publishErrors.push('Attempt limit must be a whole number greater than 0');
    }

    if (this.publishErrors.length) {
      this.showToast(this.publishErrors[0]);
      return false;
    }

    return true;
  }

  resetFilters(): void {
    this.search = '';
    this.statusFilter = 'ALL';
    this.activeFilter = 'ALL';
    this.sortMode = 'LATEST';
    this.page = 1;
  }

  resetAttemptFilters(): void {
    this.attemptSearch = '';
    this.attemptTypeFilter = 'ALL';
    this.attemptStatusFilter = 'ALL';
    this.attemptPage = 1;
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(page, 1), this.totalPages);
  }

  setAttemptPage(page: number): void {
    this.attemptPage = Math.min(Math.max(page, 1), this.attemptTotalPages);
  }

  pages(): number[] {
    return this.windowPages(this.page, this.totalPages);
  }

  attemptPages(): number[] {
    return this.windowPages(this.attemptPage, this.attemptTotalPages);
  }

  rangeLabel(): string {
    return this.range(this.page, this.pageSize, this.filteredCandidates.length);
  }

  attemptRangeLabel(): string {
    return this.range(this.attemptPage, this.attemptPageSize, this.filteredAttempts.length);
  }

  viewAttempt(attempt: any): void {
    this.selectedAttempt = attempt;
  }

  closeAttempt(): void {
    this.selectedAttempt = null;
  }

  trackById(_: number, item: any): number {
    return item.id;
  }
  private sortCandidate(a: any, b: any): number {
    if (this.sortMode === 'TITLE') {
      return this.displayTitle(a).localeCompare(this.displayTitle(b));
    }

    if (this.sortMode === 'COMPANY') {
      return this.displayCompany(a).localeCompare(this.displayCompany(b));
    }

    if (this.sortMode === 'TRAINER') {
      return String(a.trainerName || a.trainerEmail || '').localeCompare(
        String(b.trainerName || b.trainerEmail || ''),
      );
    }

    if (this.sortMode === 'ATTEMPTS') {
      return Number(b.publicAttemptCount || 0) - Number(a.publicAttemptCount || 0);
    }

    return Number(b.id || 0) - Number(a.id || 0);
  }

  private windowPages(current: number, total: number): number[] {
    const start = Math.max(1, Math.min(current - 2, total - 4));
    const actualStart = Math.max(1, start);
    const end = Math.min(total, actualStart + 4);
    return Array.from({ length: end - actualStart + 1 }, (_, i) => actualStart + i);
  }

  private range(page: number, size: number, total: number): string {
    if (!total) return '0 of 0';
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, total);
    return `${start}-${end} of ${total}`;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
