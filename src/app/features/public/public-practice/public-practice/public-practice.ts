import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicPracticeService } from '../../../services/public-practice.service';

type PracticeType = 'ASSESSMENT' | 'CHALLENGE';
type OptionKey = 'A' | 'B' | 'C' | 'D';

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

  redirectMessage = '';
  redirectSeconds = 0;
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
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.restoreLead();

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
    return this.leadSaved && !!this.lead.phone.trim();
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

  openLeadModal(item: any): void {
    const type = String(item?.type || '')
      .toUpperCase()
      .includes('CHALLENGE')
      ? 'CHALLENGE'
      : 'ASSESSMENT';

    this.pendingItem = { ...item, type };

    this.lead.interest =
      type === 'ASSESSMENT'
        ? `${item.company || ''} ${item.title || ''} Mock Test`.trim()
        : `${item.company || ''} ${item.title || ''} Coding Challenge`.trim();

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
  }

  continueAfterLead(): void {
    if (!this.validateLeadForm()) {
      return;
    }

    if (!this.lead.name.trim()) {
      this.showToast('Please enter your name');
      return;
    }

    if (!this.lead.phone.trim()) {
      this.showToast('Please enter your phone number');
      return;
    }

    const item = this.pendingItem;

    this.submitting = true;

    this.publicPracticeService
      .saveLead({
        lead: {
          ...this.lead,
          interest: item
            ? item.type === 'ASSESSMENT'
              ? `${item.company} ${item.title} Mock Test`
              : `${item.company} ${item.title} Coding Challenge`
            : this.lead.interest,
        },
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.leadSaved = true;
          this.persistLead();
          this.showLeadModal = false;

          if (!item) return;

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
            err?.error?.message || err?.error?.error || err?.message || 'Unable to save details';

          if (err?.status === 409 || message.toLowerCase().includes('already a member')) {
            this.startLoginRedirectCountdown(message);
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

    this.publicPracticeService.getAssessment(id).subscribe({
      next: (res: any) => {
        this.assessment = res?.data;
        this.answers = (this.assessment?.questions || []).map((q: any) => ({
          questionId: q.id,
          selectedAnswer: '',
        }));
        this.currentQuestionIndex = 0;
        this.assessmentResult = null;
        this.loading = false;

        if (!this.canUseWorkspace) {
          this.pendingItem = null;
          this.lead.interest = `${this.assessment?.company || ''} ${this.assessment?.title || ''} Mock Test`;
          this.showLeadModal = true;
        }
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
    if (!this.canUseWorkspace) {
      this.showLeadModal = true;
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .submitAssessment(this.assessmentId, {
        lead: this.lead,
        answers: this.answers,
      })
      .subscribe({
        next: (res: any) => {
          this.assessmentResult = res?.data;
          this.submitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.showToast('Mock test submitted successfully');
        },
        error: (err) => {
          this.submitting = false;
          this.showToast(err?.error?.message || 'Submission failed');
        },
      });
  }

  loadChallenge(id: number): void {
    this.mode = 'CHALLENGE';
    this.challengeId = id;
    this.loading = true;

    this.publicPracticeService.getChallenge(id).subscribe({
      next: (res: any) => {
        this.challenge = res?.data;
        this.sourceCode = this.getStarterCode(this.language);
        this.lastStarterCode = this.sourceCode;
        this.challengeResult = null;
        this.loading = false;

        if (!this.canUseWorkspace) {
          this.pendingItem = null;
          this.lead.interest = `${this.challenge?.company || ''} ${this.challenge?.title || ''} Coding Challenge`;
          this.showLeadModal = true;
        }
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
    if (!this.canUseWorkspace) {
      this.showLeadModal = true;
      return;
    }

    if (!this.sourceCode.trim()) {
      this.showToast('Please write your code before running');
      return;
    }

    this.submitting = true;

    this.publicPracticeService
      .runChallenge(this.challengeId, {
        lead: this.lead,
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
          this.showToast(err?.error?.message || 'Challenge run failed');
        },
      });
  }

  startLoginRedirectCountdown(message: string): void {
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
            redirect: '/free-mock-tests',
            phone: this.lead.phone,
          },
        });

        return;
      }

      this.redirectMessage = `${message} Redirecting to login in ${this.redirectSeconds} seconds...`;
    }, 1000);
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
      this.leadSaved = !!this.lead.name && !!this.lead.phone;
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
