import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question';
import { PublicPracticeService } from '../../features/services/public-practice.service';

type CompanyTab = 'OVERVIEW' | 'ASSESSMENTS' | 'CHALLENGES' | 'INTERVIEW';
type PracticeSort = 'POPULAR' | 'NEWEST' | 'MARKS' | 'DURATION' | 'QUESTIONS';
type CardView = 'GRID' | 'LIST';
type QuestionSort = 'DEFAULT' | 'EASY_FIRST' | 'HARD_FIRST' | 'TOPIC';

interface PracticeItem {
  id: number;
  type: 'ASSESSMENT' | 'CHALLENGE' | 'INTERVIEW';
  title: string;
  description: string;
  company: string;
  skill: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
}

interface InterviewQuestion {
  id: number;
  role: string;
  question: string;
  answer: string;
  type: string;
  topic: string;
  difficulty: string;
  show: boolean;
}

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.html',
  styleUrls: ['./company.css'],
})
export class Company implements OnInit {
  readonly tabs: { key: CompanyTab; label: string }[] = [
    { key: 'OVERVIEW', label: 'Overview' },
    { key: 'ASSESSMENTS', label: 'Mock Tests' },
    { key: 'CHALLENGES', label: 'Coding Labs' },
    { key: 'INTERVIEW', label: 'Interview Bank' },
  ];

  readonly fallbackInterviewRoles = [
    'JAVA',
    'PYTHON',
    'SQL',
    'APTITUDE',
    'HR',
    'Interview Preparation',
  ];

  readonly companyLogos: Record<string, string> = {
    TCS: 'logos/tcs.svg',
    Infosys: 'logos/infosys.svg',
    Wipro: 'logos/wipro.svg',
    Cognizant: 'logos/cognizant.svg',
    Deloitte: 'logos/deloitte.svg',
    Accenture: 'logos/accenture.svg',
    EY: 'logos/ey.svg',
    IBM: 'logos/ibm.svg',
    Amazon: 'logos/amazon.svg',
    Zoho: 'logos/zoho.svg',
    KPMG: 'logos/kpmg.svg',
    Meta: 'logos/meta.svg',
    Microsoft: 'logos/microsoft.svg',
    PwC: 'logos/pwc.svg',
    Salesforce: 'logos/salesforce.svg',
    'Tech Mahindra': 'logos/tech-mahindra.svg',
  };

  companyName = '';
  activeTab: CompanyTab = 'OVERVIEW';

  loadingPractice = false;
  loadingQuestions = false;
  practiceError = '';
  questionError = '';

  assessments: PracticeItem[] = [];
  challenges: PracticeItem[] = [];
  interviewPracticeItems: PracticeItem[] = [];
  questions: InterviewQuestion[] = [];

  practiceSearch = '';
  selectedSkill = '';
  selectedDuration = '';
  practiceSort: PracticeSort = 'POPULAR';
  cardView: CardView = 'GRID';

  questionSearch = '';
  selectedRole = '';
  selectedType = '';
  selectedDifficulty = '';
  selectedTopic = '';
  questionSort: QuestionSort = 'DEFAULT';
  readerMode = false;

  questionPage = 0;
  questionSize = 10;
  questionTotalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicPracticeService: PublicPracticeService,
    private questionService: QuestionService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.companyName = params.get('name') || '';
      this.resetCompanyState();
      this.loadPracticeItems();
      this.loadInterviewQuestions();
    });
  }

  get logo(): string {
    return this.companyLogos[this.companyName] || 'VidhuraTechIcon.png';
  }

  get totalPracticeItems(): number {
    return this.assessments.length + this.challenges.length + this.interviewPracticeItems.length;
  }

  get totalInterviewItems(): number {
    return this.questions.length || this.interviewPracticeItems.length;
  }

  get completionScore(): number {
    const score =
      this.assessments.length * 18 + this.challenges.length * 22 + this.totalInterviewItems * 4;
    return Math.min(score, 100);
  }

  get allSkills(): string[] {
    const values = [...this.assessments, ...this.challenges]
      .map((item) => item.skill)
      .filter(Boolean);
    return Array.from(new Set(values));
  }

  get recommendedAssessments(): PracticeItem[] {
    return this.sortPractice([...this.assessments]).slice(0, 3);
  }

  get recommendedChallenges(): PracticeItem[] {
    return this.sortPractice([...this.challenges]).slice(0, 3);
  }

  get hotPracticeItems(): PracticeItem[] {
    return this.sortPractice([...this.assessments, ...this.challenges]).slice(0, 4);
  }

  get availableInterviewRoles(): string[] {
    const roles = new Set<string>();

    this.interviewPracticeItems.forEach((item) => item.skill && roles.add(item.skill));
    this.questions.forEach((item) => item.role && roles.add(item.role));
    this.fallbackInterviewRoles.forEach((role) => roles.add(role));

    return Array.from(roles).filter(Boolean);
  }

  get availableTopics(): string[] {
    const topics = this.questions.map((item) => item.topic).filter(Boolean);
    return Array.from(new Set(topics));
  }

  get filteredAssessments(): PracticeItem[] {
    return this.filterPractice(this.assessments);
  }

  get filteredChallenges(): PracticeItem[] {
    return this.filterPractice(this.challenges);
  }

  get activePracticeItems(): PracticeItem[] {
    return this.activeTab === 'ASSESSMENTS' ? this.filteredAssessments : this.filteredChallenges;
  }

  get sortedQuestions(): InterviewQuestion[] {
    const list = [...this.questions];

    if (this.questionSort === 'EASY_FIRST') {
      return list.sort(
        (a, b) => this.difficultyRank(a.difficulty) - this.difficultyRank(b.difficulty),
      );
    }

    if (this.questionSort === 'HARD_FIRST') {
      return list.sort(
        (a, b) => this.difficultyRank(b.difficulty) - this.difficultyRank(a.difficulty),
      );
    }

    if (this.questionSort === 'TOPIC') {
      return list.sort((a, b) => a.topic.localeCompare(b.topic));
    }

    return list;
  }

  get pageLabel(): string {
    return this.questionTotalPages
      ? `Page ${this.questionPage + 1} of ${this.questionTotalPages}`
      : 'Page 1';
  }

  setTab(tab: CompanyTab): void {
    this.activeTab = tab;
  }

  backToPreparation(): void {
    this.router.navigate(['/preparation']);
  }

  loadPracticeItems(): void {
    this.loadingPractice = true;
    this.practiceError = '';

    this.publicPracticeService.getLibraryByCompany(this.companyName).subscribe({
      next: (response: any) => {
        const data = response?.data || {};

        this.assessments = (data.assessments || []).map((item: any) => ({
          ...item,
          type: 'ASSESSMENT',
        }));
        this.challenges = (data.challenges || []).map((item: any) => ({
          ...item,
          type: 'CHALLENGE',
        }));
        this.interviewPracticeItems = (data.interviewQuestions || []).map((item: any) => ({
          ...item,
          type: 'INTERVIEW',
        }));

        this.loadingPractice = false;
      },
      error: () => {
        this.assessments = [];
        this.challenges = [];
        this.interviewPracticeItems = [];
        this.practiceError = 'Unable to load available practice items.';
        this.loadingPractice = false;
      },
    });
  }

  startAssessment(item: PracticeItem): void {
    this.router.navigate(['/free-mock-tests', 'assessment', item.id], {
      queryParams: { company: this.companyName },
    });
  }

  startChallenge(item: PracticeItem): void {
    this.router.navigate(['/free-mock-tests', 'challenge', item.id], {
      queryParams: { company: this.companyName },
    });
  }

  openPractice(item: PracticeItem): void {
    item.type === 'ASSESSMENT' ? this.startAssessment(item) : this.startChallenge(item);
  }

  loadInterviewQuestions(): void {
    this.loadingQuestions = true;
    this.questionError = '';

    this.questionService
      .getQuestions(
        this.companyName,
        this.selectedRole,
        this.questionSearch,
        this.questionPage,
        this.selectedType,
        this.selectedDifficulty,
        this.selectedTopic,
      )
      .subscribe({
        next: (response: any) => {
          this.questions = (response?.content || []).map((question: any) => ({
            id: question.id,
            role: question.role || question.skill || '',
            question: question.question || '',
            answer: question.answer || '',
            type: question.type || 'GENERAL',
            topic: question.topic || 'General',
            difficulty: question.difficulty || 'MEDIUM',
            show: false,
          }));

          this.questionTotalPages = response?.totalPages || 0;
          this.selectedQuestion = this.questions[0] || null;
          this.loadingQuestions = false;
        },
        error: () => {
          this.questions = [];
          this.questionTotalPages = 0;
          this.questionError = 'Unable to load interview questions.';
          this.loadingQuestions = false;
        },
      });
  }

  applyQuestionFilters(): void {
    this.questionPage = 0;
    this.loadInterviewQuestions();
  }

  clearQuestionFilters(): void {
    this.selectedQuestion = null;
    this.questionSearch = '';
    this.selectedRole = '';
    this.selectedType = '';
    this.selectedDifficulty = '';
    this.selectedTopic = '';
    this.questionSort = 'DEFAULT';
    this.questionPage = 0;
    this.loadInterviewQuestions();
  }

  clearPracticeFilters(): void {
    this.practiceSearch = '';
    this.selectedSkill = '';
    this.selectedDuration = '';
    this.practiceSort = 'POPULAR';
  }

  changeRole(role: string): void {
    if (this.selectedRole === role) return;

    this.selectedRole = role;
    this.questionPage = 0;
    this.loadInterviewQuestions();
  }

  toggleAnswer(question: InterviewQuestion): void {
    question.show = !question.show;
  }

  previousQuestionPage(): void {
    if (this.questionPage === 0) return;

    this.questionPage--;
    this.loadInterviewQuestions();
  }

  nextQuestionPage(): void {
    if (this.questionPage >= this.questionTotalPages - 1) return;

    this.questionPage++;
    this.loadInterviewQuestions();
  }

  getSection(answer: string, start: string, end: string): string {
    if (!answer) return 'Content not available.';

    const startIndex = answer.indexOf(start);

    if (startIndex === -1) {
      return start === 'Definition:' ? answer : 'Content not available.';
    }

    const remaining = answer.substring(startIndex + start.length);
    const endIndex = end ? remaining.indexOf(end) : -1;

    return endIndex === -1 ? remaining.trim() : remaining.substring(0, endIndex).trim();
  }

  isHotItem(item: PracticeItem): boolean {
    return this.hotPracticeItems.some((hot) => hot.id === item.id && hot.type === item.type);
  }

  trackByPractice(_: number, item: PracticeItem): string {
    return `${item.type}-${item.id}`;
  }

  trackByQuestion(_: number, item: InterviewQuestion): number {
    return item.id;
  }

  private filterPractice(items: PracticeItem[]): PracticeItem[] {
    const search = this.practiceSearch.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.skill?.toLowerCase().includes(search);

      const matchesSkill = !this.selectedSkill || item.skill === this.selectedSkill;

      const matchesDuration =
        !this.selectedDuration ||
        (this.selectedDuration === 'SHORT' && item.durationMinutes <= 30) ||
        (this.selectedDuration === 'MEDIUM' &&
          item.durationMinutes > 30 &&
          item.durationMinutes <= 60) ||
        (this.selectedDuration === 'LONG' && item.durationMinutes > 60);

      return matchesSearch && matchesSkill && matchesDuration;
    });

    return this.sortPractice(filtered);
  }

  private sortPractice(items: PracticeItem[]): PracticeItem[] {
    return items.sort((a, b) => {
      if (this.practiceSort === 'MARKS') return b.totalMarks - a.totalMarks;
      if (this.practiceSort === 'DURATION') return a.durationMinutes - b.durationMinutes;
      if (this.practiceSort === 'QUESTIONS') return b.questionCount - a.questionCount;
      if (this.practiceSort === 'NEWEST') return b.id - a.id;

      const aScore = a.totalMarks + a.questionCount * 3 + a.durationMinutes;
      const bScore = b.totalMarks + b.questionCount * 3 + b.durationMinutes;
      return bScore - aScore;
    });
  }

  private difficultyRank(value: string): number {
    if (value === 'EASY') return 1;
    if (value === 'MEDIUM') return 2;
    if (value === 'HARD') return 3;
    return 2;
  }

  private resetCompanyState(): void {
    this.activeTab = 'OVERVIEW';
    this.interviewPracticeItems = [];
    this.assessments = [];
    this.challenges = [];
    this.questions = [];
    this.practiceError = '';
    this.questionError = '';
    this.questionPage = 0;
    this.clearPracticeFilters();
  }

  selectedQuestion: InterviewQuestion | null = null;

  get selectedQuestionIndex(): number {
    if (!this.selectedQuestion) return -1;
    return this.sortedQuestions.findIndex((item) => item.id === this.selectedQuestion?.id);
  }

  get difficultySummary(): { easy: number; medium: number; hard: number } {
    return this.questions.reduce(
      (count, item) => {
        if (item.difficulty === 'EASY') count.easy++;
        else if (item.difficulty === 'HARD') count.hard++;
        else count.medium++;
        return count;
      },
      { easy: 0, medium: 0, hard: 0 },
    );
  }

  selectQuestion(question: InterviewQuestion): void {
    this.selectedQuestion = question;
  }

  closeQuestionReader(): void {
    this.selectedQuestion = null;
  }
}
