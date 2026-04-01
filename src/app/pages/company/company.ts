import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.html',
  styleUrls: ['./company.css']
})
export class Company implements OnInit {

  companyName = '';
  activeTab = 'JAVA';

  questions: any[] = [];

  search = '';
  page = 0;
  size = 10;
  totalPages = 0;

  loading = false;

  selectedType = '';
  selectedDifficulty = '';
  selectedTopic = '';

  constructor(
    private route: ActivatedRoute,
    private service: QuestionService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit() {
    this.companyName = this.route.snapshot.params['name'];
    this.loadQuestions();
  }

  ngAfterViewInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;

    this.service.getQuestions(
      this.companyName,
      this.activeTab,
      this.search,
      this.page,
      this.selectedType,
      this.selectedDifficulty,
      this.selectedTopic
    ).subscribe({
      next: (res: any) => {

        // ✅ SAFE MAPPING
        this.questions = (res.content || []).map((q: any) => ({
          ...q,
          show: false,
          type: q.type || 'GENERAL',
          topic: q.topic || 'General',
          difficulty: q.difficulty || 'MEDIUM'
        }));

        this.totalPages = res.totalPages || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changeTab(tab: string) {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.page = 0;
    this.loadQuestions();
  }

  searchQuestions() {
    this.page = 0;
    this.loadQuestions();
  }

  applyFilters() {
    this.page = 0;
    this.loadQuestions();
  }

  toggleAnswer(q: any) {
    q.show = !q.show;
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadQuestions();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadQuestions();
    }
  }

  // ✅ SAFE SPLITTER (IMPORTANT FIX)
  getSection(text: string, start: string, end: string) {
    if (!text) return '';

    const startIndex = text.indexOf(start);
    if (startIndex === -1) return '';

    const endIndex = end ? text.indexOf(end) : -1;

    if (endIndex === -1) {
      return text.substring(startIndex + start.length).trim();
    }

    return text.substring(startIndex + start.length, endIndex).trim();
  }
}