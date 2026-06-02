import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicPracticeService } from '../../../services/public-practice.service';
import { AuthService } from '../../../auth/services/auth.service';

type PracticeType = 'ASSESSMENT' | 'CHALLENGE' | 'INTERVIEW';
type OptionKey = 'A' | 'B' | 'C' | 'D';

interface PracticeGrant {
  accessToken: string;
  practiceType: PracticeType;
  practiceId: number;
  expiresAt: string;
  maxAttempts: number;
  authenticated?: boolean;
  userId?: number;
  ownerMode?: 'AUTH' | 'GUEST';
}

@Component({
  selector: 'app-public-practice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-practice.html',
  styleUrls: ['./public-practice.css'],
})
export class PublicPracticeComponent implements OnInit {
  readonly optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  readonly languages = [
    'PYTHON',
    'JAVA',
    'C',
    'CPP',
    'TYPESCRIPT',
    'GO',
    'RUST',
    'CSHARP',
    'PHP',
    'RUBY',
  ];

  readonly companyLogos: Record<string, string> = {
    TCS: 'logos/tcs.svg',
    Deloitte: 'logos/deloitte.svg',
    Infosys: 'logos/infosys.svg',
    Wipro: 'logos/wipro.svg',
    Accenture: 'logos/accenture.svg',
    Cognizant: 'logos/cognizant.svg',
    Zoho: 'logos/zoho.svg',
    IBM: 'logos/ibm.svg',
    Microsoft: 'logos/microsoft.svg',
    KPMG: 'logos/kpmg.svg',
    EY: 'logos/ey.svg',
  };

  loading = false;
  submitting = false;
  toast = '';

  assessments: any[] = [];
  challenges: any[] = [];
  companies: string[] = [];
  skills: string[] = [];

  search = '';
  selectedCompany = 'ALL';
  selectedSkill = 'ALL';
  selectedType: 'ALL' | PracticeType = 'ALL';

  currentPage = 1;
  pageSize = 6;

  mode: 'LIBRARY' | 'ASSESSMENT' | 'CHALLENGE' = 'LIBRARY';

  assessmentId = 0;
  assessment: any = null;
  answers: { questionId: number; selectedAnswer: OptionKey | '' }[] = [];
  currentQuestionIndex = 0;
  assessmentResult: any = null;

  challengeId = 0;
  challenge: any = null;
  language = 'PYTHON';
  sourceCode = '';
  lastStarterCode = '';
  challengeResult: any = null;

  showLeadModal = false;
  pendingItem: any = null;
  leadSaved = false;
  workspaceUnlocked = false;
  currentGrant: PracticeGrant | null = null;
  redirectMessage = '';
  redirectSeconds = 0;

  hintUnlocked = false;
  showHintPanel = false;
  hintUnlockSeconds = 30;
  selectedChallenge: any = null;
  private hintUnlockTimer: any;

  private redirectTimer?: ReturnType<typeof setInterval>;

  lead = {
    name: '',
    phone: '',
    email: '',
    city: '',
    interest: 'TCS NQT / Placement Preparation',
    message: '',
  };

  leadErrors = {
    name: '',
    phone: '',
    email: '',
  };

  constructor(
    private publicPracticeService: PublicPracticeService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.restoreLead();
    this.workspaceUnlocked = false;
    this.currentGrant = null;

    const type = this.route.snapshot.paramMap.get('type');
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (type === 'assessment' && id) {
      this.loadAssessment(id);
      return;
    }

    if (type === 'challenge' && id) {
      this.loadChallenge(id);
      return;
    }

    this.loadLibrary();
  }

  get allItems(): any[] {
    return [...this.assessments, ...this.challenges];
  }

  get featuredItems(): any[] {
    return this.allItems
      .filter((item) => ['TCS', 'Deloitte', 'Infosys', 'Wipro'].includes(item.company))
      .slice(0, 4);
  }

  get filteredItems(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.allItems.filter((item) => {
      const text = [item.title, item.description, item.company, item.skill, item.type]
        .join(' ')
        .toLowerCase();

      return (
        (!term || text.includes(term)) &&
        (this.selectedCompany === 'ALL' || item.company === this.selectedCompany) &&
        (this.selectedSkill === 'ALL' || item.skill === this.selectedSkill) &&
        (this.selectedType === 'ALL' || item.type === this.selectedType)
      );
    });
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.filteredItems.length / this.pageSize), 1);
  }

  get pagedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get currentQuestion(): any {
    return this.assessment?.questions?.[this.currentQuestionIndex];
  }

  get answeredCount(): number {
    return this.answers.filter((a) => !!a.selectedAnswer).length;
  }

  get assessmentProgress(): number {
    if (!this.assessment?.questions?.length) return 0;
    return Math.round((this.answeredCount / this.assessment.questions.length) * 100);
  }

  get canUseWorkspace(): boolean {
    if (!this.currentGrant?.accessToken) {
      return false;
    }

    const expiresAt = new Date(this.currentGrant.expiresAt).getTime();

    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  }

  private premiumAccessLevels(): string[] {
    return ['PAID_STUDENT_ONLY', 'PREMIUM', 'PRO_ONLY', 'ELITE_ONLY'];
  }

  private accountAccessLevels(): string[] {
    return ['ACCOUNT_REQUIRED', 'ENROLLED_STUDENT_ONLY'];
  }

  private itemAccessLevel(item: any): string {
    return String(item?.accessLevel || item?.publicAccessLevel || 'LEAD_REQUIRED').toUpperCase();
  }

  private isPremiumItem(item: any): boolean {
    return this.premiumAccessLevels().includes(this.itemAccessLevel(item));
  }

  private isAccountOnlyItem(item: any): boolean {
    return this.accountAccessLevels().includes(this.itemAccessLevel(item));
  }

  private resolvePracticeType(item: any): PracticeType {
    const type = String(item?.type || '').toUpperCase();

    if (type.includes('CHALLENGE')) return 'CHALLENGE';
    if (type.includes('INTERVIEW')) return 'INTERVIEW';

    return 'ASSESSMENT';
  }

  private prepareChallengeWorkspace(): void {
    this.sourceCode = this.getStarterCode(this.language);
    this.startHintUnlockTimer();
    this.lastStarterCode = this.sourceCode;
    this.challengeResult = null;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  unlockAuthenticatedAccess(item: any): void {
    const type = this.resolvePracticeType(item);

    if (type === 'INTERVIEW') {
      this.showToast('Interview practice access will open from interview section');
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .registerAuthenticatedAccess({
        practiceType: type,
        practiceId: Number(item.id),
      })
      .subscribe({
        next: (res: any) => {
          this.submitting = false;

          const grant = res?.data as PracticeGrant;

          this.currentGrant = grant;
          this.workspaceUnlocked = true;
          this.persistGrant(grant);

          if (type === 'ASSESSMENT') {
            if (this.mode === 'ASSESSMENT' && this.assessmentId === Number(item.id)) {
              this.workspaceUnlocked = true;
              this.loading = false;
              return;
            }

            this.router.navigate(['/free-mock-tests', 'assessment', item.id]);
            return;
          }

          if (type === 'CHALLENGE') {
            if (this.mode === 'CHALLENGE' && this.challengeId === Number(item.id)) {
              this.prepareChallengeWorkspace();
              this.workspaceUnlocked = true;
              this.loading = false;
              return;
            }

            this.router.navigate(['/free-mock-tests', 'challenge', item.id]);
            return;
          }
        },
        error: (err) => {
          this.submitting = false;
          this.loading = false;

          const message =
            err?.error?.message || err?.error?.error || 'Unable to unlock practice access';

          if (this.isPremiumItem(item)) {
            this.router.navigate(['/pricing-plans'], {
              queryParams: {
                redirect: this.router.url,
                unlock: type.toLowerCase(),
                practiceId: item.id,
              },
            });
            return;
          }

          this.showToast(message);
        },
      });
  }

  loadLibrary(): void {
    this.mode = 'LIBRARY';
    this.loading = true;

    this.publicPracticeService.getLibrary().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.assessments = data.assessments || [];
        this.challenges = data.challenges || [];
        this.companies = Array.from(data.companies || []);
        this.skills = Array.from(data.skills || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load free practice tests');
      },
    });
  }

  requestWorkspaceAccess(message = 'Please register to continue with this practice item'): void {
    this.showToast(message);
    this.rememberPublicPracticeRedirect();
    this.showLeadModal = true;
  }
  openLeadModal(item: any): void {
    const type = this.resolvePracticeType(item);
    const access = this.itemAccessLevel(item);

    this.rememberPublicPracticeRedirect();

    if (this.isPremiumItem(item)) {
      if (this.isLoggedIn) {
        this.unlockAuthenticatedAccess({ ...item, type });
        return;
      }

      this.router.navigate(['/pricing-plans'], {
        queryParams: {
          redirect: this.router.url,
          unlock: type.toLowerCase(),
          practiceId: item.id,
        },
      });
      return;
    }

    if (this.isAccountOnlyItem(item)) {
      if (this.isLoggedIn) {
        this.unlockAuthenticatedAccess({ ...item, type });
        return;
      }

      this.router.navigate(['/login'], {
        queryParams: {
          redirect: this.router.url,
        },
      });
      return;
    }

    if (!this.isLeadRequired(item)) {
      this.showToast(this.accessPolicyMessage(item));
      return;
    }

    this.pendingItem = { ...item, type };

    if (this.isLoggedIn) {
      this.unlockAuthenticatedAccess(this.pendingItem);
      return;
    }

    this.lead.interest =
      type === 'ASSESSMENT'
        ? `${item.company || ''} ${item.title || ''} Mock Test`.trim()
        : type === 'CHALLENGE'
          ? `${item.company || ''} ${item.title || ''} Coding Challenge`.trim()
          : `${item.company || ''} ${item.title || ''} Interview Practice`.trim();

    const savedGrant = type === 'INTERVIEW' ? null : this.restoreGrant(type, Number(item.id));

    if (savedGrant) {
      this.currentGrant = savedGrant;
      this.workspaceUnlocked = true;

      if (type === 'ASSESSMENT') {
        this.router.navigate(['/free-mock-tests', 'assessment', item.id]);
        return;
      }

      if (type === 'CHALLENGE') {
        this.router.navigate(['/free-mock-tests', 'challenge', item.id]);
        return;
      }
    }

    this.workspaceUnlocked = false;
    this.showLeadModal = true;
  }

  closeLeadModal(): void {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
      this.redirectTimer = undefined;
    }
    this.redirectMessage = '';
    this.redirectSeconds = 0;

    if (this.mode === 'LIBRARY') {
      this.pendingItem = null;
    }

    this.showLeadModal = false;
    if (!this.canUseWorkspace && this.mode !== 'LIBRARY') {
      this.workspaceUnlocked = false;
      this.showToast('Please complete registration to start this practice item');
    }
  }

  continueAfterLead(): void {
    if (!this.validateLeadForm()) {
      return;
    }

    if (!this.pendingItem && this.mode === 'CHALLENGE' && this.challenge) {
      this.pendingItem = {
        ...this.challenge,
        id: this.challengeId,
        type: 'CHALLENGE',
      };
    }

    if (!this.pendingItem && this.mode === 'ASSESSMENT' && this.assessment) {
      this.pendingItem = {
        ...this.assessment,
        id: this.assessmentId,
        type: 'ASSESSMENT',
      };
    }

    const item = this.pendingItem;

    if (!item) {
      this.submitting = false;
      this.showToast('Please select a practice item');
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .registerAccess({
        practiceType: item.type,
        practiceId: Number(item.id),
        lead: {
          ...this.lead,
          interest:
            item.type === 'ASSESSMENT'
              ? `${item.company || ''} ${item.title || ''} Mock Test`.trim()
              : `${item.company || ''} ${item.title || ''} Coding Challenge`.trim(),
        },
      })
      .subscribe({
        next: (res: any) => {
          this.submitting = false;

          const grant = res?.data as PracticeGrant;

          this.currentGrant = grant;
          this.leadSaved = true;
          this.workspaceUnlocked = true;

          this.persistLead();
          this.persistGrant(grant);

          this.showLeadModal = false;
          this.showToast('Registration completed. Your practice access is ready.');

          this.pendingItem = null;

          if (item.type === 'ASSESSMENT') {
            this.router.navigate(['/free-mock-tests', 'assessment', item.id]);
            return;
          }

          this.router.navigate(['/free-mock-tests', 'challenge', item.id]);
        },
        error: (err) => {
          this.submitting = false;

          const message =
            err?.error?.message ||
            err?.error?.error ||
            err?.message ||
            'Unable to complete registration';

          if (err?.status === 403 || err?.status === 400) {
            this.workspaceUnlocked = false;
            this.currentGrant = null;
            this.showLeadModal = false;
            this.showToast(message);
            return;
          }

          this.showToast(message);
        },
      });
  }

  loadAssessment(id: number): void {
    this.mode = 'ASSESSMENT';
    this.assessmentId = id;
    this.loading = true;
    this.currentGrant = this.restoreGrant('ASSESSMENT', id);
    this.workspaceUnlocked = this.canUseWorkspace;
    this.publicPracticeService.getAssessment(id).subscribe({
      next: (res: any) => {
        this.assessment = res?.data;
        const access = this.itemAccessLevel(this.assessment);

        if (this.canUseWorkspace) {
          this.workspaceUnlocked = true;
        } else if (this.isPremiumItem(this.assessment) || this.isAccountOnlyItem(this.assessment)) {
          if (this.isLoggedIn) {
            this.unlockAuthenticatedAccess({
              ...this.assessment,
              id,
              type: 'ASSESSMENT',
            });
            return;
          }

          this.loading = false;

          if (this.isPremiumItem(this.assessment)) {
            this.router.navigate(['/pricing-plans'], {
              queryParams: {
                redirect: `/free-mock-tests/assessment/${id}`,
                unlock: 'assessment',
                practiceId: id,
              },
            });
            return;
          }

          this.router.navigate(['/login'], {
            queryParams: {
              redirect: `/free-mock-tests/assessment/${id}`,
            },
          });
          return;
        }
        if (!this.isLeadRequired(this.assessment)) {
          this.workspaceUnlocked = false;
          this.showLeadModal = false;
          this.showToast(this.accessPolicyMessage(this.assessment));
          this.router.navigate(['/free-mock-tests']);
          return;
        }
        this.answers = (this.assessment?.questions || []).map((q: any) => ({
          questionId: q.id,
          selectedAnswer: '',
        }));

        this.currentQuestionIndex = 0;
        this.assessmentResult = null;
        this.loading = false;

        if (!this.canUseWorkspace) {
          this.workspaceUnlocked = false;

          if (this.isLoggedIn) {
            this.unlockAuthenticatedAccess({
              ...this.assessment,
              id,
              type: 'ASSESSMENT',
            });
            return;
          }

          this.pendingItem = {
            ...this.assessment,
            id,
            type: 'ASSESSMENT',
          };

          this.lead.interest =
            `${this.assessment?.company || ''} ${this.assessment?.title || ''} Mock Test`.trim();

          this.rememberPublicPracticeRedirect();
          this.showLeadModal = true;
          return;
        }

        this.workspaceUnlocked = true;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load mock test');
      },
    });
  }

  selectAnswer(option: OptionKey): void {
    if (!this.answers[this.currentQuestionIndex]) return;
    this.answers[this.currentQuestionIndex].selectedAnswer = option;
  }

  clearAnswer(): void {
    if (!this.answers[this.currentQuestionIndex]) return;
    this.answers[this.currentQuestionIndex].selectedAnswer = '';
  }

  goPrevious(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goNext(): void {
    if (
      this.assessment?.questions &&
      this.currentQuestionIndex < this.assessment.questions.length - 1
    ) {
      this.currentQuestionIndex++;
    }
  }

  goToQuestion(index: number): void {
    if (index < 0 || index >= this.assessment.questions.length) return;
    this.currentQuestionIndex = index;
  }

  goToNextUnanswered(): void {
    const next = this.answers.findIndex((answer, index) => {
      return index > this.currentQuestionIndex && !answer.selectedAnswer;
    });

    if (next > -1) {
      this.currentQuestionIndex = next;
      return;
    }

    const first = this.answers.findIndex((answer) => !answer.selectedAnswer);

    if (first > -1) {
      this.currentQuestionIndex = first;
      return;
    }

    this.showToast('All questions are answered');
  }

  submitAssessment(): void {
    if (!this.canUseWorkspace || !this.workspaceUnlocked) {
      this.requestWorkspaceAccess(
        'Please fill the registration form before submitting the mock test',
      );
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .submitAssessment(this.assessmentId, {
        accessToken: this.currentGrant?.accessToken,
        answers: this.answers,
      })
      .subscribe({
        next: (res: any) => {
          this.assessmentResult = res?.data;
          this.submitting = false;

          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }

          this.showToast('Mock test submitted successfully');
        },
        error: (err) => {
          this.submitting = false;

          const message = err?.error?.message || err?.error?.error || 'Submission failed';

          if (err?.status === 403) {
            this.clearGrant('ASSESSMENT', this.assessmentId);
            this.currentGrant = null;
            this.workspaceUnlocked = false;
            this.requestWorkspaceAccess(message);
            return;
          }

          this.showToast(message);
        },
      });
  }

  loadChallenge(id: number): void {
    this.mode = 'CHALLENGE';
    this.challengeId = id;
    this.loading = true;

    this.currentGrant = this.restoreGrant('CHALLENGE', id);
    this.workspaceUnlocked = this.canUseWorkspace;

    this.publicPracticeService.getChallenge(id).subscribe({
      next: (res: any) => {
        this.challenge = res?.data;

        const access = String(
          this.challenge?.accessLevel || this.challenge?.publicAccessLevel || 'LEAD_REQUIRED',
        ).toUpperCase();

        const premiumLevels = ['PAID_STUDENT_ONLY', 'PREMIUM', 'PRO_ONLY', 'ELITE_ONLY'];

        if (this.canUseWorkspace) {
          this.prepareChallengeWorkspace();
          this.workspaceUnlocked = true;
          this.loading = false;
          return;
        }

        if (premiumLevels.includes(access)) {
          if (this.isLoggedIn) {
            this.unlockAuthenticatedAccess({
              ...this.challenge,
              id,
              type: 'CHALLENGE',
            });
            return;
          }

          this.loading = false;
          this.router.navigate(['/pricing-plans'], {
            queryParams: {
              redirect: `/free-mock-tests/challenge/${id}`,
              unlock: 'premium-challenge',
              challengeId: id,
            },
          });
          return;
        }

        if (!this.isLeadRequired(this.challenge)) {
          this.loading = false;
          this.workspaceUnlocked = false;
          this.showLeadModal = false;
          this.showToast(this.accessPolicyMessage(this.challenge));
          this.router.navigate(['/free-mock-tests']);
          return;
        }

        if (this.isLoggedIn) {
          this.unlockAuthenticatedAccess({
            ...this.challenge,
            id,
            type: 'CHALLENGE',
          });
          return;
        }

        this.prepareChallengeWorkspace();
        this.workspaceUnlocked = false;
        this.loading = false;

        this.pendingItem = {
          ...this.challenge,
          id,
          type: 'CHALLENGE',
        };

        this.lead.interest =
          `${this.challenge?.company || ''} ${this.challenge?.title || ''} Coding Challenge`.trim();

        this.rememberPublicPracticeRedirect();
        this.showLeadModal = true;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load coding challenge');
      },
    });
  }

  onLanguageChange(): void {
    const nextStarter = this.getStarterCode(this.language);

    if (!this.sourceCode.trim() || this.sourceCode === this.lastStarterCode) {
      this.sourceCode = nextStarter;
      this.lastStarterCode = nextStarter;
    }
  }

  resetCode(): void {
    this.sourceCode = this.getStarterCode(this.language);
    this.lastStarterCode = this.sourceCode;
  }

  runChallenge(): void {
    if (!this.canUseWorkspace || !this.workspaceUnlocked) {
      this.requestWorkspaceAccess(
        'Please fill the registration form before running this challenge',
      );
      return;
    }

    if (!this.sourceCode.trim()) {
      this.showToast('Please write your code before running');
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .runChallenge(this.challengeId, {
        accessToken: this.currentGrant?.accessToken,
        language: this.language,
        sourceCode: this.sourceCode,
      })
      .subscribe({
        next: (res: any) => {
          this.challengeResult = res?.data;
          this.submitting = false;
          this.showToast('Challenge evaluated');
        },
        error: (err) => {
          this.submitting = false;

          const message = err?.error?.message || err?.error?.error || 'Challenge run failed';

          if (err?.status === 403) {
            this.clearGrant('CHALLENGE', this.challengeId);
            this.currentGrant = null;
            this.workspaceUnlocked = false;
            this.requestWorkspaceAccess(message);
            return;
          }

          this.showToast(message);
        },
      });
  }

  startLoginRedirectCountdown(message: string): void {
    this.rememberPublicPracticeRedirect();
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }

    this.redirectSeconds = 5;
    this.redirectMessage = `${message} Redirecting to login in ${this.redirectSeconds} seconds...`;

    this.redirectTimer = setInterval(() => {
      this.redirectSeconds--;

      if (this.redirectSeconds <= 0) {
        clearInterval(this.redirectTimer);
        this.redirectTimer = undefined;
        this.redirectMessage = '';

        this.router.navigate(['/login'], {
          queryParams: {
            redirect: this.router.url,
            phone: this.lead.phone,
          },
        });
        return;
      }

      this.redirectMessage = `${message} Redirecting to login in ${this.redirectSeconds} seconds...`;
    }, 1000);
  }

  get hintSteps(): string[] {
    const text = String(this.selectedChallenge?.hintText || '').trim();
    if (!text) return [];

    return text
      .split(/\r?\n/)
      .map((step) => step.replace(/^\s*(?:step\s*)?\d+[\).:-]?\s*/i, '').trim())
      .filter(Boolean);
  }

  get hintButtonLabel(): string {
    if (this.hintUnlocked) return this.showHintPanel ? 'Hide Hint' : 'Show Hint';
    return `Hint unlocks in ${this.hintUnlockSeconds}s`;
  }

  startHintUnlockTimer(): void {
    clearInterval(this.hintUnlockTimer);
    this.hintUnlocked = false;
    this.showHintPanel = false;
    this.hintUnlockSeconds = 30;

    this.hintUnlockTimer = setInterval(() => {
      this.hintUnlockSeconds--;

      if (this.hintUnlockSeconds <= 0) {
        clearInterval(this.hintUnlockTimer);
        this.hintUnlockSeconds = 0;
        this.hintUnlocked = true;
      }
    }, 1000);
  }

  toggleHintPanel(): void {
    if (!this.hintUnlocked) return;
    this.showHintPanel = !this.showHintPanel;
  }

  getStarterCode(language: string): string {
    const starters: Record<string, string> = {
      PYTHON: `# Read input from STDIN and print output to STDOUT

value = input().strip()
print(value)`,

      JAVA: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String value = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(value);

        sc.close();
    }
}`,

      C: `#include <stdio.h>

int main() {
    char value[1000];

    if (fgets(value, sizeof(value), stdin) != NULL) {
        printf("%s", value);
    }

    return 0;
}`,

      CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string value;
    getline(cin, value);

    cout << value;

    return 0;
}`,

      TYPESCRIPT: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();
console.log(input);`,

      GO: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    value := ""

    if scanner.Scan() {
        value = scanner.Text()
    }

    fmt.Print(value)
}`,

      RUST: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    println!("{}", input.trim());
}`,

      CSHARP: `using System;

public class Program {
    public static void Main(string[] args) {
        string value = Console.ReadLine() ?? "";
        Console.WriteLine(value);
    }
}`,

      PHP: `<?php
$input = trim(stream_get_contents(STDIN));
echo $input;
?>`,

      RUBY: `value = STDIN.read.strip
puts value`,
    };

    return starters[language] || starters['PYTHON'];
  }

  getOptionValue(options: any, key: OptionKey): string {
    return options?.[key] || '';
  }

  getScoreClass(status: string): string {
    return String(status || '').toLowerCase();
  }

  isLeadRequired(item: any): boolean {
    return (
      String(item?.accessLevel || item?.publicAccessLevel || 'LEAD_REQUIRED').toUpperCase() ===
      'LEAD_REQUIRED'
    );
  }

  accessPolicyMessage(item: any): string {
    const policy = String(item?.accessLevel || item?.publicAccessLevel || '').toUpperCase();

    if (policy === 'PUBLIC_PREVIEW') {
      return 'This item is currently available for preview only. Full attempt is not enabled.';
    }

    if (policy === 'ACCOUNT_REQUIRED') {
      return 'Please login with your account to attempt this practice item.';
    }

    if (policy === 'ENROLLED_STUDENT_ONLY') {
      return 'This practice item is available only for enrolled students.';
    }

    if (policy === 'PAID_STUDENT_ONLY') {
      return 'This practice item is available only for paid students.';
    }

    return 'This practice item is not open for guest registration.';
  }

  companyLogo(company: string): string {
    return this.companyLogos[company] || 'VidhuraTechIcon.png';
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 420, behavior: 'smooth' });
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  backToLibrary(): void {
    this.router.navigate(['/free-mock-tests']);
  }

  private grantStorageKey(type: PracticeType, id: number): string {
    return `practiceGrant_${type}_${id}`;
  }

  private persistGrant(grant: PracticeGrant): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.getUser();
    const isAuthGrant = this.authService.isLoggedIn() && !!user?.id;

    const ownedGrant: PracticeGrant = {
      ...grant,
      ownerMode: isAuthGrant ? 'AUTH' : 'GUEST',
      userId: isAuthGrant ? Number(user.id) : undefined,
    };

    sessionStorage.setItem(
      this.grantStorageKey(grant.practiceType, grant.practiceId),
      JSON.stringify(ownedGrant),
    );
  }

  private restoreGrant(type: PracticeType, id: number): PracticeGrant | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const key = this.grantStorageKey(type, id);
    const saved = sessionStorage.getItem(key);

    if (!saved) return null;

    try {
      const grant = JSON.parse(saved) as PracticeGrant;
      const expiresAt = new Date(grant.expiresAt).getTime();

      if (!grant.accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        sessionStorage.removeItem(key);
        return null;
      }

      const loggedIn = this.authService.isLoggedIn();
      const currentUser = this.authService.getUser();

      if (grant.ownerMode === 'AUTH') {
        if (!loggedIn || Number(currentUser?.id) !== Number(grant.userId)) {
          sessionStorage.removeItem(key);
          return null;
        }
      }

      if (grant.ownerMode === 'GUEST' && loggedIn) {
        sessionStorage.removeItem(key);
        return null;
      }

      return grant;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  private rememberPublicPracticeRedirect(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/free-mock-tests') || currentUrl.startsWith('/coding-contests')) {
      sessionStorage.setItem('publicPracticeRedirect', currentUrl);
    }
  }

  private clearGrant(type: PracticeType, id: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.removeItem(this.grantStorageKey(type, id));
  }

  private persistLead(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem('publicPracticeLead', JSON.stringify(this.lead));
  }

  private restoreLead(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = sessionStorage.getItem('publicPracticeLead');

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      this.lead = { ...this.lead, ...parsed };
      this.leadSaved = false;
    } catch {
      this.leadSaved = false;
    }
  }

  private cleanPhone(phone: string): string {
    return String(phone || '').replace(/\D/g, '');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validateLeadForm(): boolean {
    this.leadErrors = { name: '', phone: '', email: '' };

    const name = this.lead.name.trim();
    const phone = this.cleanPhone(this.lead.phone);
    const email = this.lead.email.trim();

    if (!name) this.leadErrors.name = 'Full name is required';
    if (!phone) this.leadErrors.phone = 'Phone number is required';
    else if (phone.length < 10) this.leadErrors.phone = 'Enter a valid phone number';
    if (email && !this.isValidEmail(email)) this.leadErrors.email = 'Enter a valid email address';

    if (this.leadErrors.name || this.leadErrors.phone || this.leadErrors.email) {
      this.showToast('Please correct the highlighted fields');
      return false;
    }

    this.lead.phone = phone;
    return true;
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }
}
