import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PseudoChallengeService } from '../../services/pseudo-challenge';

type RuleType = 'REQUIRED_KEYWORD' | 'FORBIDDEN_KEYWORD' | 'MIN_LINES';
type ChallengeFilter = 'ALL' | 'ACTIVE' | 'DRAFT' | 'CLOSED';

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
  showJsonImporter = false;
  jsonChallengeText = '';
  editingChallengeId: number | null = null;
  draftPreview: any = null;

  challenges: any[] = [];
  selectedChallenge: any = null;
  attempts: any[] = [];

  form: ChallengeForm = this.getEmptyForm();

  constructor(private service: PseudoChallengeService) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.loading = true;

    this.service.getTrainerChallenges().subscribe({
      next: (res: any) => {
        this.challenges = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.challenges = [];
        this.showToast('Unable to load challenges');
      },
    });
  }

  get filteredChallenges(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.challenges.filter((item) => {
      const status = item.status || (item.active === false ? 'CLOSED' : 'ACTIVE');
      const text = [item.title, item.problemStatement, item.batchId, status]
        .join(' ')
        .toLowerCase();

      return text.includes(term) && (this.statusFilter === 'ALL' || status === this.statusFilter);
    });
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

    if (!this.form.batchId || Number(this.form.batchId) <= 0) errors.push('Batch ID is required');
    if (!this.form.title.trim()) errors.push('Title is required');
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

  createChallenge(): void {
    this.saveChallenge();
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
      {
        batchId: Number(this.form.batchId || 101),
        title: 'Sum of Two Numbers',
        problemStatement:
          'Write a Java or Python program to read two integers A and B and print their sum.',
        constraintsText:
          'A and B can be positive, negative, or zero. Print only the final sum. Do not print extra text.',
        inputFormat: 'One line contains two space-separated integers A and B.',
        outputFormat: 'Print one integer: A + B.',
        durationMinutes: 15,
        totalMarks: 100,
        passPercentage: 100,
        rules: [],
        testCases: [
          { inputData: '5 7', expectedOutput: '12', marks: 30, hidden: false },
          { inputData: '-4 10', expectedOutput: '6', marks: 35, hidden: true },
          { inputData: '0 0', expectedOutput: '0', marks: 35, hidden: true },
        ],
      },
      null,
      2,
    );
  }

  importChallengeJson(): void {
    const challenge = this.parseChallengeJson();
    if (!challenge) return;

    this.form = this.normalizeChallengePayload(challenge);
    this.showToast('JSON imported into builder');
  }

  postChallengeJson(): void {
    const challenge = this.parseChallengeJson();
    if (!challenge) return;

    const normalized = this.normalizeChallengePayload(challenge);
    const payload = this.buildCreatePayload(normalized);

    if (!this.isValidChallengePayload(payload)) {
      this.showToast('JSON must include batchId, title, problemStatement, and valid testCases');
      return;
    }

    this.saving = true;

    this.service.createTrainerChallenge(payload).subscribe({
      next: (res: any) => {
        const id = this.resolveSavedId(res);
        this.saving = false;
        this.showToast('JSON challenge posted successfully');
        this.form = this.getEmptyForm();
        this.jsonChallengeText = '';
        this.showJsonImporter = false;
        this.loadChallenges();
        if (id) this.previewChallenge(Number(id));
      },
      error: () => {
        this.saving = false;
        this.showToast('Unable to post JSON challenge');
      },
    });
  }

  previewChallenge(id: number): void {
    this.previewLoading = true;
    this.selectedChallenge = null;
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

  editChallenge(id: number): void {
    this.previewLoading = true;

    this.service.getTrainerChallengeDetails(id).subscribe({
      next: (res: any) => {
        const challenge = res?.data || res;
        this.form = this.normalizeChallengePayload(challenge);
        this.editingChallengeId = id;
        this.selectedChallenge = null;
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
    });
    this.editingChallengeId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Challenge copied into builder');
  }

  fillSampleChallenge(): void {
    this.form = {
      batchId: this.form.batchId || '',
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

  closePreview(): void {
    this.selectedChallenge = null;
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
      batchId: String(payload?.batchId || fallback.batchId),
      title: String(payload?.title || ''),
      problemStatement: String(payload?.problemStatement || ''),
      constraintsText: String(payload?.constraintsText || ''),
      inputFormat: String(payload?.inputFormat || ''),
      outputFormat: String(payload?.outputFormat || ''),
      durationMinutes: Number(payload?.durationMinutes || fallback.durationMinutes),
      totalMarks: Number(payload?.totalMarks || fallback.totalMarks),
      passPercentage: Number(payload?.passPercentage || 100),
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
    };
  }

  private buildCreatePayload(form: ChallengeForm): any {
    return {
      ...form,
      batchId: Number(form.batchId),
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
    };
  }

  private isValidChallengePayload(payload: any): boolean {
    return (
      Number(payload.batchId) > 0 &&
      String(payload.title || '').trim().length > 0 &&
      String(payload.problemStatement || '').trim().length > 0 &&
      Number(payload.totalMarks) > 0 &&
      Number(payload.passPercentage) > 0 &&
      Array.isArray(payload.testCases) &&
      payload.testCases.length > 0 &&
      payload.testCases.every(
        (tc: any) =>
          String(tc.inputData || '').trim().length > 0 &&
          String(tc.expectedOutput || '').trim().length > 0 &&
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

  private getEmptyForm(): ChallengeForm {
    return {
      batchId: '',
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
    };
  }
}
