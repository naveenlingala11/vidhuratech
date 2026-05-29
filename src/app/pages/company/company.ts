import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question';
import { PublicPracticeService } from '../../features/services/public-practice.service';

type CompanyTab = 'OVERVIEW' | 'ASSESSMENTS' | 'CHALLENGES' | 'INTERVIEW';

interface PracticeItem {
  id: number;
  type: 'ASSESSMENT' | 'CHALLENGE';
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
    { key: 'CHALLENGES', label: 'Coding Challenges' },
    { key: 'INTERVIEW', label: 'Interview Questions' },
  ];

  readonly interviewRoles = ['JAVA', 'PYTHON'];

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
  questions: InterviewQuestion[] = [];

  questionSearch = '';
  selectedRole = 'JAVA';
  selectedType = '';
  selectedDifficulty = '';
  selectedTopic = '';

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
    return this.assessments.length + this.challenges.length;
  }

  get recommendedAssessments(): PracticeItem[] {
    return this.assessments.slice(0, 2);
  }

  get recommendedChallenges(): PracticeItem[] {
    return this.challenges.slice(0, 2);
  }

  get hasRecommendations(): boolean {
    return this.recommendedAssessments.length > 0 || this.recommendedChallenges.length > 0;
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

        this.loadingPractice = false;
      },
      error: () => {
        this.assessments = [];
        this.challenges = [];
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

  openRecommended(item: PracticeItem): void {
    if (item.type === 'ASSESSMENT') {
      this.startAssessment(item);
      return;
    }

    this.startChallenge(item);
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
            question: question.question || '',
            answer: question.answer || '',
            type: question.type || 'GENERAL',
            topic: question.topic || 'General',
            difficulty: question.difficulty || 'MEDIUM',
            show: false,
          }));

          this.questionTotalPages = response?.totalPages || 0;
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
    this.questionSearch = '';
    this.selectedType = '';
    this.selectedDifficulty = '';
    this.selectedTopic = '';
    this.questionPage = 0;
    this.loadInterviewQuestions();
  }

  changeRole(role: string): void {
    if (this.selectedRole === role) {
      return;
    }

    this.selectedRole = role;
    this.questionPage = 0;
    this.loadInterviewQuestions();
  }

  toggleAnswer(question: InterviewQuestion): void {
    question.show = !question.show;
  }

  previousQuestionPage(): void {
    if (this.questionPage === 0) {
      return;
    }

    this.questionPage--;
    this.loadInterviewQuestions();
  }

  nextQuestionPage(): void {
    if (this.questionPage >= this.questionTotalPages - 1) {
      return;
    }

    this.questionPage++;
    this.loadInterviewQuestions();
  }

  getSection(answer: string, start: string, end: string): string {
    if (!answer) {
      return 'Content not available.';
    }

    const startIndex = answer.indexOf(start);

    if (startIndex === -1) {
      return start === 'Definition:' ? answer : 'Content not available.';
    }

    const remaining = answer.substring(startIndex + start.length);
    const endIndex = end ? remaining.indexOf(end) : -1;

    return endIndex === -1 ? remaining.trim() : remaining.substring(0, endIndex).trim();
  }

  private resetCompanyState(): void {
    this.activeTab = 'OVERVIEW';
    this.assessments = [];
    this.challenges = [];
    this.questions = [];
    this.practiceError = '';
    this.questionError = '';
    this.questionPage = 0;
  }
}
