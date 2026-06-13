import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicPracticeService } from '../../../services/public-practice.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

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

interface CompilerDiagnostic {
  line: number | null;
  column: number | null;
  message: string;
  raw: string;
}

@Component({
  selector: 'app-public-practice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MonacoEditorModule],
  templateUrl: './public-practice.html',
  styleUrls: ['./public-practice.css'],
})
export class PublicPracticeComponent implements OnInit, OnDestroy {
  compilerDiagnostics: CompilerDiagnostic[] = [];
  localDiagnostics: CompilerDiagnostic[] = [];

  private editorInstance: any;
  private monacoInstance: any;
  private diagnosticHoverDisposable: any;
  private cursorHoverDisposable: any;
  private hoverTimer: any;

  editorOptions = {
    language: 'python',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 15,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 4,
    insertSpaces: true,
    lineNumbers: 'on',
    glyphMargin: true,
    folding: true,
    bracketPairColorization: { enabled: true },
    renderValidationDecorations: 'on',
    contextmenu: true,
    quickSuggestions: { other: true, comments: false, strings: false },
    suggestOnTriggerCharacters: true,
    parameterHints: { enabled: true },
    hover: { enabled: true, delay: 100, sticky: true },
    fixedOverflowWidgets: false,
    mouseWheelScrollSensitivity: 1,
    fastScrollSensitivity: 5,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      alwaysConsumeMouseWheel: false,
    },
  };

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

  readonly maxSourceChars = 20000;
  readonly maxSourceLines = 600;

  readonly blockedCodePatterns: Record<string, string[]> = {
    PYTHON: [
      '\\bimport\\s+os\\b',
      '\\bfrom\\s+os\\s+import\\b',
      '\\bimport\\s+subprocess\\b',
      '\\bfrom\\s+subprocess\\s+import\\b',
      '\\bimport\\s+socket\\b',
      '\\bfrom\\s+socket\\s+import\\b',
      '\\bimport\\s+requests\\b',
      '\\bimport\\s+urllib\\b',
      '\\bfrom\\s+urllib\\s+import\\b',
      '\\bimport\\s+pathlib\\b',
      '\\bfrom\\s+pathlib\\s+import\\b',
      '\\bimport\\s+shutil\\b',
      '\\bfrom\\s+shutil\\s+import\\b',
      '\\bimport\\s+pickle\\b',
      '\\bfrom\\s+pickle\\s+import\\b',
      '\\bopen\\s*\\(',
      '\\beval\\s*\\(',
      '\\bexec\\s*\\(',
      '\\bcompile\\s*\\(',
      '\\b__import__\\s*\\(',
      '\\bglobals\\s*\\(',
      '\\blocals\\s*\\(',
      '\\bvars\\s*\\(',
      '\\bsys\\s*\\.\\s*modules\\b',
      '\\bsys\\s*\\.\\s*path\\b',
      '\\bsys\\s*\\.\\s*argv\\b',
      '\\bsys\\s*\\.\\s*exit\\s*\\(',
      '__dict__',
      '__class__',
      '__mro__',
      '__subclasses__'
    ],
    JAVA: [
      '\\bimport\\s+java\\.io\\.File\\b',
      '\\bimport\\s+java\\.io\\.FileInputStream\\b',
      '\\bimport\\s+java\\.io\\.FileOutputStream\\b',
      '\\bimport\\s+java\\.io\\.RandomAccessFile\\b',
      '\\bimport\\s+java\\.nio\\.file\\.',
      '\\bimport\\s+java\\.net\\.',
      '\\bimport\\s+java\\.lang\\.reflect\\.',
      '\\bRuntime\\s*\\.\\s*getRuntime\\s*\\(',
      '\\bProcessBuilder\\b',
      '\\bSystem\\s*\\.\\s*exit\\s*\\(',
      '\\bClass\\s*\\.\\s*forName\\s*\\(',
      '\\bgetDeclaredMethod\\s*\\(',
      '\\bgetDeclaredField\\s*\\(',
      '\\bsetAccessible\\s*\\(',
      '\\bThread\\s*\\.\\s*sleep\\s*\\(',
      '\\bwhile\\s*\\(\\s*true\\s*\\)',
      '\\bfor\\s*\\(\\s*;\\s*;\\s*\\)'
    ],
    C: [
      '#\\s*include\\s*<\\s*unistd\\.h\\s*>',
      '#\\s*include\\s*<\\s*sys/',
      '#\\s*include\\s*<\\s*dirent\\.h\\s*>',
      '\\bsystem\\s*\\(',
      '\\bpopen\\s*\\(',
      '\\bfopen\\s*\\(',
      '\\bfreopen\\s*\\(',
      '\\bremove\\s*\\(',
      '\\brename\\s*\\(',
      '\\bwhile\\s*\\(\\s*1\\s*\\)',
      '\\bwhile\\s*\\(\\s*true\\s*\\)',
      '\\bfor\\s*\\(\\s*;\\s*;\\s*\\)'
    ],
    CPP: [
      '#\\s*include\\s*<\\s*fstream\\s*>',
      '#\\s*include\\s*<\\s*filesystem\\s*>',
      '#\\s*include\\s*<\\s*unistd\\.h\\s*>',
      '#\\s*include\\s*<\\s*sys/',
      '#\\s*include\\s*<\\s*dirent\\.h\\s*>',
      '\\bsystem\\s*\\(',
      '\\bpopen\\s*\\(',
      '\\bfopen\\s*\\(',
      '\\bfreopen\\s*\\(',
      '\\bremove\\s*\\(',
      '\\brename\\s*\\(',
      '\\bwhile\\s*\\(\\s*true\\s*\\)',
      '\\bfor\\s*\\(\\s*;\\s*;\\s*\\)'
    ],
    CSHARP: [
      '\\busing\\s+System\\.IO\\b',
      '\\busing\\s+System\\.Net\\b',
      '\\busing\\s+System\\.Reflection\\b',
      '\\busing\\s+System\\.Diagnostics\\b',
      '\\bFile\\s*\\.',
      '\\bDirectory\\s*\\.',
      '\\bProcess\\s*\\.',
      '\\bEnvironment\\s*\\.\\s*Exit\\s*\\(',
      '\\bwhile\\s*\\(\\s*true\\s*\\)',
      '\\bfor\\s*\\(\\s*;\\s*;\\s*\\)'
    ],
    FSHARP: [
      '\\bopen\\s+System\\.IO\\b',
      '\\bopen\\s+System\\.Net\\b',
      '\\bopen\\s+System\\.Reflection\\b',
      '\\bopen\\s+System\\.Diagnostics\\b',
      '\\bFile\\.',
      '\\bDirectory\\.',
      '\\bProcess\\.',
      '\\bwhile\\s+true\\s+do\\b'
    ],
    PHP: [
      '\\bshell_exec\\s*\\(',
      '\\bexec\\s*\\(',
      '\\bsystem\\s*\\(',
      '\\bpassthru\\s*\\(',
      '\\bproc_open\\s*\\(',
      '\\bpopen\\s*\\(',
      '\\bfopen\\s*\\(',
      '\\bfile_get_contents\\s*\\(',
      '\\bfile_put_contents\\s*\\(',
      '\\bunlink\\s*\\(',
      '\\beval\\s*\\('
    ],
    RUBY: [
      '\\brequire\\s+[\'"]socket[\'"]',
      '\\brequire\\s+[\'"]open-uri[\'"]',
      '\\brequire\\s+[\'"]fileutils[\'"]',
      '\\bFile\\.',
      '\\bDir\\.',
      '\\bIO\\.',
      '\\bKernel\\.system\\s*\\(',
      '\\bsystem\\s*\\(',
      '\\bexec\\s*\\(',
      '`[^`]*`',
      '\\beval\\s*\\(',
      '\\bloop\\s+do\\b'
    ],
    HASKELL: [
      '\\bimport\\s+System\\.Process\\b',
      '\\bimport\\s+System\\.Directory\\b',
      '\\bimport\\s+System\\.IO\\b',
      '\\bimport\\s+Network\\b',
      '\\bunsafePerformIO\\b'
    ],
    GO: [
      '"os/exec"',
      '"net"',
      '"net/http"',
      '"syscall"',
      '\\bos\\.Open\\s*\\(',
      '\\bos\\.Create\\s*\\(',
      '\\bos\\.Remove\\s*\\(',
      '\\bexec\\.Command\\s*\\(',
      '\\bfor\\s*\\{'
    ],
    RUST: [
      '\\bstd::fs\\b',
      '\\bstd::net\\b',
      '\\bstd::process\\b',
      '\\bstd::env\\b',
      '\\bunsafe\\b',
      '\\bloop\\s*\\{'
    ],
    TYPESCRIPT: [
      '\\bimport\\s+.*\\bfrom\\b',
      '\\brequire\\s*\\(',
      '\\bprocess\\b',
      '\\bchild_process\\b',
      '\\bDeno\\.Command\\b',
      '\\bDeno\\.run\\b',
      '\\bDeno\\.readTextFile\\b',
      '\\bDeno\\.writeTextFile\\b',
      '\\bDeno\\.remove\\b',
      '\\bDeno\\.env\\b',
      '\\bfetch\\s*\\(',
      '\\beval\\s*\\(',
      '\\bFunction\\s*\\(',
      '\\bwhile\\s*\\(\\s*true\\s*\\)',
      '\\bfor\\s*\\(\\s*;\\s*;\\s*\\)'
    ]
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

  leftTab: 'problem' | 'submissions' | 'discussions' = 'problem';
  consoleExpanded = true;
  activeConsoleTab: 'samples' | 'results' = 'samples';

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

  challengeDiscussions: any[] = [];
  discussionText = '';
  discussionLoading = false;
  discussionPosting = false;

  challengeSubmissions: any[] = [];
  submissionsLoading = false;
  expandedSubmissionId: number | null = null;
  activeDiscussionMenuId: number | null = null;
  replyingToDiscussionId: number | null = null;
  discussionReplyText = '';
  reportingDiscussionIds: Record<number, boolean> = {};
  blockingDiscussionIds: Record<number, boolean> = {};
  editorError = '';
  editorValidationErrors: string[] = [];

  private readonly shellCommandPattern =
    /^(find|cat|ls|pwd|whoami|id|uname|ps|env|printenv|curl|wget|nc|netcat|bash|sh|zsh|python|python3|perl|ruby)\b/i;
  hasUnsavedChanges = false;
  draftSavedAt = '';
  private draftSaveTimer?: ReturnType<typeof setTimeout>;

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

  planAccessLoading = false;
  planAccess: any = {
    loggedIn: false,
    active: false,
  };

  constructor(
    private publicPracticeService: PublicPracticeService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit(): void {
    this.restoreLead();
    this.loadMyPlanAccess();
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

  ngOnDestroy(): void {
    clearInterval(this.hintUnlockTimer);
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
    clearTimeout(this.draftSaveTimer);
    clearTimeout(this.hoverTimer);
    this.diagnosticHoverDisposable?.dispose?.();
    this.cursorHoverDisposable?.dispose?.();
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
    this.lastStarterCode = this.sourceCode;
    this.challengeResult = null;
    this.editorError = '';
    this.hasUnsavedChanges = false;
    this.draftSavedAt = '';

    this.restoreDraftLocally();
    this.startHintUnlockTimer();

    setTimeout(() => {
      this.syncEditorValue();
      this.applyCompilerErrors('');
      this.validateCode();
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadMyPlanAccess(): void {
    this.planAccessLoading = true;

    this.publicPracticeService.getMyPlanAccess().subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};

        this.planAccess = {
          loggedIn: !!data.loggedIn,
          active: !!data.active,
          accessPremiumChallenges: !!data.accessPremiumChallenges,
          plans: data.plans || [],
        };

        this.planAccessLoading = false;

        if (this.mode === 'CHALLENGE' && this.challengeId && this.canViewBestAnswers()) {
          this.loadChallengeSubmissions(this.challengeId);
        }
      },
      error: () => {
        this.planAccess = {
          loggedIn: false,
          active: false,
        };

        this.planAccessLoading = false;
      },
    });
  }

  canViewBestAnswers(): boolean {
    return !!(this.planAccess?.loggedIn && this.planAccess?.active);
  }

  unlockBestAnswers(): void {
    this.router.navigate(['/pricing-plans'], {
      queryParams: {
        redirect: this.router.url,
        unlock: 'best-answers',
        challengeId: this.challengeId,
      },
    });
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

            this.router.navigate(['/practice', 'assessment', item.id]);
            return;
          }

          if (type === 'CHALLENGE') {
            if (this.mode === 'CHALLENGE' && this.challengeId === Number(item.id)) {
              this.prepareChallengeWorkspace();
              this.workspaceUnlocked = true;
              this.loading = false;
              return;
            }

            this.router.navigate(['/practice', 'challenge', item.id]);
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
        this.router.navigate(['/practice', 'assessment', item.id]);
        return;
      }

      if (type === 'CHALLENGE') {
        this.router.navigate(['/practice', 'challenge', item.id]);
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
            this.router.navigate(['/practice', 'assessment', item.id]);
            return;
          }

          this.router.navigate(['/practice', 'challenge', item.id]);
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
                redirect: `/practice/assessment/${id}`,
                unlock: 'assessment',
                practiceId: id,
              },
            });
            return;
          }

          this.router.navigate(['/login'], {
            queryParams: {
              redirect: `/practice/assessment/${id}`,
            },
          });
          return;
        }
        if (!this.isLeadRequired(this.assessment)) {
          this.workspaceUnlocked = false;
          this.showLeadModal = false;
          this.showToast(this.accessPolicyMessage(this.assessment));
          this.router.navigate(['/practice']);
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
        this.loadChallengeDiscussions(id);
        if (this.canViewBestAnswers()) {
          this.loadChallengeSubmissions(id);
        } else {
          this.challengeSubmissions = [];
        }

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
              redirect: `/practice/challenge/${id}`,
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
          this.router.navigate(['/practice']);
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

    this.editorError = '';
    this.challengeResult = null;
    this.editorValidationErrors = [];

    setTimeout(() => {
      this.syncEditorValue();

      if (this.monacoInstance && this.editorInstance?.getModel()) {
        this.monacoInstance.editor.setModelLanguage(
          this.editorInstance.getModel(),
          this.editorLanguage,
        );
      }

      this.registerDiagnosticHoverProvider();
      this.registerDiagnosticCursorHover();

      this.applyCompilerErrors('');
      this.validateCode();
    });
  }

  get editorLanguage(): string {
    const map: Record<string, string> = {
      JAVA: 'java',
      PYTHON: 'python',
      C: 'c',
      CPP: 'cpp',
      CSHARP: 'csharp',
      PHP: 'php',
      RUBY: 'ruby',
      GO: 'go',
      RUST: 'rust',
      TYPESCRIPT: 'typescript',
    };

    return map[this.language] || 'python';
  }

  onEditorInit(editor: any): void {
    this.editorInstance = editor;
    this.monacoInstance = (window as any).monaco;

    editor.updateOptions({
      fixedOverflowWidgets: false,
      hover: { enabled: true, delay: 80, sticky: true },
      renderValidationDecorations: 'on',
    });

    this.syncEditorValue();

    if (this.monacoInstance && editor.getModel()) {
      this.monacoInstance.editor.setModelLanguage(editor.getModel(), this.editorLanguage);
    }

    this.registerDiagnosticHoverProvider();
    this.registerDiagnosticCursorHover();

    editor.onDidChangeModelContent(() => {
      this.sourceCode = editor.getValue();
      this.challengeResult = null;
      this.validateCode();
    });

    setTimeout(() => {
      editor.layout();
      editor.focus();
      this.validateCode();
    });
  }

  goToDiagnostic(error: CompilerDiagnostic): void {
    if (!error.line || !this.editorInstance) return;
    this.editorInstance.revealLineInCenter(error.line);
    this.editorInstance.setPosition({ lineNumber: error.line, column: error.column || 1 });
    this.editorInstance.focus();
  }

  validateCode(): void {
    this.editorValidationErrors = this.collectEditorValidationErrors();
    this.localDiagnostics = this.collectLocalDiagnostics();

    const validationDiagnostics: CompilerDiagnostic[] = this.editorValidationErrors.map((message) => ({
      line: null,
      column: null,
      message,
      raw: message,
    }));

    this.compilerDiagnostics = [...validationDiagnostics, ...this.localDiagnostics];

    if (!this.editorInstance || !this.monacoInstance) return;

    const model = this.editorInstance.getModel();
    const sourceLines = this.sourceCode.split('\n');
    this.monacoInstance.editor.setModelMarkers(model, 'public-validation', []);

    const markers = this.localDiagnostics.map((item) => {
      const lineNumber = item.line || 1;
      const lineText = sourceLines[lineNumber - 1] || '';
      const startColumn = item.column || 1;
      const matchLength = item.raw ? item.raw.length : (lineText.length - startColumn + 1);
      const endColumn = Math.max(startColumn + 1, Math.min(startColumn + matchLength, lineText.length + 1));

      return {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn,
        endColumn,
        message: item.message,
        severity: this.monacoInstance.MarkerSeverity.Error,
        source: 'Compiler Diagnostics',
      };
    });

    this.monacoInstance.editor.setModelMarkers(model, 'public-validation', markers);

    if (!markers.length) {
      this.compilerDiagnostics = [];
      this.monacoInstance.editor.setModelMarkers(model, 'compiler', []);
    }
  }

  applyCompilerErrors(error?: string): void {
    const compilerItems = this.extractCompilerDiagnostics(error);
    const isGenericCompilerError =
      !!error && /internal error|code execution failed|execution failed/i.test(error);

    this.compilerDiagnostics =
      compilerItems.length && !isGenericCompilerError
        ? compilerItems
        : this.localDiagnostics.length
          ? this.localDiagnostics
          : compilerItems;

    if (!this.editorInstance || !this.monacoInstance) return;

    const model = this.editorInstance.getModel();

    if (!this.compilerDiagnostics.length) {
      this.monacoInstance.editor.setModelMarkers(model, 'compiler', []);
      return;
    }

    const markers = this.compilerDiagnostics.map((item) => ({
      startLineNumber: item.line || 1,
      endLineNumber: item.line || 1,
      startColumn: item.column || 1,
      endColumn: 999,
      message: item.message,
      severity: this.monacoInstance.MarkerSeverity.Error,
      source: 'Compiler Diagnostics',
    }));

    this.monacoInstance.editor.setModelMarkers(model, 'compiler', markers);
    const first = this.compilerDiagnostics.find((item) => item.line);
    if (first?.line) this.editorInstance.revealLineInCenter(first.line);
  }

  private syncEditorValue(): void {
    if (!this.editorInstance) return;
    if (this.editorInstance.getValue() !== this.sourceCode) {
      this.editorInstance.setValue(this.sourceCode || '');
    }
    setTimeout(() => {
      this.editorInstance?.layout?.();
      this.editorInstance?.focus?.();
    });
  }

  private collectLocalDiagnostics(): CompilerDiagnostic[] {
    const diagnostics: CompilerDiagnostic[] = [];
    const lines = this.sourceCode.split('\n');
    if (this.language === 'PYTHON') this.collectPythonDiagnostics(lines, diagnostics);
    if (this.language === 'JAVA') this.collectJavaDiagnostics(lines, diagnostics);

    const security = this.collectSecurityDiagnostics(this.sourceCode, this.language);
    diagnostics.push(...security);

    return diagnostics;
  }

  private collectPythonDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[]): void {
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;
      if (!trimmed || trimmed.startsWith('#')) return;

      if (
        /=\s*.+:\s*$/.test(trimmed) &&
        !/^(if|elif|while|for|def|class|try|except|finally|with)\b/.test(trimmed)
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.lastIndexOf(':') + 1,
          message: 'SyntaxError: invalid syntax. Remove the extra ":" at the end.',
          raw: line,
        });
      }

      if (
        /^(if|elif|else|for|while|def|class|try|except|finally|with)\b/.test(trimmed) &&
        !trimmed.endsWith(':')
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.length + 1,
          message: 'SyntaxError: expected ":" at the end of this block statement.',
          raw: line,
        });
      }

      if (
        trimmed.endsWith(':') &&
        lines[index + 1]?.trim() &&
        !lines[index + 1].startsWith(' ') &&
        !lines[index + 1].startsWith('\t')
      ) {
        diagnostics.push({
          line: lineNumber + 1,
          column: 1,
          message: 'IndentationError: expected an indented block after ":".',
          raw: lines[index + 1],
        });
      }

      if (line.includes(';')) {
        const afterSemicolon = line.split(';').slice(1).join(';').trim();
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(afterSemicolon)) {
          diagnostics.push({
            line: lineNumber,
            column: line.indexOf(afterSemicolon) + 1,
            message: `NameError: name '${afterSemicolon}' is not defined.`,
            raw: line,
          });
        }
      }

      const stringDiagnostic = this.getUnclosedStringDiagnostic(line, lineNumber);
      if (stringDiagnostic) diagnostics.push(stringDiagnostic);

      this.addBracketDiagnostics(line, lineNumber, diagnostics, 'SyntaxError');
    });
  }

  private collectJavaDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[]): void {
    let braceBalance = 0;
    const code = lines.join('\n');
    const hasScannerImport = /import\s+java\.util\.(Scanner|\*)\s*;/.test(code);
    const usesScanner = /\bScanner\b/.test(code);
    const hasMainClass = /public\s+class\s+Main\b/.test(code);
    const mainLine = Math.max(1, lines.findIndex((line) => line.includes('class Main')) + 1 || 1);
    const hasMainMethod = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\]\s+\w+\s*\)/.test(
      code,
    );

    if (code.trim() && !hasMainClass) {
      diagnostics.push({
        line: 1,
        column: 1,
        message:
          'Line 1: Java compile error: Online compiler expects `public class Main` in Main.java.',
        raw: lines[0] || '',
      });
    }

    if (code.trim() && !hasMainMethod) {
      diagnostics.push({
        line: mainLine,
        column: 1,
        message: `Line ${mainLine}: Java compile error: missing \`public static void main(String[] args)\` method.`,
        raw: '',
      });
    }

    if (usesScanner && !hasScannerImport) {
      const scannerLine = lines.findIndex((line) => /\bScanner\b/.test(line)) + 1;
      diagnostics.push({
        line: scannerLine || 1,
        column: 1,
        message: `Line ${scannerLine || 1}: Java compile error: Scanner requires \`import java.util.*;\` or \`import java.util.Scanner;\`.`,
        raw: lines[scannerLine - 1] || '',
      });
    }

    lines.forEach((line, index) => {
      const withoutString = this.stripStrings(line);
      const trimmed = withoutString.trim();
      const realTrimmed = line.trim();
      const lineNumber = index + 1;
      if (!realTrimmed || realTrimmed.startsWith('//') || realTrimmed.startsWith('*')) return;

      if (/\bsystem\.out\b/.test(realTrimmed)) {
        diagnostics.push({
          line: lineNumber,
          column: line.indexOf('system') + 1,
          message: `Line ${lineNumber}: Java compile error: use \`System.out\`, not \`system.out\`.`,
          raw: line,
        });
      }

      const skipSemicolon =
        !trimmed ||
        trimmed.startsWith('import ') ||
        trimmed.startsWith('package ') ||
        trimmed.startsWith('public class') ||
        trimmed.startsWith('class ') ||
        trimmed.endsWith('{') ||
        trimmed.endsWith('}') ||
        trimmed.endsWith(';') ||
        trimmed.startsWith('if') ||
        trimmed.startsWith('else') ||
        trimmed.startsWith('for') ||
        trimmed.startsWith('while') ||
        trimmed.startsWith('switch') ||
        trimmed.startsWith('try') ||
        trimmed.startsWith('catch') ||
        trimmed.startsWith('finally');

      const looksLikeJavaStatement =
        /\b(int|long|double|float|boolean|char|String|Scanner|var)\s+\w+/.test(trimmed) ||
        /\w+\s*=/.test(trimmed) ||
        /^return\b/.test(trimmed) ||
        /\w+\s*\(.*\)/.test(trimmed) ||
        trimmed.includes('System.out.print');

      if (!skipSemicolon && looksLikeJavaStatement) {
        diagnostics.push({
          line: lineNumber,
          column: line.length + 1,
          message: `Line ${lineNumber}: Java compile error: ';' expected at the end of this statement.`,
          raw: line,
        });
      }

      braceBalance += (withoutString.match(/{/g) || []).length;
      braceBalance -= (withoutString.match(/}/g) || []).length;

      if (braceBalance < 0) {
        diagnostics.push({
          line: lineNumber,
          column: line.indexOf('}') + 1,
          message: `Line ${lineNumber}: Java compile error: unmatched closing brace \`}\`.`,
          raw: line,
        });
        braceBalance = 0;
      }

      this.addBracketDiagnostics(line, lineNumber, diagnostics, 'Java compile error');
    });

    if (braceBalance > 0) {
      diagnostics.push({
        line: lines.length,
        column: Math.max(1, lines[lines.length - 1]?.length || 1),
        message: `Line ${lines.length}: Java compile error: missing closing brace \`}\`.`,
        raw: lines[lines.length - 1] || '',
      });
    }
  }

  private getUnclosedStringDiagnostic(line: string, lineNumber: number): CompilerDiagnostic | null {
    let quote: '"' | "'" | null = null;
    let quoteColumn = 0;
    let escaped = false;

    for (let index = 0; index < line.length; index++) {
      const char = line[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && !quote) {
        quote = char;
        quoteColumn = index + 1;
        continue;
      }

      if (char === quote) {
        quote = null;
        quoteColumn = 0;
      }
    }

    if (!quote) return null;

    return {
      line: lineNumber,
      column: quoteColumn,
      message: `SyntaxError: unterminated string literal. Add the closing ${quote}.`,
      raw: line,
    };
  }

  private addBracketDiagnostics(
    line: string,
    lineNumber: number,
    diagnostics: CompilerDiagnostic[],
    prefix: string,
  ): void {
    const withoutString = this.stripStrings(line);
    const openParen = (withoutString.match(/\(/g) || []).length;
    const closeParen = (withoutString.match(/\)/g) || []).length;
    const openSquare = (withoutString.match(/\[/g) || []).length;
    const closeSquare = (withoutString.match(/\]/g) || []).length;

    if (openParen > closeParen) {
      diagnostics.push({
        line: lineNumber,
        column: line.length + 1,
        message: `${prefix}: missing closing ")".`,
        raw: line,
      });
    }

    if (closeParen > openParen) {
      diagnostics.push({
        line: lineNumber,
        column: line.indexOf(')') + 1,
        message: `${prefix}: unmatched ")".`,
        raw: line,
      });
    }

    if (openSquare > closeSquare) {
      diagnostics.push({
        line: lineNumber,
        column: line.length + 1,
        message: `${prefix}: missing closing "]".`,
        raw: line,
      });
    }

    if (closeSquare > openSquare) {
      diagnostics.push({
        line: lineNumber,
        column: line.indexOf(']') + 1,
        message: `${prefix}: unmatched "]".`,
        raw: line,
      });
    }
  }

  private stripStrings(line: string): string {
    return line.replace(/"([^"\\]|\\.)*"/g, '""').replace(/'([^'\\]|\\.)*'/g, "''");
  }

  private extractCompilerDiagnostics(error?: string): CompilerDiagnostic[] {
    if (!error?.trim()) return [];

    const diagnostics: CompilerDiagnostic[] = [];
    const text = error.trim();
    const patterns = [
      /File\s+"[^"]+",\s+line\s+(\d+)(?:,\s*column\s*(\d+))?[\s\S]*?(SyntaxError|IndentationError|NameError|TypeError|ValueError|Error):\s*([^\n]+)/gi,
      /[A-Za-z0-9_.-]+\.(?:java|c|cpp|cc|cs|ts|go|rs|php):(\d+):(?:(\d+):)?\s*(?:error|warning)?:?\s*([^\n]+)/gi,
      /line\s+(\d+)(?:,\s*column\s*(\d+))?\s*[:\-]\s*([^\n]+)/gi,
      /:(\d+):(\d+):\s*(?:error|warning)?:?\s*([^\n]+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text))) {
        const line = Number(match[1]);
        const column = Number(match[2] || 1);
        const message = (match[4] || match[3] || text).trim();

        if (!Number.isNaN(line) && line > 0) {
          diagnostics.push({
            line,
            column: Number.isNaN(column) ? 1 : column,
            message,
            raw: text,
          });
        }
      }
    }

    if (!diagnostics.length) {
      diagnostics.push({ line: null, column: null, message: text, raw: text });
    }

    return diagnostics;
  }

  private registerDiagnosticHoverProvider(): void {
    if (!this.monacoInstance) return;

    this.diagnosticHoverDisposable?.dispose?.();

    this.diagnosticHoverDisposable = this.monacoInstance.languages.registerHoverProvider(
      this.editorLanguage,
      {
        provideHover: (_model: any, position: any) => {
          const diagnostic = this.findDiagnosticAtPosition(position.lineNumber, position.column);
          if (!diagnostic?.line) return null;

          const startColumn = diagnostic.column || 1;
          const endColumn = this.getDiagnosticEndColumn(diagnostic);

          return {
            range: new this.monacoInstance.Range(
              diagnostic.line,
              startColumn,
              diagnostic.line,
              endColumn,
            ),
            contents: [{ value: '**Compiler Diagnostics**' }, { value: diagnostic.message }],
          };
        },
      },
    );
  }

  private registerDiagnosticCursorHover(): void {
    if (!this.editorInstance) return;

    this.cursorHoverDisposable?.dispose?.();

    this.cursorHoverDisposable = this.editorInstance.onDidChangeCursorPosition((event: any) => {
      clearTimeout(this.hoverTimer);

      const diagnostic = this.findDiagnosticAtPosition(
        event.position.lineNumber,
        event.position.column,
      );

      if (!diagnostic) return;

      this.hoverTimer = setTimeout(() => {
        this.editorInstance?.trigger?.('diagnostic-cursor-hover', 'editor.action.showHover', {});
      }, 120);
    });
  }

  private findDiagnosticAtPosition(lineNumber: number, column: number): CompilerDiagnostic | null {
    return (
      this.compilerDiagnostics.find((item) => {
        if (item.line !== lineNumber) return false;

        const startColumn = item.column || 1;
        const endColumn = this.getDiagnosticEndColumn(item);

        return column >= startColumn && column <= endColumn;
      }) || null
    );
  }

  private getDiagnosticEndColumn(diagnostic: CompilerDiagnostic): number {
    if (!diagnostic.line) return 1;

    const lineText = this.sourceCode.split('\n')[diagnostic.line - 1] || '';
    return Math.max((diagnostic.column || 1) + 1, lineText.length + 1);
  }

  get draftKey(): string {
    return `publicChallengeDraft_${this.challengeId}_${this.language}`;
  }

  get visibleSampleTestCases(): any[] {
    return (this.challenge?.sampleTestCases || []).slice(0, 3);
  }

  get resultTestCases(): any[] {
    return this.challengeResult?.testResults || [];
  }

  onCodeChange(): void {
    this.hasUnsavedChanges = this.sourceCode !== this.lastStarterCode;
    this.editorValidationErrors = this.collectEditorValidationErrors();
    this.editorError = '';

    clearTimeout(this.draftSaveTimer);

    this.draftSaveTimer = setTimeout(() => {
      this.saveDraftLocally();
    }, 600);
  }

  saveDraftLocally(): void {
    if (!this.challengeId || !this.sourceCode) return;

    localStorage.setItem(this.draftKey, this.sourceCode);
    this.hasUnsavedChanges = false;
    this.draftSavedAt = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  restoreDraftLocally(): boolean {
    const saved = localStorage.getItem(this.draftKey);

    if (!saved) return false;

    this.sourceCode = saved;
    this.hasUnsavedChanges = false;
    return true;
  }

  clearCode(): void {
    this.sourceCode = '';
    this.challengeResult = null;
    this.editorError = '';
    this.hasUnsavedChanges = true;
    localStorage.removeItem(this.draftKey);
    this.editorValidationErrors = this.collectEditorValidationErrors();
  }

  resetCode(): void {
    this.sourceCode = this.getStarterCode(this.language);
    this.lastStarterCode = this.sourceCode;
    this.challengeResult = null;
    this.editorError = '';
    this.hasUnsavedChanges = false;
    localStorage.removeItem(this.draftKey);
    this.editorValidationErrors = [];
  }

  handleCodeEditorKeydown(event: KeyboardEvent): void {
    const textarea = event.target as HTMLTextAreaElement | null;
    if (!textarea) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      this.handleEditorTab(textarea, event.shiftKey);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleEditorEnter(textarea);
    }
  }

  private handleEditorTab(textarea: HTMLTextAreaElement, outdent: boolean): void {
    const indent = '    ';
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const value = textarea.value || '';

    if (start !== end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const selected = value.slice(lineStart, end);
      const lines = selected.split('\n');

      const updatedLines = outdent
        ? lines.map((line) =>
          line.startsWith(indent) ? line.slice(indent.length) : line.replace(/^\t/, ''),
        )
        : lines.map((line) => `${indent}${line}`);

      const updated = updatedLines.join('\n');
      const nextValue = value.slice(0, lineStart) + updated + value.slice(end);
      const delta = updated.length - selected.length;

      this.updateEditorValue(textarea, nextValue, start, end + delta);
      return;
    }

    if (outdent) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const beforeCursor = value.slice(lineStart, start);

      if (beforeCursor.endsWith(indent)) {
        const removeStart = start - indent.length;
        const nextValue = value.slice(0, removeStart) + value.slice(start);
        this.updateEditorValue(textarea, nextValue, removeStart, removeStart);
      }

      return;
    }

    const nextValue = value.slice(0, start) + indent + value.slice(end);
    this.updateEditorValue(textarea, nextValue, start + indent.length, start + indent.length);
  }

  private handleEditorEnter(textarea: HTMLTextAreaElement): void {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const value = textarea.value || '';
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
    const baseIndent = currentLine.match(/^\s*/)?.[0] || '';
    const trimmed = currentLine.trim();
    const extraIndent = this.shouldIncreaseEditorIndent(trimmed) ? '    ' : '';
    const insertion = `\n${baseIndent}${extraIndent}`;
    const nextValue = value.slice(0, start) + insertion + value.slice(end);
    const cursor = start + insertion.length;

    this.updateEditorValue(textarea, nextValue, cursor, cursor);
  }

  private shouldIncreaseEditorIndent(line: string): boolean {
    if (!line) return false;

    if (String(this.language).toUpperCase() === 'PYTHON') {
      return line.endsWith(':');
    }

    return /[\{\[\(]\s*$/.test(line);
  }

  private updateEditorValue(
    textarea: HTMLTextAreaElement,
    nextValue: string,
    selectionStart: number,
    selectionEnd: number,
  ): void {
    textarea.value = nextValue;
    this.sourceCode = nextValue;
    this.onCodeChange();

    requestAnimationFrame(() => {
      textarea.selectionStart = Math.max(selectionStart, 0);
      textarea.selectionEnd = Math.max(selectionEnd, 0);
    });
  }

  private firstExecutionError(result: any): string {
    const tests = result?.testResults || result?.results || result?.cases || [];

    if (!Array.isArray(tests)) return '';

    const failed = tests.find(
      (item: any) =>
        item?.compileError ||
        item?.compilerError ||
        item?.runtimeError ||
        item?.errorMessage ||
        item?.stderr ||
        item?.error,
    );

    return String(
      failed?.compileError ||
      failed?.compilerError ||
      failed?.runtimeError ||
      failed?.errorMessage ||
      failed?.stderr ||
      failed?.error ||
      '',
    ).trim();
  }

  private compilerErrorFromResult(result: any): string {
    if (typeof result === 'string') return result.trim();
    if (!result) return '';
    return String(
      result?.compileError ||
      result?.compilerError ||
      result?.runtimeError ||
      result?.errorMessage ||
      result?.stderr ||
      result?.error ||
      this.firstExecutionError(result) ||
      '',
    ).trim();
  }

  private collectEditorValidationErrors(): string[] {
    const errors: string[] = [];
    const code = this.sourceCode || '';
    const trimmed = code.trim();
    const language = String(this.language || '').toUpperCase();

    if (!trimmed) {
      errors.push('Source code is required');
      return errors;
    }

    if (!this.languages.includes(language)) {
      errors.push('Unsupported language selected.');
    }

    const security = this.collectSecurityDiagnostics(code, language);
    for (const diag of security) {
      errors.push(diag.message);
    }

    return [...new Set(errors)];
  }

  private collectSecurityDiagnostics(code: string, language: string): CompilerDiagnostic[] {
    const diagnostics: CompilerDiagnostic[] = [];
    const trimmed = (code || '').trim();
    if (!trimmed) {
      return diagnostics;
    }

    if (code.length > this.maxSourceChars) {
      diagnostics.push({
        line: 1,
        column: 1,
        message: `Code is too large. Maximum ${this.maxSourceChars} characters allowed.`,
        raw: ''
      });
    }

    if (code.split(/\r?\n/).length > this.maxSourceLines) {
      diagnostics.push({
        line: 1,
        column: 1,
        message: `Code has too many lines. Maximum ${this.maxSourceLines} lines allowed.`,
        raw: ''
      });
    }

    for (let i = 0; i < code.length; i++) {
      const ch = code.charCodeAt(i);
      if (ch === 10 || ch === 13 || ch === 9) {
        continue;
      }
      if ((ch >= 0 && ch <= 31) || (ch >= 127 && ch <= 159)) {
        const pos = this.getLineAndColumn(code, i);
        diagnostics.push({
          line: pos.line,
          column: pos.column,
          message: 'Code contains invalid control characters.',
          raw: String.fromCharCode(ch)
        });
        break;
      }
    }

    if (this.looksLikeShellCommand(code)) {
      diagnostics.push({
        line: 1,
        column: 1,
        message: 'Shell commands are not allowed in code editor.',
        raw: ''
      });
    }

    const lang = this.normalizeLanguage(language);
    const patterns = this.blockedCodePatterns[lang] || [];
    for (const patternStr of patterns) {
      const regex = new RegExp(patternStr, 'im');
      const match = regex.exec(code);
      if (match) {
        const pos = this.getLineAndColumn(code, match.index);
        diagnostics.push({
          line: pos.line,
          column: pos.column,
          message: `Blocked unsafe code pattern: ${this.readable(patternStr)}`,
          raw: match[0]
        });
      }
    }

    return diagnostics;
  }

  private getLineAndColumn(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split(/\r?\n/);
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  private containsControlCharacters(code: string): boolean {
    for (let i = 0; i < code.length; i++) {
      const ch = code.charCodeAt(i);
      if (ch === 10 || ch === 13 || ch === 9) {
        continue;
      }
      if ((ch >= 0 && ch <= 31) || (ch >= 127 && ch <= 159)) {
        return true;
      }
    }
    return false;
  }

  private normalizeLanguage(language: string): string {
    const value = String(language || '').trim().toUpperCase().replace(/[-_]/g, '');
    switch (value) {
      case 'C++':
      case 'CPLUSPLUS':
        return 'CPP';
      case 'C#':
      case 'CS':
        return 'CSHARP';
      case 'F#':
      case 'FS':
        return 'FSHARP';
      case 'TS':
        return 'TYPESCRIPT';
      default:
        return value;
    }
  }

  private looksLikeShellCommand(code: string): boolean {
    const trimmed = code == null ? '' : code.trim();
    if (!trimmed) {
      return false;
    }

    const firstLine = trimmed.split(/\r?\n/)[0].trim().toLowerCase();
    const pattern = /^(find|cat|ls|pwd|whoami|id|uname|ps|env|printenv|curl|wget|nc|netcat|bash|sh|zsh|python|python3|perl|ruby)\b.*/;

    return pattern.test(firstLine)
      || firstLine.includes('2>/dev/null')
      || firstLine.includes('/etc/passwd')
      || firstLine.includes('/home')
      || firstLine.includes('/proc')
      || firstLine.includes('/root')
      || firstLine.includes('&&')
      || firstLine.includes('||')
      || firstLine.includes(';')
      || firstLine.includes('|');
  }

  private readable(pattern: string): string {
    return pattern
      .replace(/\\b/g, '')
      .replace(/\\s\*/g, ' ')
      .replace(/\\s\+/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\./g, '.')
      .replace(/\\s/g, ' ')
      .replace(/\\/g, '')
      .trim();
  }

  validateSourceCode(): string {
    this.editorValidationErrors = this.collectEditorValidationErrors();
    return this.editorValidationErrors[0] || '';
  }

  get sourceLineCount(): number {
    return (this.sourceCode || '').split(/\r\n|\r|\n/).length;
  }

  get sourceCharCount(): number {
    return (this.sourceCode || '').length;
  }

  get editorSecurityWarning(): string {
    return this.validateSourceCode();
  }

  runChallenge(): void {
    if (!this.canUseWorkspace || !this.workspaceUnlocked) {
      this.requestWorkspaceAccess(
        'Please fill the registration form before running this challenge',
      );
      return;
    }

    this.validateCode();

    if (this.localDiagnostics.length) {
      this.editorError = this.localDiagnostics.map((item) => item.message).join('\n');
      this.challengeResult = {
        status: 'FAIL',
        percentage: 0,
        compileError: this.editorError,
        testResults: [],
      };
      this.applyCompilerErrors(this.editorError);
      this.showToast('Fix highlighted syntax errors before running');
      return;
    }

    if (this.editorValidationErrors.length) {
      this.editorError = '';
      this.showToast('Fix validation errors before running');
      return;
    }

    this.consoleExpanded = true;
    this.activeConsoleTab = 'results';
    this.submitting = true;

    this.publicPracticeService
      .runChallenge(this.challengeId, {
        accessToken: this.currentGrant?.accessToken,
        language: this.language,
        sourceCode: this.sourceCode,
      })
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;
          const compilerError = this.compilerErrorFromResult(data);

          this.challengeResult = compilerError ? { ...data, compileError: compilerError } : data;
          this.editorError = compilerError;
          this.submitting = false;
          this.hasUnsavedChanges = false;

          this.applyCompilerErrors(compilerError);

          const passed =
            this.challengeResult?.status === 'PASS' ||
            this.challengeResult?.allTestsPassed === true;

          if (passed && !compilerError) {
            this.showToast('All test cases passed successfully');
          } else if (compilerError) {
            this.showToast('Compilation failed');
          } else {
            this.showToast('Some test cases failed');
          }

          this.loadChallengeSubmissions();
        },
        error: (err) => {
          this.submitting = false;

          const message = err?.error?.message || err?.error?.error || 'Challenge run failed';

          this.editorError = message;
          this.challengeResult = {
            status: 'FAIL',
            percentage: 0,
            compileError: message,
            testResults: [],
          };

          this.applyCompilerErrors(message);

          if (err?.status === 403) {
            this.clearGrant('CHALLENGE', this.challengeId);
            this.currentGrant = null;
            this.workspaceUnlocked = false;
            this.requestWorkspaceAccess(message);
            return;
          }

          if (err?.status === 0) this.showToast('Unable to connect to compiler server');
          else if (err?.status >= 500) this.showToast('Compiler server error');
          else this.showToast(message);
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
    const text = String(this.challenge?.hintText || this.selectedChallenge?.hintText || '').trim();
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

  discussionPayload(extra: any = {}): any {
    const user = this.authService.getUser?.() || {};

    return {
      accessToken: this.currentGrant?.accessToken || '',
      authorName: this.lead.name || user.name || 'Learner',
      authorEmail: this.lead.email || user.email || '',
      authorProfileImageUrl: this.currentUserProfileImageUrl(),
      profileImageUrl: this.currentUserProfileImageUrl(),
      ...extra,
    };
  }

  safeProfileImageUrl(value: any): string {
    const url = String(value || '').trim();

    if (!url) {
      return '';
    }

    if (url.startsWith('https://')) {
      return url;
    }

    return '';
  }

  currentUserProfileImageUrl(): string {
    const user = this.authService.getUser?.() || {};

    return this.safeProfileImageUrl(
      user.profileImageUrl ||
      user.authorProfileImageUrl ||
      user.userProfileImageUrl ||
      user.avatarUrl ||
      user.photoUrl ||
      user.picture ||
      user.user?.profileImageUrl ||
      user.student?.profileImageUrl ||
      user.author?.profileImageUrl,
    );
  }

  discussionAvatarUrl(item: any): string {
    if (!item || item.__avatarFailed) {
      return '';
    }

    return this.safeProfileImageUrl(
      item.profileImageUrl ||
      item.authorProfileImageUrl ||
      item.userProfileImageUrl ||
      item.avatarUrl ||
      item.photoUrl ||
      item.picture ||
      item.user?.profileImageUrl ||
      item.student?.profileImageUrl ||
      item.author?.profileImageUrl ||
      item.createdByUser?.profileImageUrl,
    );
  }

  discussionInitial(item: any): string {
    const name = String(item?.authorName || item?.name || item?.email || 'Learner').trim();

    if (!name) {
      return 'L';
    }

    return name.charAt(0).toUpperCase();
  }

  markDiscussionAvatarFailed(item: any): void {
    if (item) {
      item.__avatarFailed = true;
    }
  }

  loadChallengeDiscussions(id = this.challengeId): void {
    if (!id) return;

    this.discussionLoading = true;

    this.publicPracticeService.getChallengeDiscussions(id, this.discussionPayload()).subscribe({
      next: (res: any) => {
        this.challengeDiscussions = res?.data || [];
        this.discussionLoading = false;
      },
      error: () => {
        this.challengeDiscussions = [];
        this.discussionLoading = false;
      },
    });
  }

  postChallengeDiscussion(): void {
    const comment = this.discussionText.trim();

    if (!comment) {
      this.showToast('Please write a comment');
      return;
    }

    if (!this.currentGrant?.accessToken && !this.isLoggedIn) {
      this.requestWorkspaceAccess('Please register or login to discuss this challenge');
      return;
    }

    this.discussionPosting = true;

    this.publicPracticeService
      .postChallengeDiscussion(this.challengeId, this.discussionPayload({ comment }))
      .subscribe({
        next: () => {
          this.discussionText = '';
          this.discussionPosting = false;
          this.loadChallengeDiscussions();
          this.showToast('Comment posted');
        },
        error: (err) => {
          this.discussionPosting = false;
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to post comment');
        },
      });
  }

  toggleDiscussionLike(comment: any): void {
    if (!this.currentGrant?.accessToken && !this.isLoggedIn) {
      this.requestWorkspaceAccess('Please register or login to like comments');
      return;
    }

    this.publicPracticeService
      .toggleChallengeDiscussionLike(this.challengeId, Number(comment.id), this.discussionPayload())
      .subscribe({
        next: (res: any) => {
          const updated = res?.data;

          this.challengeDiscussions = this.challengeDiscussions.map((item) =>
            Number(item.id) === Number(updated.id) ? updated : item,
          );
        },
        error: (err) => {
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to update like');
        },
      });
  }

  toggleDiscussionMenu(item: any): void {
    const id = Number(item?.id || 0);
    this.activeDiscussionMenuId = this.activeDiscussionMenuId === id ? null : id;
  }

  closeDiscussionMenu(): void {
    this.activeDiscussionMenuId = null;
  }

  startDiscussionReply(item: any): void {
    if (!this.currentGrant?.accessToken && !this.isLoggedIn) {
      this.requestWorkspaceAccess('Please register or login to reply');
      return;
    }

    this.replyingToDiscussionId = Number(item.id);
    this.discussionReplyText = '';
    this.activeDiscussionMenuId = null;
  }

  cancelDiscussionReply(): void {
    this.replyingToDiscussionId = null;
    this.discussionReplyText = '';
  }

  postDiscussionReply(parent: any): void {
    const comment = this.discussionReplyText.trim();

    if (!comment) {
      this.showToast('Please write a reply');
      return;
    }

    this.discussionPosting = true;

    this.publicPracticeService
      .postChallengeDiscussion(
        this.challengeId,
        this.discussionPayload({
          comment,
          parentId: Number(parent.id),
        }),
      )
      .subscribe({
        next: () => {
          this.cancelDiscussionReply();
          this.discussionPosting = false;
          this.loadChallengeDiscussions();
          this.showToast('Reply posted');
        },
        error: (err) => {
          this.discussionPosting = false;
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to post reply');
        },
      });
  }

  shareDiscussion(item: any): void {
    const url = `${window.location.origin}${window.location.pathname}?challenge=${this.challengeId}&comment=${item.id}`;
    const text = `${item.authorName || 'Learner'} on this coding challenge: ${item.comment || ''}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Challenge discussion',
          text,
          url,
        })
        .catch(() => { });
      return;
    }

    navigator.clipboard
      ?.writeText(url)
      .then(() => this.showToast('Discussion link copied'))
      .catch(() => this.showToast('Copy this link: ' + url));
  }

  reportDiscussion(item: any): void {
    if (!this.currentGrant?.accessToken && !this.isLoggedIn) {
      this.requestWorkspaceAccess('Please register or login to report comments');
      return;
    }

    const id = Number(item.id);
    this.reportingDiscussionIds[id] = true;
    this.activeDiscussionMenuId = null;

    this.publicPracticeService
      .reportChallengeDiscussion(
        this.challengeId,
        id,
        this.discussionPayload({ reason: 'Reported by user' }),
      )
      .subscribe({
        next: (res: any) => {
          const updated = res?.data;
          this.challengeDiscussions = this.patchDiscussionTree(this.challengeDiscussions, updated);
          this.showToast('Comment reported. Our team will review it.');
        },
        error: (err) => {
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to report comment');
        },
        complete: () => {
          this.reportingDiscussionIds[id] = false;
        },
      });
  }

  blockDiscussionAuthor(item: any): void {
    if (!this.currentGrant?.accessToken && !this.isLoggedIn) {
      this.requestWorkspaceAccess('Please register or login to block users');
      return;
    }

    const ok = window.confirm(
      `Block ${item.authorName || 'this user'}? Their comments will be hidden for you.`,
    );

    if (!ok) return;

    const id = Number(item.id);
    this.blockingDiscussionIds[id] = true;
    this.activeDiscussionMenuId = null;

    this.publicPracticeService
      .blockChallengeDiscussionAuthor(this.challengeId, id, this.discussionPayload())
      .subscribe({
        next: () => {
          this.showToast('User blocked');
          this.loadChallengeDiscussions();
        },
        error: (err) => {
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to block user');
        },
        complete: () => {
          this.blockingDiscussionIds[id] = false;
        },
      });
  }

  patchDiscussionTree(list: any[], updated: any): any[] {
    if (!updated?.id) return list;

    return (list || []).map((item) => {
      if (Number(item.id) === Number(updated.id)) {
        return { ...item, ...updated };
      }

      return {
        ...item,
        replies: this.patchDiscussionTree(item.replies || [], updated),
      };
    });
  }

  loadChallengeSubmissions(id = this.challengeId): void {
    if (!id) return;

    this.submissionsLoading = true;

    this.publicPracticeService.getChallengeBestSubmissions(id).subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};
        this.challengeSubmissions = data.entries || [];
        this.submissionsLoading = false;
      },
      error: (err) => {
        this.challengeSubmissions = [];
        this.submissionsLoading = false;

        if (err?.status === 403 || err?.status === 401) {
          this.planAccess.active = false;
        }
      },
    });
  }

  toggleSubmissionAnswer(row: any): void {
    const id = Number(row?.attemptId || row?.id || 0);

    if (!id) return;

    this.expandedSubmissionId = this.expandedSubmissionId === id ? null : id;
  }

  isSubmissionExpanded(row: any): boolean {
    return this.expandedSubmissionId === Number(row?.attemptId || row?.id || 0);
  }

  formatDiscussionTime(value: string): string {
    if (!value) return 'Just now';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  get visibleResultCards(): any[] {
    return (this.resultTestCases || []).slice(0, 3);
  }

  get hiddenResultPills(): any[] {
    return (this.resultTestCases || []).slice(3);
  }

  hiddenTestStatusIcon(item: any): string {
    return String(item?.status || '').toUpperCase() === 'PASS' ? '✓' : '×';
  }

  getStarterCode(language: string): string {
    const starters: Record<string, string> = {
      PYTHON: `import sys

def solve():
    data = sys.stdin.read().strip().split()
    # Write your logic here
    print(" ".join(data))

if __name__ == "__main__":
    solve()`,

      JAVA: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder input = new StringBuilder();
        String line;

        while ((line = br.readLine()) != null) {
            input.append(line).append("\\n");
        }

        // Write your logic here
        System.out.print(input.toString().trim());
    }
}`,

      C: `#include <stdio.h>
#include <string.h>

int main(void) {
    char input[10000];

    while (fgets(input, sizeof(input), stdin) != NULL) {
        // Write your logic here
        printf("%s", input);
    }

    return 0;
}`,

      CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<string> tokens;
    string value;

    while (cin >> value) {
        tokens.push_back(value);
    }

    // Write your logic here
    for (int i = 0; i < (int)tokens.size(); i++) {
        if (i) cout << ' ';
        cout << tokens[i];
    }

    return 0;
}`,

      TYPESCRIPT: `import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();
const tokens = input.length ? input.split(/\\s+/) : [];

// Write your logic here
console.log(tokens.join(" "));`,

      GO: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Buffer(make([]byte, 1024), 1024*1024)

    values := []string{}

    for scanner.Scan() {
        values = append(values, scanner.Text())
    }

    // Write your logic here
    for i, value := range values {
        if i > 0 {
            fmt.Println()
        }
        fmt.Print(value)
    }
}`,

      RUST: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let tokens: Vec<&str> = input.split_whitespace().collect();

    // Write your logic here
    println!("{}", tokens.join(" "));
}`,

      CSHARP: `using System;
using System.Collections.Generic;

public class Program {
    public static void Main() {
        string input = Console.In.ReadToEnd();
        string[] tokens = input.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);

        // Write your logic here
        Console.WriteLine(string.Join(" ", tokens));
    }
}`,

      PHP: `<?php
$input = trim(stream_get_contents(STDIN));
$tokens = $input === "" ? [] : preg_split('/\\s+/', $input);

// Write your logic here
echo implode(" ", $tokens);
?>`,

      RUBY: `input = STDIN.read.strip
tokens = input.empty? ? [] : input.split

# Write your logic here
puts tokens.join(" ")`,
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
    this.router.navigate(['/practice']);
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

    if (currentUrl.startsWith('/practice') || currentUrl.startsWith('/coding-contests')) {
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

  onLeadFieldChange(field: 'name' | 'phone' | 'email'): void {
    switch (field) {
      case 'name': {
        const name = this.lead.name.trim();
        this.leadErrors.name = !name ? 'Full name is required' : name.length < 2 ? 'Name is too short' : '';
        break;
      }
      case 'phone': {
        const phone = this.cleanPhone(this.lead.phone);
        this.leadErrors.phone = !phone ? 'Phone number is required' : phone.length < 10 ? 'Enter a valid 10-digit phone number' : '';
        break;
      }
      case 'email': {
        const email = this.lead.email.trim();
        this.leadErrors.email = email && !this.isValidEmail(email) ? 'Enter a valid email address' : '';
        break;
      }
    }
  }

  getChallengeDifficulty(marks: number): 'Easy' | 'Medium' | 'Hard' {
    if (!marks || marks <= 20) return 'Easy';
    if (marks <= 50) return 'Medium';
    return 'Hard';
  }

  get hasLeadErrors(): boolean {
    return !!(this.leadErrors.name || this.leadErrors.phone || this.leadErrors.email);
  }

  toggleConsole(): void {
    this.consoleExpanded = !this.consoleExpanded;
  }

  switchLeftTab(tab: 'problem' | 'submissions' | 'discussions'): void {
    this.leftTab = tab;
  }

  switchConsoleTab(tab: 'samples' | 'results'): void {
    this.activeConsoleTab = tab;
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }
}
