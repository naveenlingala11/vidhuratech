import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PseudoChallengeService } from '../../services/pseudo-challenge';
import { Router } from '@angular/router';
import { TrainerBatchLookupService } from '../../services/trainer-batch-lookup.service';

type RuleType = 'REQUIRED_KEYWORD' | 'FORBIDDEN_KEYWORD' | 'MIN_LINES';
type ChallengeFilter = 'ALL' | 'ACTIVE' | 'DRAFT' | 'CLOSED';
type SortOption = 'LATEST' | 'TITLE' | 'ATTEMPTS' | 'MARKS';
type LibraryView = 'GROUPS' | 'COMPANIES';
type WorkspaceTab = 'BUILDER' | 'LIBRARY';

interface ChallengeRule {
  type: RuleType;
  value: string;
  marks: number;
}

interface ChallengeTestCase {
  inputData: string;
  expectedOutput: string;
  marks: number;
  hidden?: boolean;
}

interface ChallengeForm {
  batchId: string;
  companyName: string;
  challengeGroupTitle: string;
  title: string;
  problemStatement: string;
  constraintsText: string;
  inputFormat: string;
  outputFormat: string;
  durationMinutes: number;
  totalMarks: number;
  passPercentage: number;
  rules: ChallengeRule[];
  testCases: ChallengeTestCase[];
  skill: string;
  hintText: string;
  askedYear?: number;
}

interface ChallengeGroup {
  id: string;
  title: string;
  companyName: string;
  batchId: number | string;
  challenges: any[];
  totalMarks: number;
  attemptCount: number;
  testCasesCount: number;
  rulesCount: number;
  activeCount: number;
  closedCount: number;
  latestCreatedAt: any;
}

interface CompanyGroup {
  id: string;
  name: string;
  groups: ChallengeGroup[];
  challengeCount: number;
  totalMarks: number;
  attemptCount: number;
  activeCount: number;
  latestCreatedAt: any;
}

@Component({
  selector: 'app-trainer-pseudo-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-pseudo-challenges.html',
  styleUrls: ['./trainer-pseudo-challenges.css'],
})
export class TrainerPseudoChallengesComponent implements OnInit {
  loading = false;
  saving = false;
  previewLoading = false;

  toast = '';
  search = '';
  statusFilter: ChallengeFilter = 'ALL';
  sortBy: SortOption = 'LATEST';

  showJsonImporter = false;
  jsonChallengeText = '';
  editingChallengeId: number | null = null;

  challenges: any[] = [];
  selectedChallenge: any = null;
  selectedGroup: ChallengeGroup | null = null;
  draftPreview: any = null;
  attempts: any[] = [];
  trainerBatches: any[] = [];
  batchLoading = false;

  page = 1;
  pageSize = 6;
  expandedGroups: Record<string, boolean> = {};

  form: ChallengeForm = this.getEmptyForm();

  libraryView: LibraryView = 'GROUPS';
  expandedCompanies: Record<string, boolean> = {};

  showEditGroupModal = false;
  groupEditForm = {
    groupId: '',
    title: '',
    companyName: ''
  };

  activeWorkspaceTab: WorkspaceTab = 'BUILDER';

  constructor(
    private service: PseudoChallengeService,
    private router: Router,
    private trainerBatchLookupService: TrainerBatchLookupService,
  ) {}

  ngOnInit(): void {
    this.loadTrainerBatches();
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.loading = true;

    this.service.getTrainerChallenges().subscribe({
      next: (res: any) => {
        this.challenges = res?.data || [];
        this.loading = false;
        this.page = 1;
      },
      error: () => {
        this.loading = false;
        this.challenges = [];
        this.showToast('Unable to load challenges');
      },
    });
  }

  loadTrainerBatches(): void {
    this.batchLoading = true;

    this.trainerBatchLookupService.getMyBatches().subscribe({
      next: (res: any) => {
        this.trainerBatches = res?.data || [];
        this.batchLoading = false;

        if (this.trainerBatches.length && !this.form.batchId) {
          this.form.batchId = String(this.trainerBatches[0].id);
        }
      },
      error: () => {
        this.batchLoading = false;
        this.showToast('Unable to load your assigned batches');
      },
    });
  }

  openSubmissionsPage(): void {
    this.router.navigate(['/dashboard/trainer/pseudo-submissions']);
  }

  setWorkspaceTab(tab: WorkspaceTab): void {
    this.activeWorkspaceTab = tab;
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
        item.skill,
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
      const id = item.challengeGroupId || `LEGACY-${item.id}`;
      const status = this.resolveStatus(item);
      const existing = groups.get(id);

      if (existing) {
        existing.challenges.push(item);
        existing.totalMarks += Number(item.totalMarks || 0);
        existing.attemptCount += Number(item.attemptCount || 0);
        existing.testCasesCount += Number(item.testCasesCount || item.testCases?.length || 0);
        existing.rulesCount += Number(item.rulesCount || item.rules?.length || 0);
        existing.activeCount += status === 'ACTIVE' ? 1 : 0;
        existing.closedCount += status === 'CLOSED' ? 1 : 0;
        existing.latestCreatedAt = this.pickLatestDate(existing.latestCreatedAt, item.createdAt);
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
        testCasesCount: Number(item.testCasesCount || item.testCases?.length || 0),
        rulesCount: Number(item.rulesCount || item.rules?.length || 0),
        activeCount: status === 'ACTIVE' ? 1 : 0,
        closedCount: status === 'CLOSED' ? 1 : 0,
        latestCreatedAt: item.createdAt,
      });
    }

    const list = Array.from(groups.values());

    return list.sort((a, b) => {
      if (this.sortBy === 'TITLE') return a.title.localeCompare(b.title);
      if (this.sortBy === 'ATTEMPTS') return b.attemptCount - a.attemptCount;
      if (this.sortBy === 'MARKS') return b.totalMarks - a.totalMarks;

      return (
        new Date(b.latestCreatedAt || 0).getTime() - new Date(a.latestCreatedAt || 0).getTime()
      );
    });
  }

  get companyGroups(): CompanyGroup[] {
    const companies = new Map<string, CompanyGroup>();

    for (const group of this.groupedChallenges) {
      const name = group.companyName || 'General';
      const id = name.trim().toLowerCase();
      const existing = companies.get(id);

      if (existing) {
        existing.groups.push(group);
        existing.challengeCount += group.challenges.length;
        existing.totalMarks += group.totalMarks;
        existing.attemptCount += group.attemptCount;
        existing.activeCount += group.activeCount;
        existing.latestCreatedAt = this.pickLatestDate(
          existing.latestCreatedAt,
          group.latestCreatedAt,
        );
        continue;
      }

      companies.set(id, {
        id,
        name,
        groups: [group],
        challengeCount: group.challenges.length,
        totalMarks: group.totalMarks,
        attemptCount: group.attemptCount,
        activeCount: group.activeCount,
        latestCreatedAt: group.latestCreatedAt,
      });
    }

    return Array.from(companies.values()).sort((a, b) => {
      if (this.sortBy === 'TITLE') return a.name.localeCompare(b.name);
      if (this.sortBy === 'ATTEMPTS') return b.attemptCount - a.attemptCount;
      if (this.sortBy === 'MARKS') return b.totalMarks - a.totalMarks;

      return (
        new Date(b.latestCreatedAt || 0).getTime() - new Date(a.latestCreatedAt || 0).getTime()
      );
    });
  }

  get activeLibraryItemsCount(): number {
    return this.libraryView === 'COMPANIES'
      ? this.companyGroups.length
      : this.groupedChallenges.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.activeLibraryItemsCount / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const start = Math.max(1, this.page - 2);
    const end = Math.min(total, this.page + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get pagedGroups(): ChallengeGroup[] {
    const start = (this.page - 1) * this.pageSize;
    return this.groupedChallenges.slice(start, start + this.pageSize);
  }

  get pagedCompanyGroups(): CompanyGroup[] {
    const start = (this.page - 1) * this.pageSize;
    return this.companyGroups.slice(start, start + this.pageSize);
  }

  get libraryStartRecord(): number {
    if (!this.activeLibraryItemsCount) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get libraryEndRecord(): number {
    return Math.min(this.page * this.pageSize, this.activeLibraryItemsCount);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size || 6);
    this.page = 1;
  }

  applyStatusFilter(status: ChallengeFilter): void {
    this.statusFilter = status;
    this.page = 1;
  }

  setLibraryView(view: LibraryView): void {
    this.libraryView = view;
    this.page = 1;
  }

  openCompaniesView(): void {
    this.libraryView = 'COMPANIES';
    this.page = 1;
  }

  sortDirectionIcon(): string {
    if (this.sortBy === 'TITLE') return 'bi bi-sort-alpha-down';
    if (this.sortBy === 'ATTEMPTS') return 'bi bi-graph-up-arrow';
    if (this.sortBy === 'MARKS') return 'bi bi-award';
    return 'bi bi-clock-history';
  }

  setSort(sort: SortOption): void {
    this.sortBy = sort;
    this.page = 1;
  }

  formatConstraints(value: any): string[] {
    const text = String(value || '').trim();

    if (!text) return [];

    return text
      .split(/\r?\n|;|\.\s+/)
      .map((item) =>
        item
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+[.)]\s*/, '')
          .trim(),
      )
      .filter(Boolean);
  }

  constraintsPreview(value: any, limit = 3): string[] {
    return this.formatConstraints(value).slice(0, limit);
  }

  get activeTotalPages(): number {
    return Math.max(1, Math.ceil(this.activeLibraryItemsCount / this.pageSize));
  }

  get totalAttempts(): number {
    return this.challenges.reduce((sum, item) => sum + Number(item.attemptCount || 0), 0);
  }

  get totalTestCases(): number {
    return this.challenges.reduce(
      (sum, item) => sum + Number(item.testCasesCount || item.testCases?.length || 0),
      0,
    );
  }

  get totalGroups(): number {
    return this.groupedChallenges.length;
  }

  get activeChallenges(): number {
    return this.challenges.filter((item) => this.resolveStatus(item) === 'ACTIVE').length;
  }

  get companyCount(): number {
    return new Set(
      this.challenges
        .map((item) =>
          String(item.companyName || 'General')
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ).size;
  }

  get averageAttemptsPerGroup(): number {
    if (!this.groupedChallenges.length) return 0;
    const total = this.groupedChallenges.reduce(
      (sum, group) => sum + Number(group.attemptCount || 0),
      0,
    );
    return Math.round(total / this.groupedChallenges.length);
  }

  get totalMarksAcrossGroups(): number {
    return this.groupedChallenges.reduce((sum, group) => sum + Number(group.totalMarks || 0), 0);
  }

  get latestGroup(): ChallengeGroup | null {
    if (!this.groupedChallenges.length) return null;
    return this.groupedChallenges[0];
  }

  get totalRuleMarks(): number {
    return this.form.rules.reduce((sum, rule) => sum + Number(rule.marks || 0), 0);
  }

  get totalTestCaseMarks(): number {
    return this.form.testCases.reduce((sum, tc) => sum + Number(tc.marks || 0), 0);
  }

  get builderMarks(): number {
    return this.totalRuleMarks + this.totalTestCaseMarks;
  }

  get passMarks(): number {
    return Math.ceil(
      (Number(this.form.totalMarks || 0) * Number(this.form.passPercentage || 0)) / 100,
    );
  }

  get visibleTestsCount(): number {
    return this.form.testCases.filter((tc) => !tc.hidden).length;
  }

  get validationErrors(): string[] {
    const errors: string[] = [];

    if (this.form.batchId === undefined || this.form.batchId === null || this.form.batchId === '') {
      errors.push('Batch is required');
    }
    if (!this.form.challengeGroupTitle.trim()) errors.push('Group title is required');
    if (!this.form.companyName.trim()) errors.push('Company name is required');
    if (!this.form.title.trim()) errors.push('Challenge title is required');
    if (!this.form.problemStatement.trim()) errors.push('Problem statement is required');
    if (Number(this.form.durationMinutes) <= 0) errors.push('Duration must be greater than 0');
    if (Number(this.form.totalMarks) <= 0) errors.push('Total marks must be greater than 0');

    if (Number(this.form.passPercentage) <= 0 || Number(this.form.passPercentage) > 100) {
      errors.push('Pass percentage must be between 1 and 100');
    }

    if (!this.form.testCases.length) errors.push('At least one test case is required');

    this.form.testCases.forEach((tc, index) => {
      if (!tc.inputData.trim()) errors.push(`Test ${index + 1}: input is required`);
      if (!tc.expectedOutput.trim()) errors.push(`Test ${index + 1}: expected output is required`);
      if (Number(tc.marks) <= 0) errors.push(`Test ${index + 1}: marks must be greater than 0`);
    });

    this.form.rules.forEach((rule, index) => {
      if (!rule.value.trim()) errors.push(`Rule ${index + 1}: value is required`);
      if (Number(rule.marks) < 0) errors.push(`Rule ${index + 1}: marks cannot be negative`);
      if (rule.type === 'MIN_LINES' && Number(rule.value) <= 0) {
        errors.push(`Rule ${index + 1}: minimum lines must be greater than 0`);
      }
    });

    return errors;
  }

  get validationWarnings(): string[] {
    const warnings: string[] = [];

    if (this.builderMarks !== Number(this.form.totalMarks || 0)) {
      warnings.push(
        `Configured marks are ${this.builderMarks}, total marks are ${this.form.totalMarks}`,
      );
    }

    if (!this.visibleTestsCount) warnings.push('All test cases are hidden');
    if (!this.form.rules.length) warnings.push('No static code rules added');

    return warnings;
  }

  get isFormInvalid(): boolean {
    return this.validationErrors.length > 0;
  }

  toggleGroup(groupId: string): void {
    this.expandedGroups[groupId] = !this.expandedGroups[groupId];
  }

  expandAll(): void {
    if (this.libraryView === 'COMPANIES') {
      this.pagedCompanyGroups.forEach((company) => (this.expandedCompanies[company.id] = true));
      return;
    }

    this.pagedGroups.forEach((group) => (this.expandedGroups[group.id] = true));
  }

  collapseAll(): void {
    this.expandedGroups = {};
    this.expandedCompanies = {};
  }

  addRule(): void {
    this.form.rules.push({ type: 'REQUIRED_KEYWORD', value: '', marks: 0 });
  }

  removeRule(index: number): void {
    this.form.rules.splice(index, 1);
  }

  addTestCase(): void {
    this.form.testCases.push({
      inputData: '',
      expectedOutput: '',
      marks: 20,
      hidden: true,
    });
  }

  removeTestCase(index: number): void {
    if (this.form.testCases.length === 1) {
      this.showToast('Keep at least one test case');
      return;
    }

    this.form.testCases.splice(index, 1);
  }

  saveChallenge(): void {
    if (this.isFormInvalid) {
      this.showToast(this.validationErrors[0]);
      return;
    }

    this.normalizeTestCaseVisibility();

    const payload = this.buildCreatePayload(this.form);
    this.saving = true;

    const request = this.editingChallengeId
      ? this.service.updateTrainerChallenge(this.editingChallengeId, payload)
      : this.service.createTrainerChallenge(payload);

    request.subscribe({
      next: (res: any) => {
        const id = this.resolveSavedId(res) || this.editingChallengeId;
        this.saving = false;
        this.showToast(
          this.editingChallengeId
            ? 'Challenge updated successfully'
            : 'Challenge created successfully',
        );
        this.resetForm();
        this.loadChallenges();
        this.activeWorkspaceTab = 'LIBRARY';
        if (id) this.previewChallenge(Number(id));
      },
      error: () => {
        this.saving = false;
        this.showToast(
          this.editingChallengeId ? 'Unable to update challenge' : 'Unable to create challenge',
        );
      },
    });
  }

  toggleCompany(companyId: string): void {
    this.expandedCompanies[companyId] = !this.expandedCompanies[companyId];
  }

  previewCompany(company: CompanyGroup): void {
    if (company.groups[0]) {
      this.previewGroup(company.groups[0]);
    }
  }

  trackByCompany(_: number, company: CompanyGroup): string {
    return company.id;
  }

  previewBuilder(): void {
    if (this.isFormInvalid) {
      this.showToast(this.validationErrors[0]);
      return;
    }

    const payload = this.buildCreatePayload(this.form);

    this.draftPreview = {
      ...payload,
      id: this.editingChallengeId,
      rulesCount: payload.rules.length,
      testCasesCount: payload.testCases.length,
      attemptCount: 0,
    };
  }

  loadSampleJson(): void {
    this.showJsonImporter = true;

    this.jsonChallengeText = JSON.stringify(
      [
        {
          batchId: Number(this.form.batchId || 101),
          companyName: this.form.companyName || 'TCS',
          challengeGroupTitle: this.form.challengeGroupTitle || 'TCS Java Basics Round',
          title: 'Sum of Two Numbers',
          problemStatement: 'Read two integers A and B and print their sum.',
          constraintsText: 'Print only the final sum. Do not print extra text.',
          inputFormat: 'One line contains two space-separated integers A and B.',
          outputFormat: 'Print one integer: A + B.',
          durationMinutes: 15,
          totalMarks: 100,
          passPercentage: 100,
          rules: [],
          testCases: [
            { inputData: '5 7', expectedOutput: '12', marks: 50, hidden: false },
            { inputData: '-4 10', expectedOutput: '6', marks: 50, hidden: true },
          ],
        },
        {
          batchId: Number(this.form.batchId || 101),
          companyName: this.form.companyName || 'TCS',
          challengeGroupTitle: this.form.challengeGroupTitle || 'TCS Java Basics Round',
          title: 'Largest Number',
          problemStatement: 'Read N numbers and print the largest value.',
          constraintsText: 'Handle negative numbers and single item input.',
          inputFormat: 'First line contains N. Second line contains N integers.',
          outputFormat: 'Print the largest integer.',
          durationMinutes: 20,
          totalMarks: 100,
          passPercentage: 100,
          rules: [],
          testCases: [
            { inputData: '5\n12 4 19 3 8', expectedOutput: '19', marks: 50, hidden: false },
            { inputData: '4\n-8 -2 -11 -5', expectedOutput: '-2', marks: 50, hidden: true },
          ],
        },
      ],
      null,
      2,
    );
  }

  importChallengeJson(): void {
    const parsed = this.parseChallengeJson();
    if (!parsed) return;

    const challenge = Array.isArray(parsed) ? parsed[0] : parsed;
    this.form = this.normalizeChallengePayload(challenge);
    this.showToast('JSON imported into builder');
  }

  postChallengeJson(): void {
    const parsed = this.parseChallengeJson();
    if (!parsed) return;

    const challenges = Array.isArray(parsed) ? parsed : [parsed];

    if (!challenges.length) {
      this.showToast('No challenges found in JSON');
      return;
    }

    const normalizedChallenges = challenges.map((item) =>
      this.buildCreatePayload(this.normalizeChallengePayload(item)),
    );

    const invalid = normalizedChallenges.find((payload) => !this.isValidChallengePayload(payload));

    if (invalid) {
      this.showToast('One or more challenges contain invalid fields');
      return;
    }

    this.saving = true;

    const request =
      normalizedChallenges.length === 1
        ? this.service.createTrainerChallenge(normalizedChallenges[0])
        : this.service.createBulkTrainerChallenges(normalizedChallenges);

    request.subscribe({
      next: (res: any) => {
        this.saving = false;
        const data = res?.data || res;

        this.form = this.getEmptyForm();
        this.jsonChallengeText = '';
        this.showJsonImporter = false;
        this.loadChallenges();

        this.showToast(
          normalizedChallenges.length === 1
            ? 'Challenge posted successfully'
            : `${data?.successCount || normalizedChallenges.length} grouped challenges posted successfully`,
        );
      },
      error: () => {
        this.saving = false;
        this.showToast(
          normalizedChallenges.length > 1
            ? 'Bulk challenge upload failed'
            : 'Unable to post JSON challenge',
        );
      },
    });
  }

  normalizeTestCaseVisibility(): void {
    this.form.testCases = this.form.testCases.map((tc, index) => ({
      ...tc,
      hidden: index >= 3,
    }));
  }

  previewChallenge(id: number): void {
    this.previewLoading = true;
    this.selectedChallenge = null;
    this.selectedGroup = null;
    this.attempts = [];

    this.service.getTrainerChallengeDetails(id).subscribe({
      next: (res: any) => {
        this.selectedChallenge = res?.data || res;
        this.previewLoading = false;
        this.loadAttempts(id);
      },
      error: () => {
        this.previewLoading = false;
        this.showToast('Unable to load preview');
      },
    });
  }

  previewGroup(group: ChallengeGroup): void {
    this.selectedGroup = group;
    this.selectedChallenge = null;
    this.attempts = [];
  }

  editChallenge(id: number): void {
    this.previewLoading = true;

    this.service.getTrainerChallengeDetails(id).subscribe({
      next: (res: any) => {
        const challenge = res?.data || res;

        this.form = this.normalizeChallengePayload(challenge);
        this.editingChallengeId = id;
        this.selectedChallenge = null;
        this.selectedGroup = null;
        this.attempts = [];
        this.previewLoading = false;
        this.showJsonImporter = false;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Challenge loaded for editing');
      },
      error: () => {
        this.previewLoading = false;
        this.showToast('Unable to load challenge for editing');
      },
    });
  }

  loadAttempts(id: number): void {
    this.service.getTrainerAttempts(id).subscribe({
      next: (res: any) => (this.attempts = res?.data || []),
      error: () => (this.attempts = []),
    });
  }

  duplicateChallenge(item: any): void {
    if (item.testCases === undefined) {
      this.previewLoading = true;

      this.service.getTrainerChallengeDetails(item.id).subscribe({
        next: (res: any) => {
          const challenge = res?.data || res;
          this.previewLoading = false;
          this.duplicateChallenge({
            ...challenge,
            title: `${challenge.title || 'Challenge'} Copy`,
          });
        },
        error: () => {
          this.previewLoading = false;
          this.showToast('Unable to load challenge for reuse');
        },
      });

      return;
    }

    this.form = this.normalizeChallengePayload({
      ...item,
      title: item.title?.endsWith('Copy') ? item.title : `${item.title || 'Challenge'} Copy`,
      challengeGroupTitle: item.challengeGroupTitle || `${item.title || 'Challenge'} Copy Group`,
    });

    this.editingChallengeId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Challenge copied into builder');
  }

  duplicateGroup(group: ChallengeGroup): void {
    const copied = group.challenges.map((item) => ({
      ...item,
      id: undefined,
      title: item.title,
      companyName: group.companyName,
      challengeGroupTitle: `${group.title} Copy`,
    }));

    this.jsonChallengeText = JSON.stringify(copied, null, 2);
    this.showJsonImporter = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Group copied into JSON uploader');
  }

  fillSampleChallenge(): void {
    this.form = {
      batchId: this.form.batchId || '',
      companyName: this.form.companyName || 'Infosys',
      challengeGroupTitle: this.form.challengeGroupTitle || 'Infosys Foundation Round',
      title: 'Find the largest number',
      problemStatement:
        'Write a Java or Python program to read N numbers and print the largest value.',
      constraintsText:
        'Use a loop. Compare every number. Handle negative values and single-item input.',
      inputFormat: 'First line contains N. Second line contains N space-separated integers.',
      outputFormat: 'Print the largest integer.',
      durationMinutes: 30,
      totalMarks: 100,
      passPercentage: 100,
      rules: [],
      testCases: [
        { inputData: '5\n12 4 19 3 8', expectedOutput: '19', marks: 35, hidden: false },
        { inputData: '4\n-8 -2 -11 -5', expectedOutput: '-2', marks: 35, hidden: true },
        { inputData: '1\n7', expectedOutput: '7', marks: 30, hidden: true },
      ],
      skill: 'Coding',
      hintText: 'Think about how to compare numbers and keep track of the largest one.',
    };
  }

  deleteChallenge(id: number): void {
    if (!confirm('Delete this coding challenge?')) return;

    this.service.deleteTrainerChallenge(id).subscribe({
      next: () => {
        this.showToast('Challenge deleted');
        this.challenges = this.challenges.filter((item) => item.id !== id);
        if (this.selectedChallenge?.id === id) this.closePreview();
      },
      error: () => this.showToast('Unable to delete challenge'),
    });
  }

  deleteGroup(group: ChallengeGroup): void {
    if (!confirm(`Delete all ${group.challenges.length} challenges in "${group.title}"?`)) return;

    forkJoin(
      group.challenges.map((item) => this.service.deleteTrainerChallenge(item.id)),
    ).subscribe({
      next: () => {
        this.challenges = this.challenges.filter((item) => item.challengeGroupId !== group.id);
        this.closePreview();
        this.showToast('Challenge group deleted');
      },
      error: () => this.showToast('Unable to delete full group'),
    });
  }

  openEditGroupModal(group: ChallengeGroup): void {
    this.groupEditForm = {
      groupId: group.id,
      title: group.title,
      companyName: group.companyName
    };
    this.showEditGroupModal = true;
  }

  closeEditGroupModal(): void {
    this.showEditGroupModal = false;
    this.groupEditForm = { groupId: '', title: '', companyName: '' };
  }

  saveGroupEdit(): void {
    if (!this.groupEditForm.title.trim()) {
      this.showToast('Group title is required');
      return;
    }

    this.saving = true;
    this.service
      .updateTrainerChallengeGroup(this.groupEditForm.groupId, {
        title: this.groupEditForm.title.trim(),
        companyName: this.groupEditForm.companyName.trim()
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.showToast('Group updated successfully');
          this.closeEditGroupModal();
          this.loadChallenges();
        },
        error: () => {
          this.saving = false;
          this.showToast('Unable to update group');
        }
      });
  }

  closePreview(): void {
    this.selectedChallenge = null;
    this.selectedGroup = null;
    this.attempts = [];
  }

  closeDraftPreview(): void {
    this.draftPreview = null;
  }

  resetForm(): void {
    this.form = this.getEmptyForm();
    this.editingChallengeId = null;
    this.draftPreview = null;
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  trackByGroup(_: number, group: ChallengeGroup): string {
    return group.id;
  }

  resolveStatus(item: any): ChallengeFilter {
    return item.status || (item.active === false ? 'CLOSED' : 'ACTIVE');
  }

  groupStatusLabel(group: ChallengeGroup): string {
    if (group.closedCount && !group.activeCount) return 'Closed';
    if (group.closedCount) return 'Mixed';
    return 'Active';
  }

  groupStatusClass(group: ChallengeGroup): string {
    if (group.closedCount && !group.activeCount) return 'closed';
    if (group.closedCount) return 'mixed';
    return 'active';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  private parseChallengeJson(): any | null {
    if (!this.jsonChallengeText.trim()) {
      this.showToast('Paste challenge JSON first');
      return null;
    }

    try {
      return JSON.parse(this.jsonChallengeText);
    } catch {
      this.showToast('Invalid JSON format');
      return null;
    }
  }

  private normalizeChallengePayload(payload: any): ChallengeForm {
    const fallback = this.getEmptyForm();
    const testCases = Array.isArray(payload?.testCases) ? payload.testCases : [];
    const rules = Array.isArray(payload?.rules) ? payload.rules : [];

    return {
      batchId: String(payload?.batchId !== undefined && payload?.batchId !== null ? payload.batchId : fallback.batchId),
      companyName: String(payload?.companyName || fallback.companyName),
      challengeGroupTitle: String(
        payload?.challengeGroupTitle || payload?.groupTitle || fallback.challengeGroupTitle || 'General Challenges',
      ),
      title: String(payload?.title || ''),
      problemStatement: String(payload?.problemStatement || ''),
      constraintsText: String(payload?.constraintsText || ''),
      inputFormat: String(payload?.inputFormat || ''),
      outputFormat: String(payload?.outputFormat || ''),
      durationMinutes: Number(payload?.durationMinutes || fallback.durationMinutes),
      totalMarks: Number(payload?.totalMarks || fallback.totalMarks),
      passPercentage: Number(payload?.passPercentage || fallback.passPercentage),
      rules: rules
        .filter((rule: any) => rule && rule.value !== undefined)
        .map((rule: any) => ({
          type: this.normalizeRuleType(rule.type),
          value: String(rule.value || ''),
          marks: Number(rule.marks || 0),
        })),
      testCases: testCases.map((tc: any) => ({
        inputData: String(tc?.inputData ?? ''),
        expectedOutput: String(tc?.expectedOutput ?? ''),
        marks: Number(tc?.marks || 0),
        hidden: Boolean(tc?.hidden),
      })),
      skill: String(payload?.skill || fallback.skill),
      hintText: String(payload?.hintText || ''),
      askedYear: payload?.askedYear ? Number(payload.askedYear) : undefined,
    };
  }

  private buildCreatePayload(form: ChallengeForm): any {
    return {
      ...form,
      batchId: Number(form.batchId),
      companyName: form.companyName.trim(),
      challengeGroupTitle: form.challengeGroupTitle.trim(),
      durationMinutes: Number(form.durationMinutes || 0),
      totalMarks: Number(form.totalMarks || 0),
      passPercentage: Number(form.passPercentage || 0),
      rules: form.rules
        .map((rule) => ({
          ...rule,
          value: rule.value.trim(),
          marks: Number(rule.marks || 0),
        }))
        .filter((rule) => rule.value),
      testCases: form.testCases.map((tc) => ({
        ...tc,
        inputData: tc.inputData,
        expectedOutput: tc.expectedOutput,
        marks: Number(tc.marks || 0),
        hidden: Boolean(tc.hidden),
      })),
      askedYear: form.askedYear ? Number(form.askedYear) : null,
    };
  }

  private isValidChallengePayload(payload: any): boolean {
    return (
      payload.batchId !== undefined &&
      payload.batchId !== null &&
      String(payload.companyName || '').trim().length > 0 &&
      String(payload.challengeGroupTitle || '').trim().length > 0 &&
      String(payload.title || '').trim().length > 0 &&
      String(payload.problemStatement || '').trim().length > 0 &&
      Number(payload.totalMarks) > 0 &&
      Number(payload.passPercentage) > 0 &&
      Array.isArray(payload.testCases) &&
      payload.testCases.length > 0 &&
      payload.testCases.every(
        (tc: any) =>
          tc.inputData !== undefined &&
          tc.inputData !== null &&
          tc.expectedOutput !== undefined &&
          tc.expectedOutput !== null &&
          Number(tc.marks) > 0,
      )
    );
  }

  private normalizeRuleType(type: any): RuleType {
    const value = String(type || 'REQUIRED_KEYWORD');

    if (value === 'FORBIDDEN_KEYWORD' || value === 'MIN_LINES') return value;
    return 'REQUIRED_KEYWORD';
  }

  private resolveSavedId(res: any): number | null {
    const data = res?.data || res;
    const id = data?.challengeId || data?.id;

    return id ? Number(id) : null;
  }

  private pickLatestDate(a: any, b: any): any {
    if (!a) return b;
    if (!b) return a;

    return new Date(a).getTime() > new Date(b).getTime() ? a : b;
  }

  private getEmptyForm(): ChallengeForm {
    return {
      batchId: '0',
      companyName: '',
      skill: 'Coding',
      challengeGroupTitle: '',
      title: '',
      problemStatement: '',
      constraintsText: '',
      inputFormat: '',
      outputFormat: '',
      durationMinutes: 30,
      totalMarks: 100,
      passPercentage: 100,
      rules: [],
      testCases: [{ inputData: '', expectedOutput: '', marks: 100, hidden: true }],
      hintText: '',
      askedYear: new Date().getFullYear(),
    };
  }
}
