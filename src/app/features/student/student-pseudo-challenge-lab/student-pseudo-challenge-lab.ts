import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CodeLanguage, PseudoChallengeService } from '../../services/pseudo-challenge';
import { ActivatedRoute, Router } from '@angular/router';
interface LanguageOption {
  label: string;
  value: CodeLanguage;
  fileName: string;
  runtime: string;
}

interface CompilerDiagnostic {
  line: number | null;
  column: number | null;
  message: string;
  raw: string;
}

@Component({
  selector: 'app-student-pseudo-challenge-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  templateUrl: './student-pseudo-challenge-lab.html',
  styleUrls: ['./student-pseudo-challenge-lab.css'],
})
export class StudentPseudoChallengeLabComponent implements OnInit, OnDestroy {
  opening = false;
  running = false;
  saving = false;
  submitting = false;
  toast = '';
  leftTab: 'description' | 'samples' | 'hint' = 'description';
  consoleExpanded = false;

  selectedChallenge: any = null;
  result: any = null;
  language: CodeLanguage = 'PYTHON';
  sourceCode = '';
  languageDrafts: Partial<Record<CodeLanguage, string>> = {};
  showMoreLanguages = false;
  showSubmitModal = false;
  lastSavedCode = '';
  lastSavedLanguage: CodeLanguage | null = null;
  compilerDiagnostics: CompilerDiagnostic[] = [];
  localDiagnostics: CompilerDiagnostic[] = [];
  validationErrors: string[] = [];

  private readonly maxSourceChars = 20000;
  private readonly maxSourceLines = 600;

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

  private readonly shellCommandPattern =
    /^(find|cat|ls|pwd|whoami|id|uname|ps|env|printenv|curl|wget|nc|netcat|bash|sh|zsh|python|python3|perl|ruby)\b/i;

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
    spellcheck: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      alwaysConsumeMouseWheel: false,
    },
  };

  isFullscreen = false;
  showSubmitSuccess = false;
  successRedirectSeconds = 3;
  private successRedirectTimer: any;
  private successCountdownTimer: any;

  primaryLanguages: LanguageOption[] = [
    { label: 'Python', value: 'PYTHON', fileName: 'main.py', runtime: 'Python 3.14' },
    { label: 'Java', value: 'JAVA', fileName: 'Main.java', runtime: 'OpenJDK 25' },
  ];

  moreLanguages: LanguageOption[] = [
    { label: 'C', value: 'C', fileName: 'main.c', runtime: 'GCC 15' },
    { label: 'C++', value: 'CPP', fileName: 'main.cpp', runtime: 'G++ 15' },
    { label: 'C#', value: 'CSHARP', fileName: 'Program.cs', runtime: '.NET SDK 9' },
    { label: 'F#', value: 'FSHARP', fileName: 'Program.fs', runtime: '.NET SDK 9' },
    { label: 'PHP', value: 'PHP', fileName: 'main.php', runtime: 'PHP 8.5' },
    { label: 'Ruby', value: 'RUBY', fileName: 'main.rb', runtime: 'Ruby 4.0' },
    { label: 'Haskell', value: 'HASKELL', fileName: 'Main.hs', runtime: 'GHC 9.12' },
    { label: 'Go', value: 'GO', fileName: 'main.go', runtime: 'Go 1.26' },
    { label: 'Rust', value: 'RUST', fileName: 'main.rs', runtime: 'Rust 1.93' },
    { label: 'TypeScript', value: 'TYPESCRIPT', fileName: 'main.ts', runtime: 'Deno TypeScript' },
  ];

  hintUnlocked = false;
  showHintPanel = false;
  hintUnlockSeconds = 30;
  private hintUnlockTimer: any;

  constructor(
    private service: PseudoChallengeService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.openChallenge(id);
    }
  }

  @HostListener('window:keydown.control.s', ['$event'])
  handleSaveShortcut(event: Event): void {
    event.preventDefault();

    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.ctrlKey && keyboardEvent.key === 's') {
      this.saveCode();
    }
  }

  private handleFullscreenChange = (): void => {
    this.isFullscreen = !!document.fullscreenElement;
  };

  toggleFullscreen(): void {
    const target = document.querySelector('.lab-page') as HTMLElement | null;

    if (!document.fullscreenElement) {
      target?.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    clearTimeout(this.hoverTimer);
    clearTimeout(this.successRedirectTimer);
    clearInterval(this.successCountdownTimer);
    clearInterval(this.hintUnlockTimer);
    this.diagnosticHoverDisposable?.dispose?.();
    this.cursorHoverDisposable?.dispose?.();
  }

  get selectedLanguage(): LanguageOption {
    return (
      [...this.primaryLanguages, ...this.moreLanguages].find(
        (item) => item.value === this.language,
      ) || this.primaryLanguages[0]
    );
  }

  get editorLanguage(): string {
    const map: Record<CodeLanguage, string> = {
      JAVA: 'java',
      PYTHON: 'python',
      C: 'c',
      CPP: 'cpp',
      CSHARP: 'csharp',
      FSHARP: 'fsharp',
      PHP: 'php',
      RUBY: 'ruby',
      HASKELL: 'haskell',
      GO: 'go',
      RUST: 'rust',
      TYPESCRIPT: 'typescript',
    };

    return map[this.language];
  }

  get codeLineCount(): number {
    return this.sourceCode.split('\n').filter((line) => line.trim()).length;
  }

  get visibleTestCases(): any[] {
    return (this.selectedChallenge?.testCases || []).filter((tc: any) => !tc.hidden).slice(0, 3);
  }

  get canRun(): boolean {
    return !!this.selectedChallenge && !!this.sourceCode.trim() && !this.running;
  }

  get hasUnsavedChanges(): boolean {
    return (
      this.sourceCode.trim() !== this.lastSavedCode.trim() ||
      this.language !== this.lastSavedLanguage
    );
  }

  get computedPercentage(): number {
    if (!this.result) return 0;
    if (this.result.testResults && this.result.testResults.length > 0) {
      const allPassed = this.result.testResults.every((test: any) => test.status === 'PASS');
      if (allPassed) {
        return 100;
      }

      let totalMarks = 0;
      let obtainedMarks = 0;
      let hasMarksField = false;

      this.result.testResults.forEach((test: any) => {
        if (typeof test.marks === 'number' || (test.marks && !isNaN(Number(test.marks)))) {
          const m = Number(test.marks);
          totalMarks += m;
          obtainedMarks += test.status === 'PASS' ? m : Number(test.marksObtained || 0);
          hasMarksField = true;
        }
      });

      if (hasMarksField && totalMarks > 0) {
        return Math.round((obtainedMarks / totalMarks) * 100);
      }

      const passedCount = this.result.testResults.filter((test: any) => test.status === 'PASS').length;
      return Math.round((passedCount / this.result.testResults.length) * 100);
    }
    return this.result.percentage || 0;
  }

  get isWorkspacePass(): boolean {
    if (!this.result) return false;
    if (this.result.status === 'PASS' || this.result.allTestsPassed === true) return true;
    const percentage = this.computedPercentage;
    if (this.selectedChallenge && typeof percentage === 'number') {
      return percentage >= this.selectedChallenge.passPercentage;
    }
    return false;
  }

  get hasFailedTests(): boolean {
    if (!this.result?.testResults) return false;
    return this.result.testResults.some((test: any) => test.status !== 'PASS');
  }

  get hasCompilerErrors(): boolean {
    return !!this.result?.compileError || this.compilerDiagnostics.length > 0;
  }

  get hintButtonLabel(): string {
    if (!this.hintUnlocked) {
      return `Unlocks in ${this.hintUnlockSeconds}s`;
    }

    return this.showHintPanel ? 'Hide Hint' : 'Show Hint';
  }

  openChallenge(id: number): void {
    this.opening = true;
    this.selectedChallenge = null;
    this.result = null;
    this.sourceCode = '';
    this.languageDrafts = {};
    this.showMoreLanguages = false;
    this.applyCompilerErrors('');
    this.leftTab = 'description';
    this.consoleExpanded = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.getStudentChallenge(id).subscribe({
      next: (res: any) => {
        this.selectedChallenge = res?.data || res;

        this.language = 'PYTHON';
        this.languageDrafts = this.selectedChallenge?.savedDrafts || {};

        this.sourceCode = this.languageDrafts[this.language] || this.starterCode(this.language);

        this.lastSavedCode = this.sourceCode;
        this.lastSavedLanguage = this.language;

        this.opening = false;

        this.editorOptions = {
          ...this.editorOptions,
          language: this.editorLanguage,
        };

        this.startHintTimer();

        setTimeout(() => {
          this.syncEditorValue();
          this.applyCompilerErrors('');
          this.validateCode();
        });
      },
      error: (error) => {
        console.error('Open challenge error:', error);
        this.opening = false;

        if (error.status === 403) this.showToast('Access denied');
        else if (error.status === 404) this.showToast('Challenge not found');
        else this.showToast('Unable to open challenge');
      },
    });
  }

  closeCompiler(): void {
    this.router.navigate(['/dashboard/student/pseudo-challenges']);
  }

  changeLanguage(language: CodeLanguage): void {
    if (this.language === language) return;

    this.languageDrafts[this.language] = this.sourceCode;
    this.language = language;
    this.result = null;
    this.showMoreLanguages = false;
    this.sourceCode = this.languageDrafts[language] || this.starterCode(language);
    this.lastSavedCode = this.sourceCode;
    this.lastSavedLanguage = language;
    this.editorOptions = { ...this.editorOptions, language: this.editorLanguage };

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

  setStarterCode(): void {
    this.sourceCode = this.starterCode(this.language);
    this.result = null;
    setTimeout(() => {
      this.applyCompilerErrors('');
      this.validateCode();
    });
  }

  clearCode(): void {
    this.sourceCode = '';
    this.result = null;
    this.applyCompilerErrors('');
    this.validateCode();
  }

  formatCode(): void {
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
      let indent = 0;
      this.sourceCode = this.sourceCode
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';

          if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
            indent = 0;
          } else if (
            trimmed.startsWith('elif ') ||
            trimmed.startsWith('else:') ||
            trimmed.startsWith('else ') ||
            trimmed.startsWith('except ') ||
            trimmed.startsWith('except:') ||
            trimmed.startsWith('finally:') ||
            trimmed.startsWith('finally ')
          ) {
            indent = Math.max(indent - 1, 0);
          }

          const formatted = `${'    '.repeat(indent)}${trimmed}`;

          if (trimmed.endsWith(':')) {
            indent += 1;
          } else if (
            trimmed.startsWith('return') ||
            trimmed.startsWith('break') ||
            trimmed.startsWith('continue') ||
            trimmed.startsWith('pass')
          ) {
            indent = Math.max(indent - 1, 0);
          }

          return formatted;
        })
        .join('\n');

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

  insertSnippet(type: 'input' | 'loop' | 'print'): void {
    this.insertAtCursor(this.snippets(this.language)[type]);
  }

  runCode(): void {
    if (this.running || this.submitting || this.saving) return;

    if (!this.selectedChallenge?.id) {
      this.showToast('Challenge not found');
      return;
    }

    const code = this.sourceCode?.trim();

    if (!this.validateBeforeAction('run')) {
      return;
    }

    if (!code) {
      this.result = null;
      this.applyCompilerErrors('');
      this.showToast('Write code before running test cases');
      return;
    }

    if (code.length < 10) {
      this.result = null;
      this.applyCompilerErrors('');
      this.showToast('Code is too short');
      return;
    }

    this.validateCode();

    if (this.localDiagnostics.length) {
      this.result = {
        status: 'FAIL',
        percentage: 0,
        compileError: this.localDiagnostics.map((item) => item.message).join('\n'),
        testResults: [],
      };
      this.applyCompilerErrors(this.result.compileError);
      this.showToast('Fix highlighted syntax errors before running');
      return;
    }

    this.running = true;
    this.result = null;
    this.applyCompilerErrors('');

    this.service
      .runStudentChallenge(this.selectedChallenge.id, {
        language: this.language,
        sourceCode: code,
      })
      .subscribe({
        next: (res: any) => {
          this.running = false;
          const data = res?.data || res;

          if (!data) {
            this.showToast('Invalid compiler response');
            return;
          }

          this.result = data;
          this.consoleExpanded = true;
          const compilerError = this.result?.compileError || this.firstExecutionError(this.result);

          if (compilerError) this.result = { ...this.result, compileError: compilerError };

          this.applyCompilerErrors(compilerError);

          const passed = this.result?.status === 'PASS' || this.result?.allTestsPassed === true;
          if (passed) this.showToast('All test cases passed successfully');
          else if (compilerError) this.showToast('Compilation failed');
          else this.showToast('Some test cases failed');
        },
        error: (error) => {
          this.running = false;
          console.error('Run code error:', error);
          this.result = {
            status: 'FAIL',
            compileError:
              error?.error?.message || error?.error?.error || 'Compiler execution failed',
            percentage: 0,
            testResults: [],
          };
          this.consoleExpanded = true;
          this.applyCompilerErrors(this.result.compileError);

          if (error.status === 0) this.showToast('Unable to connect to compiler server');
          else if (error.status >= 500) this.showToast('Compiler server error');
          else if (error.status === 403) this.showToast('You do not have access to this challenge');
          else this.showToast(error?.error?.message || 'Compiler failed to run your code');
        },
      });
  }

  saveCode(): void {
    if (this.saving || this.running || this.submitting) return;

    if (!this.selectedChallenge?.id) {
      this.showToast('Challenge not found');
      return;
    }

    const code = this.sourceCode?.trim();

    if (!this.validateBeforeAction('save')) {
      return;
    }

    this.saving = true;

    this.service
      .saveStudentChallenge(this.selectedChallenge.id, {
        language: this.language,
        sourceCode: code,
      })
      .subscribe({
        next: (res: any) => {
          this.saving = false;
          this.lastSavedCode = code;
          this.lastSavedLanguage = this.language;
          this.languageDrafts[this.language] = code;
          this.showToast('Code saved successfully');
          console.log('Draft saved at:', res?.data?.savedAt || new Date().toISOString());
        },
        error: (error) => {
          this.saving = false;
          console.error('Save code error:', error);

          if (error.status === 0) this.showToast('Unable to connect to server');
          else if (error.status === 403) this.showToast('Access denied');
          else if (error.status >= 500) this.showToast('Server error while saving');
          else this.showToast(error?.error?.message || 'Failed to save code');
        },
      });
  }

  submitChallenge(): void {
    if (this.submitting) return;

    if (!this.selectedChallenge?.id) {
      this.showToast('Challenge not found');
      return;
    }

    const code = this.sourceCode?.trim();

    if (!this.validateBeforeAction('submit')) {
      this.showSubmitModal = false;
      return;
    }

    if (!code) {
      this.showToast('Write code before submitting');
      return;
    }

    this.validateCode();

    if (this.localDiagnostics.length) {
      this.result = {
        status: 'FAIL',
        percentage: 0,
        compileError: this.localDiagnostics.map((item) => item.message).join('\n'),
        testResults: [],
      };
      this.applyCompilerErrors(this.result.compileError);
      this.showSubmitModal = false;
      this.showToast('Fix highlighted syntax errors before submitting');
      return;
    }

    this.submitting = true;
    this.applyCompilerErrors('');

    this.service
      .submitStudentChallenge(this.selectedChallenge.id, {
        language: this.language,
        sourceCode: code,
      })
      .subscribe({
        next: (res: any) => {
          this.submitting = false;
          this.showSubmitModal = false;

          const data = res?.data || res;
          this.result = data;
          this.consoleExpanded = true;

          const compilerError = data?.compileError || this.firstExecutionError(data);

          if (compilerError) {
            this.result = { ...this.result, compileError: compilerError };
          }

          this.applyCompilerErrors(compilerError);

          const passed = data?.status === 'PASS' || data?.allTestsPassed === true;

          if (passed && !compilerError) {
            this.showSubmitSuccessAndRedirect();
            return;
          }

          if (compilerError) {
            this.showToast('Challenge submitted with compiler errors');
            return;
          }

          this.showToast('Challenge submitted with failed test cases');
        },
        error: (error) => {
          this.submitting = false;
          console.error('Submit challenge error:', error);
          const compileError =
            error?.error?.message || error?.error?.error || 'Failed to submit challenge';
          this.consoleExpanded = true;
          this.applyCompilerErrors(compileError);

          if (error.status === 0) this.showToast('Unable to connect to server');
          else if (error.status === 403) this.showToast('Access denied');
          else if (error.status >= 500) this.showToast('Submission server error');
          else this.showToast(error?.error?.message || 'Failed to submit challenge');
        },
      });
  }

  openSubmitModal(): void {
    if (this.submitting || this.running || this.saving) return;

    if (!this.selectedChallenge?.id) {
      this.showToast('Challenge not found');
      return;
    }

    const code = this.sourceCode?.trim();

    if (!this.validateBeforeAction('submit')) {
      return;
    }
    
    if (!code) {
      this.showToast('Write code before submitting');
      return;
    }

    if (code.length < 10) {
      this.showToast('Code is incomplete');
      return;
    }

    if (this.hasUnsavedChanges) {
      this.showToast('Please save the unsaved changes before submitting');
      return;
    }

    this.showSubmitModal = true;
  }

  closeSubmitModal(): void {
    this.showSubmitModal = false;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }

  private refreshValidationErrors(): void {
    this.validationErrors = this.collectValidationErrors();
  }

  private collectValidationErrors(): string[] {
    const errors: string[] = [];
    const code = this.sourceCode || '';
    const trimmed = code.trim();
    const language = String(this.language || '').toUpperCase();

    if (!trimmed) {
      errors.push('Source code is required');
      return errors;
    }

    if (!this.isSupportedLanguage(this.language)) {
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

  private validateBeforeAction(action: 'run' | 'save' | 'submit'): boolean {
    this.validateCode();
    this.refreshValidationErrors();

    const allErrors = [
      ...this.validationErrors,
      ...this.localDiagnostics.map((item) => item.message),
    ].filter(Boolean);

    if (!allErrors.length) {
      return true;
    }

    const actionLabel = action === 'run' ? 'running' : action === 'save' ? 'saving' : 'submitting';

    this.result = {
      status: 'FAIL',
      percentage: 0,
      compileError: allErrors.join('\n'),
      testResults: [],
    };

    this.applyCompilerErrors(this.result.compileError);
    this.showToast(`Fix validation errors before ${actionLabel}`);
    return false;
  }

  private isSupportedLanguage(language: CodeLanguage): boolean {
    return [
      'JAVA',
      'PYTHON',
      'C',
      'CPP',
      'CSHARP',
      'FSHARP',
      'PHP',
      'RUBY',
      'HASKELL',
      'GO',
      'RUST',
      'TYPESCRIPT',
    ].includes(language);
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

  getTestPercentage(test: any): number {
    const marks = Number(test?.marks || 0);
    const obtained = Number(test?.marksObtained || 0);
    if (!marks) return test?.status === 'PASS' ? 100 : 0;
    return Math.round((obtained / marks) * 100);
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
      this.result = null;
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
    this.refreshValidationErrors();
    this.localDiagnostics = this.collectLocalDiagnostics();

    const validationDiagnostics: CompilerDiagnostic[] = this.validationErrors.map((message) => ({
      line: null,
      column: null,
      message,
      raw: message,
    }));

    this.compilerDiagnostics = [...validationDiagnostics, ...this.localDiagnostics];

    if (!this.editorInstance || !this.monacoInstance) return;

    const model = this.editorInstance.getModel();
    const sourceLines = this.sourceCode.split('\n');
    this.monacoInstance.editor.setModelMarkers(model, 'student-validation', []);

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

    this.monacoInstance.editor.setModelMarkers(model, 'student-validation', markers);

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
    const language = String(this.language || '').toUpperCase();

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

      if (trimmed.endsWith(':')) {
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
      if (/[+\-*/=<>]$/.test(trimmed) && !trimmed.endsWith('\\')) {
        diagnostics.push({
          line: lineNumber,
          column: line.length,
          message: `SyntaxError: incomplete expression ending with operator '${trimmed.slice(-1)}'.`,
          raw: line,
        });
      }

      // Check for standalone single undefined word/variable typos (e.g. uniqu)
      if (
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed) &&
        !/^(pass|break|continue|return|True|False|None)$/.test(trimmed)
      ) {
        diagnostics.push({
          line: lineNumber,
          column: line.indexOf(trimmed) + 1,
          message: `SyntaxError: incomplete statement or name '${trimmed}' is not defined.`,
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

      const statementOnly = trimmed.split('//')[0].trim();
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

  private collectGenericDiagnostics(lines: string[], diagnostics: CompilerDiagnostic[], language: string): void {
    let braceBalance = 0;
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

      // Bracket matching check
      this.addBracketDiagnostics(line, lineNumber, diagnostics, `${language} syntax error`);

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

      braceBalance += (withoutString.match(/{/g) || []).length;
      braceBalance -= (withoutString.match(/}/g) || []).length;
    });

    if (braceBalance > 0) {
      diagnostics.push({
        line: lines.length,
        column: Math.max(1, lines[lines.length - 1]?.length || 1),
        message: `Syntax Error: missing closing brace \`}\`.`,
        raw: lines[lines.length - 1] || '',
      });
    } else if (braceBalance < 0) {
      diagnostics.push({
        line: lines.length,
        column: Math.max(1, lines[lines.length - 1]?.length || 1),
        message: `Syntax Error: unmatched closing brace \`}\`.`,
        raw: lines[lines.length - 1] || '',
      });
    }
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

  private insertAtCursor(value: string): void {
    if (!this.editorInstance || !this.monacoInstance) {
      this.sourceCode = `${this.sourceCode}${this.sourceCode ? '\n' : ''}${value}`;
      return;
    }

    const selection = this.editorInstance.getSelection();
    const range = new this.monacoInstance.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn,
    );

    this.editorInstance.executeEdits('snippet-insert', [
      { range, text: value, forceMoveMarkers: true },
    ]);

    this.sourceCode = this.editorInstance.getValue();
    this.editorInstance.focus();
    this.validateCode();
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

  private firstExecutionError(result: any): string {
    const failedTest = result?.testResults?.find(
      (test: any) => test?.errorMessage || test?.compileError,
    );
    return failedTest?.compileError || failedTest?.errorMessage || result?.compileError || '';
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

  get hintSteps(): string[] {
    const hintText = this.selectedChallenge?.hintText || '';

    if (!hintText.trim()) {
      return [];
    }

    return hintText
      .split(/\r?\n|\. /)
      .map((x: string) => x.trim())
      .filter(Boolean);
  }

  private startHintTimer(): void {
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

        this.showToast('💡 Hint unlocked');
      }
    }, 1000);
  }
  toggleHintPanel(): void {
    if (!this.hintUnlocked) {
      return;
    }

    this.showHintPanel = !this.showHintPanel;
  }

  get hintProgress(): number {
    return ((30 - this.hintUnlockSeconds) / 30) * 100;
  }

  private snippets(language: CodeLanguage): Record<'input' | 'loop' | 'print', string> {
    const values: Record<CodeLanguage, Record<'input' | 'loop' | 'print', string>> = {
      PYTHON: {
        input: 'n = int(input())\narr = list(map(int, input().split()))',
        loop: 'for value in arr:\n    pass',
        print: 'print(result)',
      },
      JAVA: {
        input: 'Scanner sc = new Scanner(System.in);\nint n = sc.nextInt();',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'System.out.println(result);',
      },
      C: {
        input: 'int n;\nscanf("%d", &n);',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'printf("%d\\n", result);',
      },
      CPP: {
        input: 'int n;\ncin >> n;',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'cout << result << endl;',
      },
      CSHARP: {
        input: 'int n = int.Parse(Console.ReadLine()!);',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'Console.WriteLine(result);',
      },
      FSHARP: {
        input: 'let n = Console.ReadLine() |> int',
        loop: 'for value in arr do\n  ()',
        print: 'printfn "%d" result',
      },
      PHP: {
        input: '$n = intval(trim(fgets(STDIN)));',
        loop: 'for ($i = 0; $i < $n; $i++) {\n  \n}',
        print: 'echo $result . PHP_EOL;',
      },
      RUBY: {
        input: 'n = STDIN.gets.to_i',
        loop: 'arr.each do |value|\n  \nend',
        print: 'puts result',
      },
      HASKELL: {
        input: 'line <- getLine\nlet n = read line :: Int',
        loop: 'mapM_ print nums',
        print: 'print result',
      },
      GO: {
        input: 'var n int\nfmt.Scan(&n)',
        loop: 'for i := 0; i < n; i++ {\n  \n}',
        print: 'fmt.Println(result)',
      },
      RUST: {
        input: 'let mut input = String::new();\nio::stdin().read_to_string(&mut input).unwrap();',
        loop: 'for value in values {\n    \n}',
        print: 'println!("{}", result);',
      },
      TYPESCRIPT: {
        input: 'const input = await Deno.readTextFile("/dev/stdin");',
        loop: 'for (const value of arr) {\n  \n}',
        print: 'console.log(result);',
      },
    };

    return values[language];
  }

  private starterCode(language: CodeLanguage): string {
    const starters: Record<CodeLanguage, string> = {
      PYTHON: [
        'n = int(input())',
        'arr = list(map(int, input().split()))',
        '',
        'largest = arr[0]',
        'for num in arr:',
        '    if num > largest:',
        '        largest = num',
        '',
        'print(largest)',
      ].join('\n'),
      JAVA: [
        'import java.util.*;',
        '',
        'public class Main {',
        '  public static void main(String[] args) {',
        '    Scanner sc = new Scanner(System.in);',
        '    int n = sc.nextInt();',
        '    int largest = sc.nextInt();',
        '',
        '    for (int i = 1; i < n; i++) {',
        '      int value = sc.nextInt();',
        '      if (value > largest) {',
        '        largest = value;',
        '      }',
        '    }',
        '',
        '    System.out.println(largest);',
        '  }',
        '}',
      ].join('\n'),
      C: [
        '#include <stdio.h>',
        '',
        'int main() {',
        '  int n;',
        '  scanf("%d", &n);',
        '',
        '  int largest, value;',
        '  scanf("%d", &largest);',
        '',
        '  for (int i = 1; i < n; i++) {',
        '    scanf("%d", &value);',
        '    if (value > largest) largest = value;',
        '  }',
        '',
        '  printf("%d\\n", largest);',
        '  return 0;',
        '}',
      ].join('\n'),
      CPP: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'int main() {',
        '  int n;',
        '  cin >> n;',
        '',
        '  int largest, value;',
        '  cin >> largest;',
        '',
        '  for (int i = 1; i < n; i++) {',
        '    cin >> value;',
        '    if (value > largest) largest = value;',
        '  }',
        '',
        '  cout << largest << endl;',
        '  return 0;',
        '}',
      ].join('\n'),
      CSHARP: [
        'using System;',
        '',
        'class Program {',
        '  static void Main() {',
        '    int n = int.Parse(Console.ReadLine()!);',
        '    int[] arr = Array.ConvertAll(Console.ReadLine()!.Split(), int.Parse);',
        '',
        '    int largest = arr[0];',
        '    foreach (int value in arr) {',
        '      if (value > largest) largest = value;',
        '    }',
        '',
        '    Console.WriteLine(largest);',
        '  }',
        '}',
      ].join('\n'),
      FSHARP: [
        'open System',
        '',
        'let n = Console.ReadLine() |> int',
        'let arr = Console.ReadLine().Split() |> Array.map int',
        'let largest = arr |> Array.max',
        '',
        'printfn "%d" largest',
      ].join('\n'),
      PHP: [
        '<?php',
        '$n = intval(trim(fgets(STDIN)));',
        '$arr = array_map("intval", explode(" ", trim(fgets(STDIN))));',
        '',
        '$largest = $arr[0];',
        'foreach ($arr as $value) {',
        '  if ($value > $largest) $largest = $value;',
        '}',
        '',
        'echo $largest . PHP_EOL;',
      ].join('\n'),
      RUBY: [
        'n = STDIN.gets.to_i',
        'arr = STDIN.gets.split.map(&:to_i)',
        '',
        'largest = arr[0]',
        'arr.each do |value|',
        '  largest = value if value > largest',
        'end',
        '',
        'puts largest',
      ].join('\n'),
      HASKELL: [
        'main :: IO ()',
        'main = do',
        '  _ <- getLine',
        '  nums <- fmap (map read . words) getLine',
        '  print (maximum (nums :: [Int]))',
      ].join('\n'),
      GO: [
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  var n int',
        '  fmt.Scan(&n)',
        '',
        '  var largest, value int',
        '  fmt.Scan(&largest)',
        '',
        '  for i := 1; i < n; i++ {',
        '    fmt.Scan(&value)',
        '    if value > largest {',
        '      largest = value',
        '    }',
        '  }',
        '',
        '  fmt.Println(largest)',
        '}',
      ].join('\n'),
      RUST: [
        'use std::io::{self, Read};',
        '',
        'fn main() {',
        '    let mut input = String::new();',
        '    io::stdin().read_to_string(&mut input).unwrap();',
        '    let mut nums = input.split_whitespace().map(|x| x.parse::<i32>().unwrap());',
        '',
        '    let n = nums.next().unwrap();',
        '    let mut largest = nums.next().unwrap();',
        '',
        '    for _ in 1..n {',
        '        let value = nums.next().unwrap();',
        '        if value > largest {',
        '            largest = value;',
        '        }',
        '    }',
        '',
        '    println!("{}", largest);',
        '}',
      ].join('\n'),
      TYPESCRIPT: [
        'const input = await Deno.readTextFile("/dev/stdin");',
        'const nums = input.trim().split(/\\s+/).map(Number);',
        '',
        'const n = nums[0];',
        'const arr = nums.slice(1, n + 1);',
        'const largest = Math.max(...arr);',
        '',
        'console.log(largest);',
      ].join('\n'),
    };

    return starters[language];
  }

  private showSubmitSuccessAndRedirect(): void {
    this.showSubmitSuccess = true;
    this.successRedirectSeconds = 3;
    this.showSubmitModal = false;

    clearTimeout(this.successRedirectTimer);
    clearInterval(this.successCountdownTimer);

    this.successCountdownTimer = setInterval(() => {
      this.successRedirectSeconds = Math.max(this.successRedirectSeconds - 1, 0);
    }, 1000);

    this.successRedirectTimer = setTimeout(() => {
      clearInterval(this.successCountdownTimer);
      this.closeCompiler();
    }, 3200);
  }
}
