import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminPublicPracticeService } from '../services/admin-public-practice';

type PublishType = 'ASSESSMENT' | 'CHALLENGE' | 'INTERVIEW';
type Tab = PublishType | 'ATTEMPTS' | 'POLICIES';
type StatusFilter = 'ALL' | 'PUBLISHED' | 'UNPUBLISHED';
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortMode = 'LATEST' | 'TITLE' | 'COMPANY' | 'SKILL' | 'TRAINER' | 'ATTEMPTS';
type ViewMode = 'GRID' | 'TABLE';
type AttemptTypeFilter = 'ALL' | 'ASSESSMENT' | 'CHALLENGE';
type BulkGroupMode = 'SELECTED' | 'COMPANY' | 'SKILL' | 'FILTERED';

type AccessPolicyCode =
  | 'PUBLIC_PREVIEW'
  | 'LEAD_REQUIRED'
  | 'ACCOUNT_REQUIRED'
  | 'BASIC_PLAN'
  | 'PRO_PLAN'
  | 'ELITE_PLAN'
  | 'ENROLLED_STUDENT_ONLY'
  | 'PAID_STUDENT_ONLY';

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

  activeTab: Tab = 'ASSESSMENT';
  viewMode: ViewMode = 'GRID';

  assessments: any[] = [];
  challenges: any[] = [];
  interviewQuestions: any[] = [];
  assessmentAttempts: any[] = [];
  challengeAttempts: any[] = [];
  accessPolicies: any[] = [];

  search = '';
  statusFilter: StatusFilter = 'ALL';
  activeFilter: ActiveFilter = 'ALL';
  companyFilter = 'ALL';
  skillFilter = 'ALL';
  sortMode: SortMode = 'LATEST';
  page = 1;
  pageSize = 9;

  attemptSearch = '';
  attemptTypeFilter: AttemptTypeFilter = 'ALL';
  attemptStatusFilter: 'ALL' | 'PASS' | 'FAIL' = 'ALL';
  attemptPage = 1;
  attemptPageSize = 9;

  selectedItem: any = null;
  selectedType: PublishType = 'ASSESSMENT';
  selectedAttempt: any = null;

  showPublishDrawer = false;
  showBulkDrawer = false;
  publishErrors: string[] = [];

  bulkMode: BulkGroupMode = 'SELECTED';
  bulkTitle = '';
  bulkIds: number[] = [];
  selectedCandidateKeys = new Set<string>();

  publishForm = {
    companyName: 'General',
    skill: 'Placement Readiness',
    accessLevel: 'LEAD_REQUIRED',
    accessLevels: ['LEAD_REQUIRED'] as AccessPolicyCode[],
    attemptLimit: 1,
  };

  accessPolicyOptions: Array<{
    value: AccessPolicyCode;
    label: string;
    tier: string;
    tone: string;
    description: string;
    recommendedAttemptLimit: number;
    features: string[];
  }> = [
    {
      value: 'PUBLIC_PREVIEW',
      label: 'Public Preview',
      tier: 'Guest',
      tone: 'public',
      description: 'Anyone can view a preview. Best for marketing and discovery.',
      recommendedAttemptLimit: 1,
      features: ['Open preview', 'Low-friction discovery', 'Good for lead generation'],
    },
    {
      value: 'LEAD_REQUIRED',
      label: 'Lead Required',
      tier: 'Lead',
      tone: 'lead',
      description: 'User must submit lead details before attempting.',
      recommendedAttemptLimit: 1,
      features: [
        'Captures lead data',
        'Recommended for free campaigns',
        'Limits anonymous attempts',
      ],
    },
    {
      value: 'ACCOUNT_REQUIRED',
      label: 'Free User',
      tier: 'Free',
      tone: 'free',
      description: 'Only logged-in free users can attempt.',
      recommendedAttemptLimit: 1,
      features: ['Requires login', 'Free user access', 'Tracks user activity'],
    },
    {
      value: 'BASIC_PLAN',
      label: 'Basic Plan',
      tier: 'Basic',
      tone: 'basic',
      description: 'Basic, Pro, and Elite users can access this practice.',
      recommendedAttemptLimit: 2,
      features: [
        'Basic users allowed',
        'Pro and Elite included',
        'Good for starter premium content',
      ],
    },
    {
      value: 'PRO_PLAN',
      label: 'Pro Plan',
      tier: 'Pro',
      tone: 'pro',
      description: 'Only Pro and Elite users can access this premium practice.',
      recommendedAttemptLimit: 3,
      features: ['Pro users allowed', 'Elite included', 'Best for paid course buyers'],
    },
    {
      value: 'ELITE_PLAN',
      label: 'Elite Plan',
      tier: 'Elite',
      tone: 'elite',
      description: 'Only Elite users can access this high-value content.',
      recommendedAttemptLimit: 5,
      features: ['Elite-only access', 'Highest value content', 'Best for advanced challenges'],
    },
    {
      value: 'ENROLLED_STUDENT_ONLY',
      label: 'Enrolled Student',
      tier: 'Course',
      tone: 'course',
      description: 'Only users enrolled in a course can access.',
      recommendedAttemptLimit: 2,
      features: ['Course enrollment required', 'Useful for LMS practice', 'Student-only tracking'],
    },
    {
      value: 'PAID_STUDENT_ONLY',
      label: 'Paid Student',
      tier: 'Legacy Paid',
      tone: 'paid',
      description: 'Legacy paid-student access. Prefer Basic, Pro, or Elite for new content.',
      recommendedAttemptLimit: 3,
      features: ['Backward compatible', 'Paid users only', 'Use plan policies for new items'],
    },
  ];

  constructor(private service: AdminPublicPracticeService) {}

  get resolvedPolicyCatalog(): any[] {
    const apiPolicies = Array.isArray(this.accessPolicies) ? this.accessPolicies : [];

    const apiMap = new Map(
      apiPolicies.map((policy: any) => [
        String(policy?.value || policy?.code || '').toUpperCase(),
        policy,
      ]),
    );

    return this.accessPolicyOptions.map((policy) => {
      const apiPolicy = apiMap.get(policy.value);

      return {
        ...policy,
        description: apiPolicy?.description || policy.description,
      };
    });
  }

  normalizeAccessLevel(value: any): AccessPolicyCode {
    const code = String(value || '')
      .trim()
      .toUpperCase();

    if (code.includes('ELITE')) return 'ELITE_PLAN';
    if (code.includes('PRO')) return 'PRO_PLAN';
    if (code.includes('BASIC') || code.includes('STARTER')) {
      return 'BASIC_PLAN';
    }

    const allowed = this.accessPolicyOptions.some((policy) => policy.value === code);

    return allowed ? (code as AccessPolicyCode) : 'LEAD_REQUIRED';
  }

  policyMeta(value: any) {
    const code = this.normalizeAccessLevel(value);

    return (
      this.accessPolicyOptions.find((policy) => policy.value === code) ||
      this.accessPolicyOptions[1]
    );
  }

  policyLabel(value: any): string {
    return this.policyMeta(value).label;
  }

  policyDescription(value: any): string {
    return this.policyMeta(value).description;
  }

  policyTier(value: any): string {
    return this.policyMeta(value).tier;
  }

  policyClass(value: any): string {
    return `policy-${this.policyMeta(value).tone}`;
  }

  onAccessPolicyChange(): void {
    const selected = this.publishForm.accessLevels?.length
      ? this.publishForm.accessLevels
      : [this.publishForm.accessLevel || 'LEAD_REQUIRED'];

    this.publishForm.accessLevels = selected.map((value) => this.normalizeAccessLevel(value));
    this.publishForm.accessLevel = this.publishForm.accessLevels[0];

    const policy = this.policyMeta(this.publishForm.accessLevel);

    if (!this.publishForm.attemptLimit || this.publishForm.attemptLimit < 1) {
      this.publishForm.attemptLimit = policy.recommendedAttemptLimit;
    }
  }

  isAccessPolicySelected(value: AccessPolicyCode): boolean {
    return (this.publishForm.accessLevels || []).includes(value);
  }

  toggleAccessPolicy(value: AccessPolicyCode): void {
    const selected = new Set(this.publishForm.accessLevels || []);

    selected.has(value) ? selected.delete(value) : selected.add(value);

    if (!selected.size) {
      selected.add('LEAD_REQUIRED');
    }

    this.publishForm.accessLevels = Array.from(selected);
    this.publishForm.accessLevel = this.publishForm.accessLevels[0];
    this.onAccessPolicyChange();
  }

  accessPolicySummary(): string {
    return (this.publishForm.accessLevels || []).map((value) => this.policyLabel(value)).join(', ');
  }

  previewItem(item: any, event?: Event): void {
    event?.stopPropagation();

    this.showPublishDrawer = false;
    this.showBulkDrawer = false;
    this.selectedAttempt = null;

    this.selectedItem = item;
    this.selectedType = this.toPublishType(item);
  }

  closePreview(): void {
    this.selectedItem = null;
  }

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
        this.interviewQuestions = candidateData.interviewQuestions || [];
        this.assessmentAttempts = attemptData.assessmentAttempts || [];
        this.challengeAttempts = attemptData.challengeAttempts || [];
        this.accessPolicies = policies?.data || [];

        this.loading = false;
        this.page = Math.min(this.page, this.totalPages);
        this.attemptPage = Math.min(this.attemptPage, this.attemptTotalPages);
        this.pruneSelection();
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

  get currentPublishType(): PublishType {
    if (this.activeTab === 'INTERVIEW') return 'INTERVIEW';
    if (this.activeTab === 'CHALLENGE') return 'CHALLENGE';
    return 'ASSESSMENT';
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.page = 1;
    this.attemptPage = 1;
    this.closeDetails();
    this.closeAttempt();
    this.closeBulk();
    this.pruneSelection();
  }

  quickFilter(tab: PublishType, status: StatusFilter): void {
    this.activeTab = tab;
    this.statusFilter = status;
    this.page = 1;
    this.pruneSelection();
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

  toPublishType(item?: any): PublishType {
    const itemType = String(item?.type || '').toUpperCase();
    if (itemType === 'ASSESSMENT') return 'ASSESSMENT';
    if (itemType === 'CHALLENGE') return 'CHALLENGE';
    if (itemType === 'INTERVIEW') return 'INTERVIEW';
    return this.currentPublishType;
  }

  get companyOptions(): string[] {
    return this.unique(this.rawCandidates.map((item) => this.displayCompany(item)));
  }

  get skillOptions(): string[] {
    return this.unique(this.rawCandidates.map((item) => this.displaySkill(item)));
  }

  get filteredCandidates(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.rawCandidates
      .filter((item) => {
        const status = item.publicVisible ? 'PUBLISHED' : 'UNPUBLISHED';
        const active = item.active ? 'ACTIVE' : 'INACTIVE';
        const company = this.displayCompany(item);
        const skill = this.displaySkill(item);
        const searchable = [
          this.displayTitle(item),
          this.displayDescription(item),
          company,
          skill,
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
          (this.activeFilter === 'ALL' || this.activeFilter === active) &&
          (this.companyFilter === 'ALL' || company === this.companyFilter) &&
          (this.skillFilter === 'ALL' || skill === this.skillFilter)
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

  get selectedCurrentItems(): any[] {
    return this.rawCandidates.filter((item) => this.isSelected(item));
  }

  get unpublishedFilteredItems(): any[] {
    return this.filteredCandidates.filter((item) => item.active && !item.publicVisible);
  }

  get selectedCount(): number {
    return this.selectedCurrentItems.length;
  }

  get selectedPublishedCount(): number {
    return this.selectedCurrentItems.filter((item) => item.publicVisible).length;
  }

  get pageAllSelected(): boolean {
    return (
      this.pagedCandidates.length > 0 && this.pagedCandidates.every((item) => this.isSelected(item))
    );
  }

  get publishedAssessments(): number {
    return this.assessments.filter((x) => x.publicVisible).length;
  }

  get publishedChallenges(): number {
    return this.challenges.filter((x) => x.publicVisible).length;
  }

  get publishedInterviewQuestions(): number {
    return this.interviewQuestions.filter((x) => x.publicVisible).length;
  }

  get totalCandidates(): number {
    return this.assessments.length + this.challenges.length + this.interviewQuestions.length;
  }

  get totalPublished(): number {
    return this.publishedAssessments + this.publishedChallenges + this.publishedInterviewQuestions;
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

  get bulkGroupsByCompany(): any[] {
    return this.buildGroups('company');
  }

  get bulkGroupsBySkill(): any[] {
    return this.buildGroups('skill');
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

  candidateKey(item: any): string {
    return `${this.toPublishType(item)}:${item?.id}`;
  }

  isSelected(item: any): boolean {
    return this.selectedCandidateKeys.has(this.candidateKey(item));
  }

  toggleCandidate(item: any, event?: Event): void {
    event?.stopPropagation();
    const key = this.candidateKey(item);
    this.selectedCandidateKeys.has(key)
      ? this.selectedCandidateKeys.delete(key)
      : this.selectedCandidateKeys.add(key);
  }

  togglePageSelection(): void {
    const allSelected = this.pageAllSelected;
    this.pagedCandidates.forEach((item) => {
      const key = this.candidateKey(item);
      allSelected ? this.selectedCandidateKeys.delete(key) : this.selectedCandidateKeys.add(key);
    });
  }

  clearSelection(): void {
    this.selectedCandidateKeys.clear();
  }

  openDetails(item: any, type: PublishType): void {
    this.selectedItem = item;
    this.selectedType = type;
  }

  closeDetails(): void {
    if (!this.showPublishDrawer && !this.showBulkDrawer) this.selectedItem = null;
  }

  openPublish(item: any, type: PublishType): void {
    this.selectedItem = item;
    this.selectedType = type;
    this.publishErrors = [];

    const accessLevel = this.normalizeAccessLevel(item.publicAccessLevel || 'LEAD_REQUIRED');

    this.publishForm = {
      companyName: this.displayCompany(item),
      skill: this.displaySkill(item) || this.defaultSkill(),
      accessLevel,
      accessLevels: [accessLevel],
      attemptLimit: Number(item.publicAttemptLimit || 1),
    };

    this.showPublishDrawer = true;
  }

  closePublish(): void {
    if (this.saving) return;
    this.showPublishDrawer = false;
    this.publishErrors = [];
  }

  publish(): void {
    if (!this.validatePublish()) return;

    this.saving = true;
    const payload = this.publishPayload();
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
    if (!confirm(`Unpublish "${this.displayTitle(item)}" from public catalog?`)) return;

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

  openBulkPublish(mode: BulkGroupMode, items: any[], title: string): void {
    const publishableItems = items.filter((item) => item.active && !item.publicVisible);

    if (!publishableItems.length) {
      this.showToast('No unpublished active items in this group');
      return;
    }

    const first = publishableItems[0];
    const sameCompany = publishableItems.every(
      (item) =>
        this.displayCompany(item).toLowerCase() === this.displayCompany(first).toLowerCase(),
    );
    const sameSkill = publishableItems.every(
      (item) => this.displaySkill(item).toLowerCase() === this.displaySkill(first).toLowerCase(),
    );

    this.bulkMode = mode;
    this.bulkTitle = title;
    this.bulkIds = publishableItems.map((item) => Number(item.id));
    this.publishErrors = [];
    const accessLevel = this.normalizeAccessLevel(first.publicAccessLevel || 'LEAD_REQUIRED');

    this.publishForm = {
      companyName: sameCompany ? this.displayCompany(first) : 'General',
      skill: this.defaultSkill(),
      accessLevel,
      accessLevels: [accessLevel],
      attemptLimit: Number(first.publicAttemptLimit || 1),
    };

    this.showBulkDrawer = true;
  }

  closeBulk(): void {
    if (this.saving) return;
    this.showBulkDrawer = false;
    this.bulkIds = [];
    this.bulkTitle = '';
    this.publishErrors = [];
  }

  bulkPublish(): void {
    if (!this.validateBulkPublish()) return;

    this.saving = true;

    this.service
      .bulkPublish({
        type: this.currentPublishType,
        ids: this.bulkIds,
        ...this.publishPayload(),
      })
      .subscribe({
        next: (res: any) => {
          const data = res?.data || {};
          this.saving = false;
          this.showBulkDrawer = false;
          this.clearSelection();
          this.showToast(
            `Published ${data.updated || this.bulkIds.length} items${
              data.skippedInactive ? `, skipped ${data.skippedInactive} inactive` : ''
            }`,
          );
          this.loadDashboard();
        },
        error: (err) => {
          this.saving = false;
          this.showToast(err?.error?.message || 'Unable to bulk publish items');
        },
      });
  }

  bulkUnpublishSelected(): void {
    const publishedItems = this.selectedCurrentItems.filter((item) => item.publicVisible);

    if (!publishedItems.length) {
      this.showToast('Select published items to unpublish');
      return;
    }

    if (!confirm(`Unpublish ${publishedItems.length} selected public items?`)) return;

    this.saving = true;

    this.service
      .bulkUnpublish({
        type: this.currentPublishType,
        ids: publishedItems.map((item) => item.id),
      })
      .subscribe({
        next: (res: any) => {
          const data = res?.data || {};
          this.saving = false;
          this.clearSelection();
          this.showToast(`Unpublished ${data.updated || publishedItems.length} items`);
          this.loadDashboard();
        },
        error: (err) => {
          this.saving = false;
          this.showToast(err?.error?.message || 'Unable to bulk unpublish items');
        },
      });
  }

  validatePublish(): boolean {
    this.publishErrors = [];

    if (!this.selectedItem) this.publishErrors.push('Please select an item');
    if (!this.selectedItem?.active) this.publishErrors.push('Inactive items cannot be published');
    return this.validateCommonPublishFields();
  }

  validateBulkPublish(): boolean {
    this.publishErrors = [];

    if (!this.bulkIds.length) this.publishErrors.push('Please select at least one item');
    return this.validateCommonPublishFields();
  }

  resetFilters(): void {
    this.search = '';
    this.statusFilter = 'ALL';
    this.activeFilter = 'ALL';
    this.companyFilter = 'ALL';
    this.skillFilter = 'ALL';
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

  copyCode(code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(
      () => this.showToast('Source code copied to clipboard!'),
      () => this.showToast('Failed to copy source code')
    );
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  trackByGroup(_: number, group: any): string {
    return group.name;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }

  private publishPayload(): any {
    const accessLevels = (
      this.publishForm.accessLevels?.length
        ? this.publishForm.accessLevels
        : [this.publishForm.accessLevel || 'LEAD_REQUIRED']
    ).map((value) => this.normalizeAccessLevel(value));

    return {
      companyName: String(this.publishForm.companyName || 'General').trim(),
      skill: String(this.publishForm.skill || this.defaultSkill()).trim(),
      accessLevel: accessLevels[0],
      accessLevels,
      attemptLimit: Number(this.publishForm.attemptLimit || 1),
    };
  }

  private validateCommonPublishFields(): boolean {
    if (!this.publishForm.companyName.trim()) this.publishErrors.push('Company is required');

    const accessLevels = this.publishForm.accessLevels?.length
      ? this.publishForm.accessLevels
      : [this.publishForm.accessLevel];

    const validPolicies = accessLevels.every((value) =>
      this.accessPolicyOptions.some((policy) => policy.value === this.normalizeAccessLevel(value)),
    );

    if (!validPolicies) {
      this.showToast('Select a valid access policy');
      return false;
    }

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

  private sortCandidate(a: any, b: any): number {
    if (this.sortMode === 'TITLE') return this.displayTitle(a).localeCompare(this.displayTitle(b));
    if (this.sortMode === 'COMPANY')
      return this.displayCompany(a).localeCompare(this.displayCompany(b));
    if (this.sortMode === 'SKILL') return this.displaySkill(a).localeCompare(this.displaySkill(b));
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

  private buildGroups(key: 'company' | 'skill'): any[] {
    const groups = new Map<string, any[]>();

    this.rawCandidates.forEach((item) => {
      const value = key === 'company' ? this.displayCompany(item) : this.displaySkill(item);
      const groupName =
        value && value !== '-' ? value : key === 'company' ? 'General' : 'Unassigned';
      groups.set(groupName, [...(groups.get(groupName) || []), item]);
    });

    return Array.from(groups.entries())
      .map(([name, items]) => ({
        name,
        items,
        total: items.length,
        published: items.filter((item) => item.publicVisible).length,
        unpublished: items.filter((item) => item.active && !item.publicVisible).length,
      }))
      .sort((a, b) => b.unpublished - a.unpublished || a.name.localeCompare(b.name))
      .slice(0, 10);
  }

  private pruneSelection(): void {
    const validKeys = new Set(this.rawCandidates.map((item) => this.candidateKey(item)));
    Array.from(this.selectedCandidateKeys).forEach((key) => {
      if (!validKeys.has(key)) this.selectedCandidateKeys.delete(key);
    });
  }

  private defaultSkill(): string {
    if (this.currentPublishType === 'ASSESSMENT') return 'Placement Readiness';
    if (this.currentPublishType === 'CHALLENGE') return 'Coding';
    return 'Interview Preparation';
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  private windowPages(current: number, total: number): number[] {
    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private range(page: number, size: number, total: number): string {
    if (!total) return '0 of 0';
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, total);
    return `${start}-${end} of ${total}`;
  }
}
