import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PublicPracticeService } from '../../../services/public-practice.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { GamificationService } from '../../../../services/gamification.service';

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
  serverCompileErrors: CompilerDiagnostic[] = [];
  selectedTheme = 'vs-dark';
  isFullScreen = false;
  attemptingItemId: number | null = null;

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
    quickSuggestions: { other: true, comments: true, strings: true },
    suggestOnTriggerCharacters: true,
    parameterHints: { enabled: true },
    hover: { enabled: true, delay: 100, sticky: true },
    fixedOverflowWidgets: false,
    mouseWheelScrollSensitivity: 1,
    fastScrollSensitivity: 5,
    spellcheck: true,
    autoIndent: 'full' as any,
    acceptSuggestionOnEnter: 'on' as any,
    tabCompletion: 'on' as any,
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
    Amazon: 'logos/amazon.svg',
    Flipkart: 'logos/flipkart.svg',
    CGI: 'logos/cgi-logo.svg',
    Genpact: 'logos/genpact.svg',
    Max: 'logos/max.svg',
    Meta: 'logos/meta.svg',
    Myntra: 'logos/myntra.svg',
    PwC: 'logos/pwc.svg',
    Salesforce: 'logos/salesforce.svg',
    'Tech Mahindra': 'logos/tech-mahindra.svg',
    Google: 'logos/google.svg',
    // Matches from public/logos folder
    Adobe: 'logos/adobe-svgrepo-com.svg',
    Adyen: 'logos/adyen-svgrepo-com.svg',
    AMD: 'logos/amd-svgrepo-com.svg',
    Apple: 'logos/apple.svg',
    'Azure DevOps': 'logos/azure deops.svg',
    ByteDance: 'logos/bytedance.svg',
    Capgemini: 'logos/capgemini.svg',
    Cisco: 'logos/cisco.svg',
    DigitalOcean: 'logos/digital ocean.svg',
    Facebook: 'logos/facebook.svg',
    'Goldman Sachs': 'logos/goldman sachs.svg',
    'Juniper Networks': 'logos/juniper networks.svg',
    Kubernetes: 'logos/kubernetes.svg',
    LinkedIn: 'logos/linkedin.svg',
    MakeMyTrip: 'logos/make my trip.svg',
    Netflix: 'logos/netflix.svg',
    Oracle: 'logos/oracle.svg',
    Palantir: 'logos/palantir.svg',
    PayPal: 'logos/paypal.svg',
    Qualcomm: 'logos/qualcomm.svg',
    'Societe Generale': 'logos/societe generale.svg',
    Splunk: 'logos/splunk.svg',
    Twitter: 'logos/twitter.svg',
    Uber: 'logos/uber.svg',
    YouTube: 'logos/youtube.svg',
    'L&T Infotech': 'logos/L&T infotech.jpg',
    Directi: 'logos/directi.jpeg',
    EPAM: 'logos/epam.png',
    'Morgan Stanley': 'logos/morgan stanley.jpeg',
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
  loginHistory: string[] = [];
  showStreakCalendar = true;
  calendarMonth = new Date().getMonth();
  calendarYear = new Date().getFullYear();
  leaderboardRankValue = 0;
  leaderboardTotalValue = 0;

  assessments: any[] = [];
  challenges: any[] = [];
  companies: string[] = [];
  skills: string[] = [];

  search = '';
  selectedCompany = 'ALL';
  selectedSkill = 'ALL';
  selectedType: 'ALL' | PracticeType = 'ALL';
  selectedAccess: 'ALL' | 'FREE' | 'PREMIUM' = 'ALL';
  selectedStatus: 'ALL' | 'SOLVED' | 'UNSOLVED' = 'ALL';

  currentPage = 1;
  pageSize = 6;
  sortBy: 'LATEST' | 'TITLE' | 'MARKS_DESC' | 'MARKS_ASC' | 'DURATION_DESC' | 'DURATION_ASC' = 'LATEST';

  mode: 'LIBRARY' | 'ASSESSMENT' | 'CHALLENGE' = 'LIBRARY';

  leftTab: 'problem' | 'submissions' | 'discussions' = 'problem';
  consoleExpanded = true;
  activeConsoleTab: 'samples' | 'results' | 'custom' = 'samples';
  customInputText = '';
  customRunResult: any = null;

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

  generatedAiHints: string[] = [];
  aiHintsLoading = false;
  aiHintsError = '';

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

  showAiSidebar = false;
  aiReviewLoading = false;
  aiReviewHtml: SafeHtml | null = null;

  constructor(
    private publicPracticeService: PublicPracticeService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    public gamificationService: GamificationService,
  ) { }

  ngOnInit(): void {
    // Sync login streak through the global GamificationService
    this.gamificationService.trackLogin();
    
    // Auto-update calendar loginHistory when gamification updates globally
    this.gamificationService.streak$.subscribe(() => {
      try {
        const historyJson = localStorage.getItem('vt_login_history');
        this.loginHistory = historyJson ? JSON.parse(historyJson) : [];
      } catch {
        this.loginHistory = [];
      }
    });

    this.restoreLead();
    this.loadMyPlanAccess();
    this.loadRealTimeLeaderboard();
    this.workspaceUnlocked = false;
    this.currentGrant = null;

    const type = this.route.snapshot.paramMap.get('type');
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (type === 'assessment' && id) {
      this.loadAssessment(id);
      this.ensureLibraryLoaded();
      return;
    }

    if (type === 'challenge' && id) {
      this.loadChallenge(id);
      this.ensureLibraryLoaded();
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
    this.stopChallengeTimer();
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

    const filtered = this.allItems.filter((item) => {
      const itemIdStr = String(item.id).toLowerCase();
      const isIdMatch = term && (itemIdStr === term || itemIdStr === term.replace('#', ''));

      const text = [item.title, item.description, item.company, item.skill, item.type]
        .join(' ')
        .toLowerCase();

      return (
        (!term || text.includes(term) || isIdMatch) &&
        (this.selectedCompany === 'ALL' || item.company === this.selectedCompany) &&
        (this.selectedSkill === 'ALL' || item.skill === this.selectedSkill) &&
        (this.selectedType === 'ALL' || item.type === this.selectedType) &&
        (this.selectedAccess === 'ALL' ||
          (this.selectedAccess === 'FREE' && this.isLeadRequired(item)) ||
          (this.selectedAccess === 'PREMIUM' && !this.isLeadRequired(item))) &&
        (this.selectedStatus === 'ALL' ||
          (this.selectedStatus === 'SOLVED' && this.isItemSolved(item)) ||
          (this.selectedStatus === 'UNSOLVED' && !this.isItemSolved(item)))
      );
    });

    return filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'TITLE':
          return (a.title || '').localeCompare(b.title || '');
        case 'MARKS_DESC':
          return (b.totalMarks || 0) - (a.totalMarks || 0);
        case 'MARKS_ASC':
          return (a.totalMarks || 0) - (b.totalMarks || 0);
        case 'DURATION_DESC':
          return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        case 'DURATION_ASC':
          return (a.durationMinutes || 0) - (b.durationMinutes || 0);
        case 'LATEST':
        default:
          return (b.id || 0) - (a.id || 0);
      }
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

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      let adjustedStart = start;
      let adjustedEnd = end;
      if (current <= 3) {
        adjustedEnd = 4;
      } else if (current >= total - 2) {
        adjustedStart = total - 3;
      }

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
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
    this.serverCompileErrors = [];
    this.hasUnsavedChanges = false;
    this.draftSavedAt = '';
    this.customRunResult = null;

    if (this.challenge?.sampleTestCases?.length > 0) {
      this.customInputText = this.challenge.sampleTestCases[0].inputData || '';
    } else {
      this.customInputText = '';
    }

    this.restoreDraftLocally();
    this.startHintUnlockTimer();

    if (this.challenge?.durationMinutes) {
      this.startChallengeTimer(Number(this.challenge.durationMinutes));
    } else {
      this.startChallengeTimer(30);
    }

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
    this.attemptingItemId = item.id;

    this.publicPracticeService
      .registerAuthenticatedAccess({
        practiceType: type,
        practiceId: Number(item.id),
      })
      .subscribe({
        next: (res: any) => {
          this.submitting = false;
          this.attemptingItemId = null;

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
          this.attemptingItemId = null;
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
        this.assessments = (data.assessments || []).map((x: any) => ({ ...x, type: 'ASSESSMENT' }));
        this.challenges = (data.challenges || []).map((x: any) => ({ ...x, type: 'CHALLENGE' }));
        this.companies = Array.from<string>(data.companies || []).filter((c: any) => !!c);
        
        const availableSkills = new Set<string>();
        this.assessments.forEach(item => { if (item.skill) availableSkills.add(item.skill); });
        this.challenges.forEach(item => { if (item.skill) availableSkills.add(item.skill); });
        this.skills = Array.from(availableSkills).filter(s => !!s);
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load free practice tests');
      },
    });
  }

  ensureLibraryLoaded(): void {
    if (this.assessments.length || this.challenges.length) return;
    this.publicPracticeService.getLibrary().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.assessments = (data.assessments || []).map((x: any) => ({ ...x, type: 'ASSESSMENT' }));
        this.challenges = (data.challenges || []).map((x: any) => ({ ...x, type: 'CHALLENGE' }));
        this.companies = Array.from<string>(data.companies || []).filter((c: any) => !!c);

        const availableSkills = new Set<string>();
        this.assessments.forEach(item => { if (item.skill) availableSkills.add(item.skill); });
        this.challenges.forEach(item => { if (item.skill) availableSkills.add(item.skill); });
        this.skills = Array.from(availableSkills).filter(s => !!s);
      },
      error: () => { }
    });
  }

  get similarSuggestions(): any[] {
    if (this.mode === 'LIBRARY') return [];

    const currentItem = this.mode === 'ASSESSMENT' ? this.assessment : this.challenge;
    if (!currentItem) return [];

    const currentId = Number(this.mode === 'ASSESSMENT' ? this.assessmentId : this.challengeId);
    const pool = this.mode === 'ASSESSMENT' ? this.assessments : this.challenges;

    // Filter out current item and ensure unique IDs
    const seenIds = new Set<number>();
    const otherItems = pool.filter(item => {
      const itemId = Number(item.id);
      if (itemId === currentId) return false;
      if (seenIds.has(itemId)) return false;
      seenIds.add(itemId);
      return true;
    });

    // Score other items based on skill/company
    const scored = otherItems.map(item => {
      let score = 0;
      if (item.skill && currentItem.skill && String(item.skill).toLowerCase() === String(currentItem.skill).toLowerCase()) {
        score += 3;
      }
      if (item.company && currentItem.company && String(item.company).toLowerCase() === String(currentItem.company).toLowerCase()) {
        score += 2;
      }
      return { item, score };
    });

    // Sort descending and take top 5
    return scored
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)
      .slice(0, 5);
  }

  navigateToSuggestion(item: any): void {
    const type = this.resolvePracticeType(item);
    if (type === 'ASSESSMENT') {
      this.router.navigate(['/practice', 'assessment', item.id]).then(() => {
        this.loadAssessment(item.id);
      });
    } else if (type === 'CHALLENGE') {
      this.router.navigate(['/practice', 'challenge', item.id]).then(() => {
        this.loadChallenge(item.id);
      });
    }
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
        this.attemptingItemId = item.id;
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
        this.attemptingItemId = item.id;
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
      this.attemptingItemId = item.id;
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
        this.attemptingItemId = item.id;
        this.router.navigate(['/practice', 'assessment', item.id]);
        return;
      }

      if (type === 'CHALLENGE') {
        this.attemptingItemId = item.id;
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
    this.attemptingItemId = item.id;

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
          this.attemptingItemId = null;

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
          this.attemptingItemId = null;

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
            try {
              const solvedIdsJson = localStorage.getItem('vt_solved_item_ids');
              let solvedIds: string[] = solvedIdsJson ? JSON.parse(solvedIdsJson) : [];
              const key = `ASSESSMENT_${this.assessmentId}`;
              if (!solvedIds.includes(key)) {
                solvedIds.push(key);
                localStorage.setItem('vt_solved_item_ids', JSON.stringify(solvedIds));
              }
            } catch {}
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

    const restored = this.restoreDraftLocally();
    if (!restored) {
      if (!this.sourceCode.trim() || this.sourceCode === this.lastStarterCode) {
        this.sourceCode = nextStarter;
        this.lastStarterCode = nextStarter;
      }
    } else {
      this.lastStarterCode = nextStarter;
    }

    this.editorError = '';
    this.challengeResult = null;
    this.customRunResult = null;
    this.editorValidationErrors = [];
    this.serverCompileErrors = [];

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
      autoIndent: 'full',
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
    });

    const model = editor.getModel();
    if (model) {
      model.updateOptions({
        tabSize: 4,
        insertSpaces: true,
        trimAutoWhitespace: true,
      });
    }

    this.registerCustomAutocomplete();
    this.syncEditorValue();

    if (this.monacoInstance) {
      if (model) {
        this.monacoInstance.editor.setModelLanguage(model, this.editorLanguage);
      }
      this.monacoInstance.editor.setTheme(this.selectedTheme);

      // Keyboard Shortcuts
      editor.addCommand(this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.Enter, () => {
        this.runChallenge();
      });

      editor.addCommand(this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KeyS, () => {
        this.saveDraftLocally();
        this.showToast('Draft saved successfully');
      });

      editor.addCommand(this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KeyL, () => {
        this.clearServerDiagnostics();
        this.showToast('Diagnostics cleared');
      });

      editor.addCommand(this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyMod.Alt | this.monacoInstance.KeyCode.KeyF, () => {
        this.formatCode();
      });

      // Cursor position change to toggle readOnly dynamically
      editor.onDidChangeCursorPosition((event: any) => {
        const model = editor.getModel();
        const range = this.getEditableRange(model);
        if (range) {
          const { startLine, endLine } = range;
          const isInside = event.position.lineNumber > startLine && event.position.lineNumber < endLine;
          editor.updateOptions({ readOnly: !isInside });
        } else {
          editor.updateOptions({ readOnly: false });
        }
      });

      // Selection change to prevent editing selections spanning outside logic bounds
      editor.onDidChangeCursorSelection((event: any) => {
        const model = editor.getModel();
        const range = this.getEditableRange(model);
        if (range) {
          const { startLine, endLine } = range;
          const selection = event.selection;
          const isSelectionInside = selection.startLineNumber > startLine && selection.endLineNumber < endLine;
          editor.updateOptions({ readOnly: !isSelectionInside });
        }
      });

      // Keydown handler to block backspace/delete at marker margins
      editor.onKeyDown((e: any) => {
        const model = editor.getModel();
        const range = this.getEditableRange(model);
        if (!range) return;

        const { startLine, endLine } = range;
        const position = editor.getPosition();

        // Backspace on first column of first logic line -> Block merging into start marker line
        if (e.keyCode === this.monacoInstance.KeyCode.Backspace) {
          if (position.lineNumber === startLine + 1 && position.column === 1) {
            e.preventDefault();
            e.stopPropagation();
          }
        }

        // Delete at last column of last logic line -> Block merging into end marker line
        if (e.keyCode === this.monacoInstance.KeyCode.Delete) {
          const lineContent = model.getLineContent(position.lineNumber);
          if (position.lineNumber === endLine - 1 && position.column === lineContent.length + 1) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      });
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

  onThemeChange(): void {
    if (this.editorInstance && this.monacoInstance) {
      this.monacoInstance.editor.setTheme(this.selectedTheme);
      this.editorOptions.theme = this.selectedTheme;
    }
  }

  increaseFontSize(): void {
    if (this.editorOptions.fontSize < 28) {
      this.editorOptions.fontSize += 1;
      this.editorInstance?.updateOptions({ fontSize: this.editorOptions.fontSize });
    }
  }

  decreaseFontSize(): void {
    if (this.editorOptions.fontSize > 11) {
      this.editorOptions.fontSize -= 1;
      this.editorInstance?.updateOptions({ fontSize: this.editorOptions.fontSize });
    }
  }

  getFileExtension(): string {
    const map: Record<string, string> = {
      JAVA: 'java',
      PYTHON: 'py',
      C: 'c',
      CPP: 'cpp',
      CSHARP: 'cs',
      PHP: 'php',
      RUBY: 'rb',
      GO: 'go',
      RUST: 'rs',
      TYPESCRIPT: 'ts',
    };
    return map[this.language] || 'txt';
  }

  downloadCode(): void {
    if (!this.sourceCode) {
      this.showToast('No code to download');
      return;
    }
    const ext = this.getFileExtension();
    const filename = `solution_${this.challengeId || 'challenge'}.${ext}`;
    const blob = new Blob([this.sourceCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast(`Downloaded solution as ${filename}`);
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    setTimeout(() => {
      this.editorInstance?.layout?.();
    }, 200);
  }

  getEditableRange(model: any): { startLine: number; endLine: number } | null {
    if (!model) return null;
    const linesCount = model.getLineCount();
    let start = -1;
    let end = -1;

    for (let i = 1; i <= linesCount; i++) {
      const content = model.getLineContent(i);
      if (content.includes('START OF USER LOGIC')) {
        start = i;
      }
      if (content.includes('END OF USER LOGIC')) {
        end = i;
        break;
      }
    }

    if (start !== -1 && end !== -1) {
      return { startLine: start, endLine: end };
    }
    return null;
  }

  private registerCustomAutocomplete(): void {
    if (!this.monacoInstance) return;
    if ((window as any).__vidhuraMonacoCompletionsRegistered) return;
    (window as any).__vidhuraMonacoCompletionsRegistered = true;

    const monaco = this.monacoInstance;

    // Define helper to create keyword suggestion
    const keyword = (text: string) => ({
      label: text,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: text,
    });

    // Define helper to create function suggestion
    const func = (text: string, detail?: string) => ({
      label: text,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: text + '(${1})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: detail || 'Built-in function',
    });

    // Define helper to create snippet suggestion
    const snippet = (label: string, code: string, doc?: string) => ({
      label,
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: code,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: doc || '',
    });

    // 1. PYTHON PROVIDER
    const pythonKeywords = [
      'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
      'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
      'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while',
      'with', 'yield', 'True', 'False', 'None'
    ].map(keyword);

    const pythonFunctions = [
      'print', 'len', 'range', 'enumerate', 'zip', 'sum', 'min', 'max', 'abs', 'round',
      'sorted', 'reversed', 'map', 'filter', 'input', 'int', 'float', 'str', 'bool', 'list',
      'dict', 'set', 'tuple', 'type', 'isinstance', 'open'
    ].map(f => func(f, 'Python built-in'));

    const pythonSnippets = [
      snippet('def', 'def ${1:function_name}(${2:args}):\n\t${3:pass}', 'Define a function'),
      snippet('for', 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', 'For loop'),
      snippet('while', 'while ${1:condition}:\n\t${2:pass}', 'While loop'),
      snippet('if', 'if ${1:condition}:\n\t${2:pass}', 'If statement'),
      snippet('ife', 'if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}', 'If-Else statement'),
      snippet('class', 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}', 'Define a class'),
      snippet('try', 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:pass}', 'Try-Except block'),
      snippet('solve', 'def solve():\n    # Write logic here\n    pass', 'Challenge solve template'),
      snippet('sysread', 'import sys\n\ndata = sys.stdin.read().strip().split()\n', 'Read all tokens from stdin')
    ];

    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: () => {
        return {
          suggestions: [...pythonKeywords, ...pythonFunctions, ...pythonSnippets]
        };
      }
    });

    // 2. JAVA PROVIDER
    const javaKeywords = [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
      'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally',
      'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long',
      'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static',
      'super', 'switch', 'this', 'throw', 'throws', 'try', 'void', 'while', 'true', 'false', 'null'
    ].map(keyword);

    const javaFunctions = [
      'length', 'equals', 'toString', 'indexOf', 'substring', 'charAt', 'contains', 'split',
      'parseInt', 'parseDouble', 'valueOf', 'size', 'add', 'get', 'put', 'containsKey'
    ].map(f => func(f, 'Java method'));

    const javaSnippets = [
      snippet('sysout', 'System.out.println(${1});', 'Print line to console'),
      snippet('sysprint', 'System.out.print(${1});', 'Print to console'),
      snippet('psvm', 'public static void main(String[] args) {\n\t${1}\n}', 'Main method declaration'),
      snippet('class', 'public class ${1:Main} {\n\tpublic static void main(String[] args) {\n\t\t${2}\n\t}\n}', 'Java Class skeleton'),
      snippet('for', 'for (int i = 0; i < ${1:limit}; i++) {\n\t${2}\n}', 'Standard for loop'),
      snippet('scanner', 'Scanner sc = new Scanner(System.in);\n', 'Scanner for console input'),
      snippet('list', 'List<${1:String}> list = new ArrayList<>();\n', 'ArrayList declaration'),
      snippet('map', 'Map<${1:String}, ${2:Integer}> map = new HashMap<>();\n', 'HashMap declaration')
    ];

    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: () => {
        return {
          suggestions: [...javaKeywords, ...javaFunctions, ...javaSnippets]
        };
      }
    });

    // 3. C / CPP PROVIDER
    const cppKeywords = [
      'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'return', 'short', 'signed',
      'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile',
      'while', 'class', 'namespace', 'using', 'public', 'private', 'protected', 'template',
      'typename', 'new', 'delete', 'try', 'catch', 'throw', 'std', 'true', 'false'
    ].map(keyword);

    const cppSnippets = [
      snippet('main', 'int main() {\n\t${1}\n\treturn 0;\n}', 'C/C++ main function'),
      snippet('cout', 'std::cout << ${1} << std::endl;', 'Console output'),
      snippet('cin', 'std::cin >> ${1};', 'Console input'),
      snippet('for', 'for (int i = 0; i < ${1:n}; i++) {\n\t${2}\n}', 'Standard loop'),
      snippet('vector', 'std::vector<${1:int}> ${2:vec};', 'std::vector declaration'),
      snippet('string', 'std::string ${1:str};', 'std::string declaration'),
      snippet('solve', '#include <iostream>\nusing namespace std;\n\nint main() {\n\t${1}\n\treturn 0;\n}', 'Solve template')
    ];

    monaco.languages.registerCompletionItemProvider('c', {
      provideCompletionItems: () => {
        return {
          suggestions: [...cppKeywords, ...cppSnippets]
        };
      }
    });

    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: () => {
        return {
          suggestions: [...cppKeywords, ...cppSnippets]
        };
      }
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

    this.compilerDiagnostics = [
      ...validationDiagnostics,
      ...this.localDiagnostics,
      ...this.serverCompileErrors,
    ];

    if (!this.editorInstance || !this.monacoInstance) return;

    const model = this.editorInstance.getModel();
    const sourceLines = this.sourceCode.split('\n');

    // Clean up old markers
    this.monacoInstance.editor.setModelMarkers(model, 'compiler', []);
    this.monacoInstance.editor.setModelMarkers(model, 'public-validation', []);

    const markers = this.compilerDiagnostics
      .filter((item) => item.line !== null)
      .map((item) => {
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
          source: 'Workspace Diagnostics',
        };
      });

    this.monacoInstance.editor.setModelMarkers(model, 'workspace-validation', markers);
  }

  applyCompilerErrors(error?: string): void {
    this.validateCode();
  }

  clearServerDiagnostics(): void {
    this.serverCompileErrors = [];
    this.editorError = '';
    this.validateCode();
  }

  private syncEditorValue(): void {
    if (!this.editorInstance) return;
    if (this.editorInstance.getValue() !== this.sourceCode) {
      this.editorInstance.updateOptions({ readOnly: false });
      this.editorInstance.setValue(this.sourceCode || '');

      const model = this.editorInstance.getModel();
      const range = this.getEditableRange(model);
      if (range) {
        const position = this.editorInstance.getPosition();
        if (position) {
          const isInside = position.lineNumber > range.startLine && position.lineNumber < range.endLine;
          this.editorInstance.updateOptions({ readOnly: !isInside });
        } else {
          this.editorInstance.updateOptions({ readOnly: true });
        }
      }
    }
    setTimeout(() => {
      this.editorInstance?.layout?.();
      this.editorInstance?.focus?.();
    });
  }

  private collectLocalDiagnostics(): CompilerDiagnostic[] {
    const diagnostics: CompilerDiagnostic[] = [];
    const lines = this.sourceCode.split('\n');
    const language = String(this.language || '').toUpperCase();

    // 1. Run global bracket/brace matching checker for all languages
    this.collectBracketDiagnostics(this.sourceCode, language, diagnostics);

    // 2. Run language-specific diagnostics
    if (language === 'PYTHON') {
      this.collectPythonDiagnostics(lines, diagnostics);
    } else if (language === 'JAVA') {
      this.collectJavaDiagnostics(lines, diagnostics);
    } else {
      this.collectGenericDiagnostics(lines, diagnostics, language);
    }

    const security = this.collectSecurityDiagnostics(this.sourceCode, this.language);
    diagnostics.push(...security);

    return diagnostics;
  }

  private collectBracketDiagnostics(code: string, language: string, diagnostics: CompilerDiagnostic[]): void {
    const lines = code.split(/\r?\n/);
    const stack: { char: string; line: number; col: number }[] = [];
    let inString: '"' | "'" | '`' | null = null;
    let escaped = false;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      inLineComment = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (escaped) {
          escaped = false;
          continue;
        }

        // Handle string literals
        if (inString) {
          if (char === '\\') {
            escaped = true;
          } else if (char === inString) {
            inString = null;
          }
          continue;
        }

        // Handle block comments
        if (inBlockComment) {
          if (char === '*' && line[j + 1] === '/') {
            inBlockComment = false;
            j++;
          }
          continue;
        }

        // Check for comment starts
        if (language === 'PYTHON' || language === 'RUBY') {
          if (char === '#') {
            inLineComment = true;
            break; // Skip rest of line
          }
        } else {
          // C-style comments
          if (char === '/' && line[j + 1] === '/') {
            inLineComment = true;
            break; // Skip rest of line
          }
          if (char === '/' && line[j + 1] === '*') {
            inBlockComment = true;
            j++;
            continue;
          }
        }

        // String boundary check
        if (char === '"' || char === "'" || (char === '`' && ['TYPESCRIPT', 'PHP', 'GO'].includes(language))) {
          inString = char;
          continue;
        }

        // Bracket matching
        if (char === '(' || char === '[' || char === '{') {
          stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === ')' || char === ']' || char === '}') {
          const matchingOpen: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
          const expectedOpen = matchingOpen[char];

          if (stack.length === 0) {
            diagnostics.push({
              line: i + 1,
              column: j + 1,
              message: `SyntaxError: unmatched closing '${char}'`,
              raw: line,
            });
          } else {
            const top = stack.pop();
            if (top && top.char !== expectedOpen) {
              diagnostics.push({
                line: i + 1,
                column: j + 1,
                message: `SyntaxError: mismatched brackets. Opened '${top.char}' on line ${top.line} but closed with '${char}'`,
                raw: line,
              });
            }
          }
        }
      }
    }

    // Any remaining items in stack are unclosed open brackets
    while (stack.length > 0) {
      const top = stack.pop();
      if (top) {
        diagnostics.push({
          line: top.line,
          column: top.col,
          message: `SyntaxError: unclosed '${top.char}'`,
          raw: lines[top.line - 1] || '',
        });
      }
    }
  }

  private collectPythonDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[]): void {
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;
      if (!trimmed || trimmed.startsWith('#')) return;

      const withoutComment = trimmed.split('#')[0].trim();
      if (!withoutComment) return;

      // Check Python imports
      if (withoutComment.startsWith('import ') || withoutComment.startsWith('from ')) {
        const standardPythonModules = new Set([
          'sys', 'math', 'collections', 'itertools', 'heapq', 'bisect', 'json', 're', 'random',
          'datetime', 'time', 'copy', 'functools', 'typing', 'array', 'string', 'queue', 'operator',
          'io', 'os', 'pathlib', 'abc', 'enum', 'glob', 'shutil', 'statistics', 'bisect', 'hashlib'
        ]);

        let importedModules: string[] = [];
        if (withoutComment.startsWith('import ')) {
          const parts = withoutComment.slice(7).split(',');
          parts.forEach(p => {
            const mod = p.trim().split(/\s+/)[0].split('.')[0];
            if (mod) importedModules.push(mod);
          });
        } else if (withoutComment.startsWith('from ')) {
          const parts = withoutComment.slice(5).trim().split(/\s+/);
          const mod = parts[0].split('.')[0];
          if (mod) importedModules.push(mod);
        }

        importedModules.forEach(mod => {
          if (!standardPythonModules.has(mod)) {
            diagnostics.push({
              line: lineNumber,
              column: line.indexOf(mod) + 1,
              message: `Warning: Module '${mod}' may not be available in the sandbox.`,
              raw: line,
            });
          }
        });
      }

      if (
        /=\s*.+:\s*$/.test(withoutComment) &&
        !/^(if|elif|while|for|def|class|try|except|finally|with)\b/.test(withoutComment)
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.lastIndexOf(':') + 1,
          message: 'SyntaxError: invalid syntax. Remove the extra ":" at the end.',
          raw: line,
        });
      }

      if (
        /^(if|elif|else|for|while|def|class|try|except|finally|with)\b/.test(withoutComment) &&
        !withoutComment.endsWith(':')
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.length + 1,
          message: 'SyntaxError: expected ":" at the end of this block statement.',
          raw: line,
        });
      }

      if (withoutComment.endsWith(':')) {
        let nextIndex = index + 1;
        while (nextIndex < lines.length) {
          const nextTrimmed = lines[nextIndex].trim();
          if (nextTrimmed && !nextTrimmed.startsWith('#')) {
            break;
          }
          nextIndex++;
        }

        if (
          nextIndex < lines.length &&
          !lines[nextIndex].startsWith(' ') &&
          !lines[nextIndex].startsWith('\t')
        ) {
          diagnostics.push({
            line: nextIndex + 1,
            column: 1,
            message: 'IndentationError: expected an indented block after ":".',
            raw: lines[nextIndex],
          });
        }
      }

      // Check for incomplete expression ending in operator
      if (/[+\-*/=<>]$/.test(withoutComment) && !withoutComment.endsWith('\\')) {
        diagnostics.push({
          line: lineNumber,
          column: line.length,
          message: `SyntaxError: incomplete expression ending with operator '${withoutComment.slice(-1)}'.`,
          raw: line,
        });
      }

      // Check for standalone single undefined word/variable typos (e.g. uniqu)
      if (
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(withoutComment) &&
        !/^(pass|break|continue|return|True|False|None)$/.test(withoutComment)
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.indexOf(withoutComment) + 1,
          message: `SyntaxError: incomplete statement or name '${withoutComment}' is not defined.`,
          raw: line,
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
    });
  }

  private collectJavaDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[]): void {
    const code = lines.join('\n');
    const hasScannerImport = /import\s+java\.util\.(Scanner|\*)\s*;/.test(code);
    const usesScanner = /\bScanner\b/.test(code);
    const hasClass = /\bclass\s+\w+/.test(code);
    const mainLine = Math.max(1, lines.findIndex((line) => line.includes('class ')) + 1 || 1);
    const hasMainMethod = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\]\s+\w+\s*\)/.test(
      code,
    );

    if (hasClass && !hasMainMethod) {
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

      const statementOnly = trimmed.split('//')[0].trim();

      // Check Java imports
      if (statementOnly.startsWith('import ')) {
        const allowedJavaPackages = [
          'java.util', 'java.io', 'java.math', 'java.lang', 'java.text', 'java.time'
        ];
        const importPath = statementOnly.slice(7).replace(';', '').trim();
        const rootPkg = importPath.split('.').slice(0, 2).join('.');

        if (!allowedJavaPackages.includes(rootPkg) && !importPath.startsWith('static ')) {
          diagnostics.push({
            line: lineNumber,
            column: line.indexOf(importPath) + 1,
            message: `Warning: Package '${importPath}' may not be available or permitted in the sandbox.`,
            raw: line,
          });
        }
      }

      if (/^(import|package)\b/.test(statementOnly) && !statementOnly.endsWith(';')) {
        diagnostics.push({
          line: lineNumber,
          column: line.length + 1,
          message: `Line ${lineNumber}: Java compile error: ';' expected at the end of this statement.`,
          raw: line,
        });
      }

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
    });
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

  private stripStrings(line: string): string {
    return line.replace(/"([^"\\]|\\.)*"/g, '""').replace(/'([^'\\]|\\.)*'/g, "''");
  }

  private collectGenericDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[], language: string): void {
    const needsSemicolon = ['C', 'CPP', 'CSHARP', 'PHP', 'RUST'].includes(language);

    lines.forEach((line, index) => {
      const withoutString = this.stripStrings(line);
      const trimmed = withoutString.trim();
      const realTrimmed = line.trim();
      const lineNumber = index + 1;
      if (!realTrimmed || realTrimmed.startsWith('//') || realTrimmed.startsWith('/*') || realTrimmed.startsWith('*') || realTrimmed.startsWith('#')) return;

      // Unclosed string check
      const stringDiag = this.getUnclosedStringDiagnostic(line, lineNumber);
      if (stringDiag) diagnostics.push(stringDiag);

      // Semicolon check
      const statementOnly = trimmed.split('//')[0].trim();
      if (/^(import|package|using|use)\b/.test(statementOnly) && !statementOnly.endsWith(';')) {
        diagnostics.push({
          line: lineNumber,
          column: line.length + 1,
          message: `Syntax Error: missing ';' at the end of statement.`,
          raw: line,
        });
      }

      if (needsSemicolon) {
        const skipSemicolon =
          !trimmed ||
          trimmed.startsWith('import ') ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('using ') ||
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
          trimmed.startsWith('finally') ||
          trimmed.startsWith('fn ') ||
          trimmed.startsWith('pub ') ||
          trimmed.startsWith('struct ') ||
          trimmed.startsWith('class ');

        if (!skipSemicolon) {
          diagnostics.push({
            line: lineNumber,
            column: line.length + 1,
            message: `Syntax Error: missing ';' at the end of statement.`,
            raw: line,
          });
        }
      }
    });
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
    if (!this.isLoggedIn) return;
    if (!this.challengeId || !this.sourceCode) return;

    localStorage.setItem(this.draftKey, this.sourceCode);
    this.hasUnsavedChanges = false;
    this.draftSavedAt = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  restoreDraftLocally(): boolean {
    if (!this.isLoggedIn) return false;
    const saved = localStorage.getItem(this.draftKey);

    if (!saved) return false;

    this.sourceCode = saved;
    this.hasUnsavedChanges = false;
    return true;
  }

  clearCode(): void {
    this.sourceCode = '';
    this.challengeResult = null;
    this.customRunResult = null;
    this.editorError = '';
    this.serverCompileErrors = [];
    this.hasUnsavedChanges = true;
    localStorage.removeItem(this.draftKey);
    this.editorValidationErrors = this.collectEditorValidationErrors();
  }

  resetCode(): void {
    this.sourceCode = this.getStarterCode(this.language);
    this.lastStarterCode = this.sourceCode;
    this.challengeResult = null;
    this.customRunResult = null;
    this.editorError = '';
    this.serverCompileErrors = [];
    this.hasUnsavedChanges = false;
    localStorage.removeItem(this.draftKey);
    this.editorValidationErrors = [];
  }

  formatCode(): void {
    this.clearServerDiagnostics();
    const builtInFormatLanguages = ['typescript', 'javascript', 'html', 'css', 'json'];
    const isBuiltIn = builtInFormatLanguages.includes(this.editorLanguage);

    if (isBuiltIn && this.editorInstance?.getAction) {
      const action = this.editorInstance.getAction('editor.action.formatDocument');

      if (action) {
        action.run();
        setTimeout(() => {
          this.sourceCode = this.editorInstance.getValue();
          this.validateCode();
        });
        return;
      }
    }

    if (this.language === 'PYTHON') {
      const lines = this.sourceCode.split('\n');
      let startIdx = -1;
      let endIdx = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('START OF USER LOGIC')) {
          startIdx = i;
        }
        if (lines[i].includes('END OF USER LOGIC')) {
          endIdx = i;
        }
      }

      if (startIdx !== -1 && endIdx !== -1) {
        // 1. Format wrapper before start
        const beforeLines = lines.slice(0, startIdx + 1).map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('import ') || trimmed.startsWith('def solve():')) {
            return trimmed;
          }
          return '    ' + trimmed;
        });

        // 2. Format user logic lines using stack-based relative indentation
        const userLines = lines.slice(startIdx + 1, endIdx);
        const formattedUserLines = [];
        const indentStack = [{ orig: -1, formatted: 4 }];
        let prevOrigIndent = -1;
        let prevFormatted = 4;
        let forceNextIndent = false;

        for (let i = 0; i < userLines.length; i++) {
          const line = userLines[i];
          const trimmed = line.trim();
          if (!trimmed) {
            formattedUserLines.push('');
            continue;
          }

          const match = line.match(/^(\s*)/);
          const origIndent = match ? match[0].length : 0;

          // Pop from stack if current indentation is less than the top of the stack
          while (indentStack.length > 1 && origIndent < indentStack[indentStack.length - 1].orig) {
            indentStack.pop();
          }

          let currentFormatted = indentStack[indentStack.length - 1].formatted;

          // Push to stack if current indentation is greater than the top of the stack
          if (origIndent > indentStack[indentStack.length - 1].orig) {
            const nextFormatted = indentStack[indentStack.length - 1].orig === -1 ? 4 : indentStack[indentStack.length - 1].formatted + 4;
            indentStack.push({ orig: origIndent, formatted: nextFormatted });
            currentFormatted = nextFormatted;
          }

          // Force indent if previous line ended with ':' and user didn't indent
          if (forceNextIndent && origIndent <= prevOrigIndent) {
            currentFormatted = prevFormatted + 4;
            indentStack.push({ orig: origIndent, formatted: currentFormatted });
          }

          // If the line starts with elif/else/except/finally, format it with 4 spaces less
          let renderIndent = currentFormatted;
          if (/^(elif|else|except|finally)\b/.test(trimmed) || trimmed.startsWith('else:')) {
            renderIndent = Math.max(currentFormatted - 4, 4);
          }

          formattedUserLines.push(' '.repeat(renderIndent) + trimmed);

          // Update tracking variables
          prevOrigIndent = origIndent;
          prevFormatted = renderIndent;
          forceNextIndent = trimmed.endsWith(':');
        }

        // 3. Format wrapper after end
        const afterLines = lines.slice(endIdx).map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('if __name__') || trimmed.includes('import sys')) {
            return trimmed;
          }
          if (trimmed.includes('END OF USER LOGIC')) {
            return '    ' + trimmed;
          }
          return '    ' + trimmed;
        });

        this.sourceCode = [...beforeLines, ...formattedUserLines, ...afterLines].join('\n');
      }

      setTimeout(() => {
        this.syncEditorValue();
        this.validateCode();
      });
      return;
    }

    const tab = this.language === 'JAVA' || this.language === 'RUST' ? '    ' : '  ';
    let indent = 0;

    this.sourceCode = this.sourceCode
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (this.shouldReduceIndent(trimmed)) indent = Math.max(indent - 1, 0);
        const formatted = `${tab.repeat(indent)}${trimmed}`;
        if (this.shouldIncreaseIndent(trimmed)) indent += 1;
        return formatted;
      })
      .join('\n');

    setTimeout(() => {
      this.syncEditorValue();
      this.validateCode();
    });
  }

  private shouldIncreaseIndent(line: string): boolean {
    return (
      line.endsWith(':') ||
      line.endsWith('{') ||
      line.endsWith('do') ||
      line.endsWith('then') ||
      line.endsWith('->')
    );
  }

  private shouldReduceIndent(line: string): boolean {
    return (
      line.startsWith('}') ||
      line.startsWith(']') ||
      line.startsWith(')') ||
      line === 'end' ||
      line.startsWith('end ')
    );
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

    // Since we now use a secure isolated sandbox (Judge0), we do not need to block code patterns in the frontend.
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

    const firstLine = trimmed.split(/\r?\n/)[0].trim();
    const firstLineLower = firstLine.toLowerCase();

    // If it's a comment or common programming starting construct, it's not a shell command
    const codeStarters = [
      'import ', 'from ', 'package ', 'using ', 'public ', 'class ', 'private ',
      'protected ', 'void ', 'int ', 'float ', 'double ', 'char ', 'bool ', 'boolean ',
      'let ', 'const ', 'var ', 'function ', 'def ', 'namespace ',
      '#include', 'include ', 'struct ', 'enum ', '//', '/*', '*', '<?php', '<?',
      'const', 'let', 'var', 'def', 'import', 'from'
    ];

    const startsWithCodeKeyword = codeStarters.some(starter => {
      if (starter.startsWith('#') || starter.startsWith('//') || starter.startsWith('/*') || starter.startsWith('*')) {
        return firstLine.startsWith(starter);
      }
      return firstLineLower.startsWith(starter);
    });

    if (startsWithCodeKeyword) {
      return false;
    }

    // Shell command pattern matching actual commands
    const isShell = /^(find|cat|ls|pwd|whoami|id|uname|ps|env|printenv|curl|wget|nc|netcat|bash|sh|zsh|python|python3|perl|ruby|chmod|chown|rm|mv|cp|mkdir|rmdir|touch|grep|egrep|fgrep|sed|awk|tar|zip|unzip|git|docker|kubectl|systemctl|service|apt|yum|dnf|pacman|pip|npm|yarn|npx)\b.*/.test(firstLineLower)
      || firstLineLower.startsWith('./')
      || firstLineLower.startsWith('/')
      || firstLineLower.startsWith('../');

    if (isShell) {
      return true;
    }

    // Suspicious file paths or redirection operators on the first line
    const suspicious = ['/etc/passwd', '/proc/', '/root/', '2>/dev/null', '> /dev/null'];
    if (suspicious.some(p => firstLineLower.includes(p))) {
      return true;
    }

    return false;
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

  runCustomChallenge(): void {
    if (!this.canUseWorkspace || !this.workspaceUnlocked) {
      this.requestWorkspaceAccess(
        'Please fill the registration form before running this challenge',
      );
      return;
    }

    this.serverCompileErrors = [];
    this.validateCode();

    if (this.localDiagnostics.length) {
      this.editorError = this.localDiagnostics.map((item) => item.message).join('\n');
      this.customRunResult = {
        status: 'FAIL',
        errorMessage: this.editorError,
      };
      this.showToast('Fix highlighted syntax errors before running');
      return;
    }

    if (this.editorValidationErrors.length) {
      this.editorError = '';
      this.showToast('Fix validation errors before running');
      return;
    }

    this.consoleExpanded = true;
    this.submitting = true;
    this.customRunResult = null;

    this.publicPracticeService
      .runChallengeCustom(this.challengeId, {
        accessToken: this.currentGrant?.accessToken,
        language: this.language,
        sourceCode: this.sourceCode,
        customInput: this.customInputText,
      })
      .subscribe({
        next: (res: any) => {
          this.customRunResult = res?.data || res;
          this.submitting = false;
          this.hasUnsavedChanges = false;
        },
        error: (err: any) => {
          this.submitting = false;
          const msg = err?.error?.message || 'Failed to run custom input';
          this.customRunResult = {
            status: 'FAIL',
            errorMessage: msg,
          };
          this.showToast(msg);
        },
      });
  }

  runChallenge(): void {
    if (this.activeConsoleTab === 'custom') {
      this.runCustomChallenge();
      return;
    }

    if (!this.canUseWorkspace || !this.workspaceUnlocked) {
      this.requestWorkspaceAccess(
        'Please fill the registration form before running this challenge',
      );
      return;
    }

    this.serverCompileErrors = [];
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

          this.serverCompileErrors = this.extractCompilerDiagnostics(compilerError);
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
            this.trackChallengeSolved();
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
          this.serverCompileErrors = this.extractCompilerDiagnostics(message);
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
    if (this.generatedAiHints && this.generatedAiHints.length > 0) {
      return this.generatedAiHints;
    }

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

    this.generatedAiHints = [];
    this.aiHintsError = '';
    this.aiHintsLoading = false;

    this.hintUnlockTimer = setInterval(() => {
      this.hintUnlockSeconds--;

      if (this.hintUnlockSeconds <= 0) {
        clearInterval(this.hintUnlockTimer);
        this.hintUnlockSeconds = 0;
        this.hintUnlocked = true;
      }
    }, 1000);
  }

  loadAiHints(): void {
    if (!this.challengeId) {
      return;
    }

    this.aiHintsLoading = true;
    this.aiHintsError = '';

    const payload = {
      accessToken: this.currentGrant?.accessToken || ''
    };

    this.publicPracticeService.getChallengeAiHints(this.challengeId, payload).subscribe({
      next: (res: any) => {
        this.aiHintsLoading = false;
        if (res && res.success && res.data && res.data.hints) {
          const rawHints = res.data.hints || '';
          this.generatedAiHints = rawHints
            .split(/\r?\n\r?\n|\r?\n/)
            .map((h: string) => h.trim())
            .filter((h: string) => h.length > 0 && !h.match(/^\d+\.\s*/));
        } else {
          this.aiHintsError = 'Failed to generate AI hints. Please try again.';
        }
      },
      error: (err: any) => {
        this.aiHintsLoading = false;
        this.aiHintsError = 'Error connecting to the server. Please try again.';
        console.error('Error fetching AI hints:', err);
      }
    });
  }

  toggleHintPanel(): void {
    if (!this.hintUnlocked) return;
    this.showHintPanel = !this.showHintPanel;

    if (this.showHintPanel) {
      const dbHintText = String(this.challenge?.hintText || this.selectedChallenge?.hintText || '').trim();
      if (!dbHintText && this.generatedAiHints.length === 0) {
        this.loadAiHints();
      }
    }
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
    # --- START OF USER LOGIC ---
    # Write your logic here
    pass
    # --- END OF USER LOGIC ---

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

        // --- START OF USER LOGIC ---
        // Write your logic here
        // --- END OF USER LOGIC ---
    }
}`,

      C: `#include <stdio.h>
#include <string.h>

int main(void) {
    char input[10000];

    while (fgets(input, sizeof(input), stdin) != NULL) {
        // --- START OF USER LOGIC ---
        // Write your logic here
        // --- END OF USER LOGIC ---
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

    // --- START OF USER LOGIC ---
    // Write your logic here
    // --- END OF USER LOGIC ---

    return 0;
}`,

      TYPESCRIPT: `import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();
const tokens = input.length ? input.split(/\\s+/) : [];

// --- START OF USER LOGIC ---
// Write your logic here
// --- END OF USER LOGIC ---`,

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

    // --- START OF USER LOGIC ---
    // Write your logic here
    // --- END OF USER LOGIC ---
}`,

      RUST: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let tokens: Vec<&str> = input.split_whitespace().collect();

    // --- START OF USER LOGIC ---
    // Write your logic here
    // --- END OF USER LOGIC ---
}`,

      CSHARP: `using System;
using System.Collections.Generic;

public class Program {
    public static void Main() {
        string input = Console.In.ReadToEnd();
        string[] tokens = input.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);

        // --- START OF USER LOGIC ---
        // Write your logic here
        // --- END OF USER LOGIC ---
    }
}`,

      PHP: `<?php
$input = trim(stream_get_contents(STDIN));
$tokens = $input === "" ? [] : preg_split('/\\s+/', $input);

// --- START OF USER LOGIC ---
// Write your logic here
// --- END OF USER LOGIC ---
?>`,

      RUBY: `input = STDIN.read.strip
tokens = input.empty? ? [] : input.split

# --- START OF USER LOGIC ---
# Write your logic here
# --- END OF USER LOGIC ---`,
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

  canAttemptItem(item: any): boolean {
    const level = this.itemAccessLevel(item);
    if (level === 'LEAD_REQUIRED') {
      return true; // Clickable for all (requires registration if guest, or attempts directly if logged in)
    }
    if (this.accountAccessLevels().includes(level)) {
      return this.isLoggedIn;
    }
    if (this.premiumAccessLevels().includes(level)) {
      return !!(this.isLoggedIn && this.planAccess?.active);
    }
    return false;
  }

  getAttemptButtonClass(item: any): string {
    const level = this.itemAccessLevel(item);
    if (this.canAttemptItem(item)) {
      return 'active-attempt';
    }
    if (this.premiumAccessLevels().includes(level)) {
      return 'premium-lock';
    }
    if (this.accountAccessLevels().includes(level)) {
      return 'login-lock';
    }
    return '';
  }

  getAttemptButtonText(item: any): string {
    const level = this.itemAccessLevel(item);
    if (this.canAttemptItem(item)) {
      return 'Attempt Now';
    }
    if (this.premiumAccessLevels().includes(level)) {
      return 'Unlock Premium';
    }
    if (this.accountAccessLevels().includes(level)) {
      return 'Login to Unlock';
    }
    return 'Locked';
  }

  getAttemptButtonIcon(item: any): string {
    if (this.canAttemptItem(item)) {
      return 'fa-solid fa-arrow-right';
    }
    return 'fa-solid fa-lock';
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

  hasCompanyLogo(company: string): boolean {
    if (!company) return false;
    const trimmed = company.trim().toLowerCase();
    return Object.keys(this.companyLogos).some(
      (k) => k.toLowerCase() === trimmed
    );
  }

  get companiesWithLogos(): string[] {
    return this.companies.filter((c) => this.hasCompanyLogo(c));
  }

  companyLogo(company: string): string {
    if (!company) return 'VidhuraTechIcon.png';
    const trimmed = company.trim();
    const key = Object.keys(this.companyLogos).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (key) {
      return this.companyLogos[key];
    }
    const filename = trimmed.toLowerCase().replace(/[\s_]+/g, '-');
    return `logos/${filename}.svg`;
  }

  setPage(page: number | string): void {
    if (typeof page === 'string') return;
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 420, behavior: 'smooth' });
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  clearAllFilters(): void {
    this.search = '';
    this.selectedCompany = 'ALL';
    this.selectedSkill = 'ALL';
    this.selectedType = 'ALL';
    this.selectedAccess = 'ALL';
    this.selectedStatus = 'ALL';
    this.sortBy = 'LATEST';
    this.resetPage();
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.search.trim() ||
      this.selectedCompany !== 'ALL' ||
      this.selectedSkill !== 'ALL' ||
      this.selectedType !== 'ALL' ||
      this.selectedAccess !== 'ALL' ||
      this.selectedStatus !== 'ALL' ||
      this.sortBy !== 'LATEST'
    );
  }

  toggleSkillFilter(skill: string): void {
    if (this.selectedSkill === skill) {
      this.selectedSkill = 'ALL';
    } else {
      this.selectedSkill = skill;
    }
    this.resetPage();
  }

  toggleCompanyFilter(company: string): void {
    if (this.selectedCompany === company) {
      this.selectedCompany = 'ALL';
    } else {
      this.selectedCompany = company;
    }
    this.resetPage();
  }

  getSkillMetadata(skill: string): { icon: string; color: string } {
    const lower = String(skill || '').toLowerCase();
    if (lower.includes('array')) {
      return { icon: 'fa-solid fa-layer-group', color: '#2563eb' };
    }
    if (lower.includes('string')) {
      return { icon: 'fa-solid fa-font', color: '#dc2626' };
    }
    if (lower.includes('pointer') || lower.includes('two')) {
      return { icon: 'fa-solid fa-bolt', color: '#f59e0b' };
    }
    if (lower.includes('dynamic') || lower.includes('dp') || lower.includes('programming')) {
      return { icon: 'fa-solid fa-brain', color: '#7c3aed' };
    }
    if (lower.includes('tree') || lower.includes('bst')) {
      return { icon: 'fa-solid fa-code-branch', color: '#059669' };
    }
    if (lower.includes('graph') || lower.includes('dfs') || lower.includes('bfs') || lower.includes('node')) {
      return { icon: 'fa-solid fa-circle-nodes', color: '#0ea5e9' };
    }
    if (lower.includes('sql') || lower.includes('database') || lower.includes('db')) {
      return { icon: 'fa-solid fa-database', color: '#ec4899' };
    }
    if (lower.includes('sort') || lower.includes('search')) {
      return { icon: 'fa-solid fa-arrow-down-a-z', color: '#14b8a6' };
    }
    if (lower.includes('stack') || lower.includes('queue') || lower.includes('list')) {
      return { icon: 'fa-solid fa-boxes-stacked', color: '#f43f5e' };
    }
    return { icon: 'fa-solid fa-code', color: '#64748b' };
  }

  trackLoginAndStreak(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];

      const today = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"

      if (!history.includes(today)) {
        history.push(today);
        history = history.sort().slice(-60);
        localStorage.setItem('vt_login_history', JSON.stringify(history));
      }
      this.loginHistory = history;
    } catch {
      this.loginHistory = [new Date().toLocaleDateString('en-CA')];
    }
  }

  get calculatedStreak(): number {
    if (this.loginHistory.length === 0) return 0;

    const sorted = [...this.loginHistory].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    const currentCheck = new Date(sorted[0]);

    while (true) {
      const currentCheckStr = currentCheck.toLocaleDateString('en-CA');
      if (sorted.includes(currentCheckStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  /** Global XP points synced through GamificationService */
  get streakPoints(): number {
    return this.gamificationService.pointsSubject?.value || 150;
  }

  /** 1 badge for every 7 consecutive streak days */
  get streakBadges(): number {
    return Math.floor(this.calculatedStreak / 7);
  }

  /** Next badge milestone */
  get nextBadgeIn(): number {
    return 7 - (this.calculatedStreak % 7);
  }

  /* ── Streak Calendar ── */
  toggleStreakCalendar(): void {
    this.showStreakCalendar = !this.showStreakCalendar;
    if (this.showStreakCalendar) {
      const today = new Date();
      this.calendarMonth = today.getMonth();
      this.calendarYear = today.getFullYear();
    }
  }

  calendarPrevMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
  }

  calendarNextMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
  }

  get calendarMonthLabel(): string {
    return new Date(this.calendarYear, this.calendarMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  get calendarGrid(): { day: number; dateStr: string; isStreakDay: boolean; isToday: boolean; isEmpty: boolean; solvedCount: number }[][] {
    const history = this.loginHistory || [];
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');

    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

    const weeks: { day: number; dateStr: string; isStreakDay: boolean; isToday: boolean; isEmpty: boolean; solvedCount: number }[][] = [];
    let week: { day: number; dateStr: string; isStreakDay: boolean; isToday: boolean; isEmpty: boolean; solvedCount: number }[] = [];

    for (let i = 0; i < startDow; i++) {
      week.push({ day: 0, dateStr: '', isStreakDay: false, isToday: false, isEmpty: true, solvedCount: 0 });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      week.push({
        day: d,
        dateStr,
        isStreakDay: history.includes(dateStr),
        isToday: dateStr === todayStr,
        isEmpty: false,
        solvedCount: this.getSolvedCountForDate(dateStr)
      });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: 0, dateStr: '', isStreakDay: false, isToday: false, isEmpty: true, solvedCount: 0 });
      }
      weeks.push(week);
    }

    return weeks;
  }

  get weeklyStreakDays(): { label: string; active: boolean; isToday: boolean }[] {
    const history = this.loginHistory || [];
    const today = new Date();

    const currentDay = today.getDay();
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayDiff);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toLocaleDateString('en-CA');
      const isToday = d.toDateString() === today.toDateString();
      const active = history.includes(dateStr);

      list.push({
        label: labels[i],
        active,
        isToday
      });
    }
    return list;
  }

  trackChallengeSolved(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const solvedDatesJson = localStorage.getItem('vt_challenges_solved_dates');
      let solvedDates: string[] = solvedDatesJson ? JSON.parse(solvedDatesJson) : [];

      const today = new Date().toLocaleDateString('en-CA');

      if (!solvedDates.includes(today)) {
        solvedDates.push(today);
        solvedDates = solvedDates.sort().slice(-60);
        localStorage.setItem('vt_challenges_solved_dates', JSON.stringify(solvedDates));
      }

      // Add to vt_solved_item_ids list
      const solvedIdsJson = localStorage.getItem('vt_solved_item_ids');
      let solvedIds: string[] = solvedIdsJson ? JSON.parse(solvedIdsJson) : [];
      const key = `${this.mode}_${this.mode === 'CHALLENGE' ? this.challengeId : this.assessmentId}`;
      if (!solvedIds.includes(key)) {
        solvedIds.push(key);
        localStorage.setItem('vt_solved_item_ids', JSON.stringify(solvedIds));
      }

      // Update daily solved count (used for goal progress)
      const countJson = localStorage.getItem('vt_daily_solved_count');
      let currentGoalObj = countJson ? JSON.parse(countJson) : { date: today, count: 0 };
      if (currentGoalObj.date === today) {
        currentGoalObj.count++;
      } else {
        currentGoalObj = { date: today, count: 1 };
      }
      localStorage.setItem('vt_daily_solved_count', JSON.stringify(currentGoalObj));

      // Update daily solved history (used for calendar heatmap)
      const historyJson = localStorage.getItem('vt_daily_solve_history');
      let dailyHistory: Record<string, number> = historyJson ? JSON.parse(historyJson) : {};
      dailyHistory[today] = (dailyHistory[today] || 0) + 1;
      localStorage.setItem('vt_daily_solve_history', JSON.stringify(dailyHistory));
    } catch { }
  }

  isItemSolved(item: any): boolean {
    if (!item) return false;
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      // 1. Check if the API response model itself indicates it's solved or completed
      if (item.solved === true || item.isSolved === true || item.completed === true || item.userStatus === 'SOLVED') {
        return true;
      }
      // 2. Check local storage list
      const solvedIdsJson = localStorage.getItem('vt_solved_item_ids');
      const solvedIds: string[] = solvedIdsJson ? JSON.parse(solvedIdsJson) : [];
      const type = this.resolvePracticeType(item);
      const key = `${type}_${item.id}`;
      return solvedIds.includes(key) || solvedIds.includes(`CHALLENGE_${item.id}`) || solvedIds.includes(`ASSESSMENT_${item.id}`);
    } catch {
      return false;
    }
  }

  get isChallengeSolvedToday(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const solvedDatesJson = localStorage.getItem('vt_challenges_solved_dates');
      const solvedDates: string[] = solvedDatesJson ? JSON.parse(solvedDatesJson) : [];
      const today = new Date().toLocaleDateString('en-CA');
      return solvedDates.includes(today);
    } catch {
      return false;
    }
  }

  get streakMessage(): string {
    if (!this.isLoggedIn) {
      return 'Please log in to sync and protect your daily streak.';
    }
    if (this.isChallengeSolvedToday) {
      return 'Streak kept alive for today! Keep up the great work! 🔥';
    }
    return 'Solve 1 more challenge today to keep your streak alive!';
  }

  /* ── 1. Longest Streak Record ── */
  get longestStreak(): number {
    if (this.loginHistory.length === 0) return 0;
    const sorted = [...this.loginHistory].sort();
    let max = 1, current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        max = Math.max(max, current);
      } else if (diff > 1) {
        current = 1;
      }
    }
    return Math.max(max, this.loginHistory.length === 1 ? 1 : max);
  }

  get isNewRecord(): boolean {
    return this.calculatedStreak > 0 && this.calculatedStreak >= this.longestStreak;
  }

  /* ── 2. Weekly Progress ── */
  get weeklyProgress(): number {
    return this.weeklyStreakDays.filter(d => d.active).length;
  }

  get weeklyProgressPercent(): number {
    return Math.round((this.weeklyProgress / 7) * 100);
  }

  /* ── 3. Daily Goal ── */
  get dailyGoalTarget(): number {
    return 3;
  }

  get dailyGoalSolved(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    try {
      const json = localStorage.getItem('vt_daily_solved_count');
      if (!json) return 0;
      const data = JSON.parse(json);
      const today = new Date().toLocaleDateString('en-CA');
      return data.date === today ? (data.count || 0) : 0;
    } catch { return 0; }
  }

  get dailyGoalPercent(): number {
    return Math.min(100, Math.round((this.dailyGoalSolved / this.dailyGoalTarget) * 100));
  }

  get dailyGoalComplete(): boolean {
    return this.dailyGoalSolved >= this.dailyGoalTarget;
  }

  /* ── 4. Streak Milestones ── */
  get streakMilestone(): { label: string; icon: string; color: string; next: number } {
    const s = this.calculatedStreak;
    if (s >= 100) return { label: 'Diamond', icon: 'fa-gem', color: '#06b6d4', next: 0 };
    if (s >= 60)  return { label: 'Platinum', icon: 'fa-crown', color: '#a78bfa', next: 100 };
    if (s >= 30)  return { label: 'Gold', icon: 'fa-trophy', color: '#f59e0b', next: 60 };
    if (s >= 14)  return { label: 'Silver', icon: 'fa-medal', color: '#94a3b8', next: 30 };
    if (s >= 7)   return { label: 'Bronze', icon: 'fa-award', color: '#d97706', next: 14 };
    return { label: 'Starter', icon: 'fa-seedling', color: '#22c55e', next: 7 };
  }

  get milestoneProgress(): number {
    const m = this.streakMilestone;
    if (m.next === 0) return 100;
    const tiers = [0, 7, 14, 30, 60, 100];
    const currentTierStart = tiers[tiers.indexOf(m.next) - 1] || 0;
    return Math.round(((this.calculatedStreak - currentTierStart) / (m.next - currentTierStart)) * 100);
  }

  /* ── 5. Heatmap intensity for calendar ── */
  getSolvedCountForDate(dateStr: string): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    try {
      const json = localStorage.getItem('vt_daily_solve_history');
      if (!json) return 0;
      const data: Record<string, number> = JSON.parse(json);
      return data[dateStr] || 0;
    } catch { return 0; }
  }

  /* ── 6. Motivational Quotes ── */
  get motivationalQuote(): string {
    const s = this.calculatedStreak;
    if (s === 0) return '💪 Start your streak today — every expert was once a beginner!';
    if (s === 1) return '🌱 Day 1 done! The journey of a thousand miles begins with a single step.';
    if (s <= 3)  return '🔥 ' + s + ' days strong! Building momentum — keep pushing!';
    if (s <= 7)  return '⚡ Almost a full week! You\'re building a powerful habit.';
    if (s <= 14) return '🏆 Over a week! You\'re in the top 20% of consistent coders!';
    if (s <= 30) return '🚀 ' + s + ' days! You\'re unstoppable — discipline beats motivation!';
    if (s <= 60) return '💎 ' + s + ' day streak! You\'re in the top 5% of all users!';
    return '👑 ' + s + ' days — Legendary! You\'re an absolute coding machine!';
  }

  /* ── 7. Leaderboard Position ── */
  get leaderboardRank(): number {
    return this.gamificationService.rankSubject?.value || 512;
  }

  get leaderboardTotal(): number {
    if (this.leaderboardTotalValue > 0) {
      return this.leaderboardTotalValue;
    }
    return 1582;
  }

  loadRealTimeLeaderboard(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.isLoggedIn) {
      this.leaderboardRankValue = 0;
      this.leaderboardTotalValue = 0;
      return;
    }

    this.publicPracticeService.getWeeklyLeaderboard().subscribe({
      next: (res: any) => {
        const entries = this.normalizeLeaderboardList(res);
        const currentUser = this.authService.getUser();
        const userId = currentUser?.id ? Number(currentUser.id) : null;

        if (entries && entries.length) {
          this.leaderboardTotalValue = entries.length;

          if (userId) {
            const userIndex = entries.findIndex((entry: any) => {
              const entryUserId = entry.userId || entry.user?.id || entry.id;
              return entryUserId && Number(entryUserId) === userId;
            });

            if (userIndex !== -1) {
              this.leaderboardRankValue = userIndex + 1;
            } else {
              this.leaderboardRankValue = entries.length + 1;
              this.leaderboardTotalValue = entries.length + 1;
            }
          }
        }
      },
      error: () => {
        this.leaderboardRankValue = 0;
        this.leaderboardTotalValue = 0;
      }
    });
  }

  normalizeLeaderboardList(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    const payload = value.data || value;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.entries)) return payload.entries;
    if (Array.isArray(payload.leaderboard)) return payload.leaderboard;
    if (Array.isArray(payload.results)) return payload.results;

    return [];
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

  switchConsoleTab(tab: 'samples' | 'results' | 'custom'): void {
    this.activeConsoleTab = tab;
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }

  askAiReviewer(): void {
    if (!this.challengeId) return;

    if (!this.workspaceUnlocked || !this.currentGrant?.accessToken) {
      this.requestWorkspaceAccess('Please register to get an access token before requesting AI code review.');
      return;
    }

    this.showAiSidebar = true;
    this.aiReviewLoading = true;
    this.aiReviewHtml = null;

    const payload = {
      code: this.sourceCode,
      language: this.language,
      accessToken: this.currentGrant.accessToken
    };

    this.publicPracticeService.reviewChallenge(this.challengeId, payload).subscribe({
      next: (res: any) => {
        const reviewText = res?.data?.review || '';
        this.aiReviewHtml = this.parseMarkdown(reviewText);
        this.aiReviewLoading = false;
      },
      error: (err: any) => {
        this.aiReviewLoading = false;
        const errMsg = err?.error?.message || 'Error occurred while contacting the AI Reviewer. Please try again.';
        this.aiReviewHtml = this.sanitizer.bypassSecurityTrustHtml(
          `<div class="ai-error-box">
            <i class="fa fa-exclamation-triangle mr-2"></i> ${errMsg}
          </div>`
        );
      }
    });
  }

  closeAiSidebar(): void {
    this.showAiSidebar = false;
  }

  parseMarkdown(md: string): SafeHtml {
    if (!md) return this.sanitizer.bypassSecurityTrustHtml('');

    const buildVscodeFrame = (codeText: string, codeLanguage: string, codeLinesCount: number) => {
      let lineNumbersHtml = '';
      for (let l = 1; l <= codeLinesCount; l++) {
        lineNumbersHtml += `<div>${l}</div>`;
      }

      const extMap: Record<string, string> = {
        python: 'py',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        csharp: 'cs',
        php: 'php',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        typescript: 'ts',
        javascript: 'js'
      };
      const fileExt = extMap[codeLanguage] || 'txt';
      const fileName = `AlternativeSolution.${fileExt}`;

      return `
        <div class="vscode-frame">
          <div class="vscode-header">
            <div class="vscode-controls">
              <span class="control-dot close"></span>
              <span class="control-dot minimize"></span>
              <span class="control-dot maximize"></span>
            </div>
            <div class="vscode-tab active">
              <i class="fa-solid fa-code"></i>
              <span>${fileName}</span>
            </div>
            <button type="button" class="vscode-copy-btn" onclick="const code = this.closest('.vscode-frame').querySelector('.vscode-code code').innerText; navigator.clipboard.writeText(code); const icon = this.querySelector('i'); icon.className = 'fa-solid fa-check'; setTimeout(() => icon.className = 'fa-regular fa-copy', 2000);">
              <i class="fa-regular fa-copy"></i> Copy
            </button>
          </div>
          <div class="vscode-editor-body">
            <div class="vscode-line-numbers">${lineNumbersHtml}</div>
            <pre class="vscode-code"><code class="language-${codeLanguage}">${codeText}</code></pre>
          </div>
        </div>
      `;
    };

    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code Block detection
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeBlockContent.join('\n')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          html += buildVscodeFrame(codeText, codeLanguage, codeBlockContent.length);
          codeBlockContent = [];
          codeLanguage = '';
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim().toLowerCase();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Escape line to prevent injection
      line = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Replace symbols with Safe HTML equivalents
      line = line.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Headings
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4 class="ai-h4">${line.substring(4).trim()}</h4>`;
      } else if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 class="ai-h3">${line.substring(3).trim()}</h3>`;
      } else if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 class="ai-h2">${line.substring(2).trim()}</h2>`;
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          html += '<ul class="ai-list">';
          inList = true;
        }
        const content = line.trim().substring(2).trim();
        html += `<li>${content}</li>`;
      }
      // Paragraph or empty line
      else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line.trim()) {
          html += `<p class="ai-p">${line}</p>`;
        }
      }
    }

    if (inList) {
      html += '</ul>';
    }
    if (inCodeBlock && codeBlockContent.length > 0) {
      const codeText = codeBlockContent.join('\n')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html += buildVscodeFrame(codeText, codeLanguage, codeBlockContent.length);
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  challengeTimer: any;
  timeLeftSeconds = 0;
  timerExpired = false;

  get formattedTimeLeft(): string {
    const mins = Math.floor(this.timeLeftSeconds / 60);
    const secs = this.timeLeftSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  startChallengeTimer(durationMinutes: number): void {
    if (this.challengeTimer) {
      clearInterval(this.challengeTimer);
    }
    this.timeLeftSeconds = (durationMinutes || 30) * 60;
    this.timerExpired = false;
    this.challengeTimer = setInterval(() => {
      if (this.timeLeftSeconds > 0) {
        this.timeLeftSeconds--;
        if (this.timeLeftSeconds === 0) {
          this.timerExpired = true;
          clearInterval(this.challengeTimer);
          this.showToast('Time limit reached for this challenge!');
        }
      } else {
        clearInterval(this.challengeTimer);
      }
    }, 1000);
  }

  stopChallengeTimer(): void {
    if (this.challengeTimer) {
      clearInterval(this.challengeTimer);
      this.challengeTimer = null;
    }
  }
}
