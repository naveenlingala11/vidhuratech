import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../service/student-dashboard';
import { environment } from '../../../../environments/environment';

type ContentType = 'ALL' | 'PRACTICE' | 'MATERIAL' | 'NOTE';
type SortMode = 'NEWEST' | 'OLDEST' | 'TITLE';
type ViewMode = 'GRID' | 'LIST';

@Component({
  selector: 'app-student-learning-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-learning-content.html',
  styleUrls: ['./student-learning-content.css'],
})
export class StudentLearningContentComponent implements OnInit {
  loading = true;
  toast = '';
  searchText = '';
  selectedType: ContentType = 'ALL';
  sortMode: SortMode = 'NEWEST';
  viewMode: ViewMode = 'GRID';

  contentItems: any[] = [];
  previewItem: any = null;

  private trainerApi = `${environment.apiUrl}/api/trainer`;

  constructor(
    private service: StudentDashboardService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');

    if (type === 'PRACTICE' || type === 'MATERIAL' || type === 'NOTE') {
      this.selectedType = type;
    }

    this.loadContent();
  }

  loadContent(): void {
    this.loading = true;

    this.service.getLearningContent().subscribe({
      next: (res: any) => {
        this.contentItems = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.contentItems = [];
        this.loading = false;
        this.showToast('Unable to load learning content');
      },
    });
  }

  get filteredContent(): any[] {
    const term = this.searchText.trim().toLowerCase();

    const filtered = this.contentItems.filter((item) => {
      const typeMatch = this.selectedType === 'ALL' || item.type === this.selectedType;
      const searchable = [item.title, item.description, item.type, item.batchId, item.fileName]
        .join(' ')
        .toLowerCase();

      return typeMatch && (!term || searchable.includes(term));
    });

    return [...filtered].sort((a, b) => {
      if (this.sortMode === 'TITLE') {
        return String(a.title || '').localeCompare(String(b.title || ''));
      }

      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();

      return this.sortMode === 'NEWEST' ? bTime - aTime : aTime - bTime;
    });
  }

  get featuredItem(): any {
    return this.filteredContent[0] || null;
  }

  get practiceCount(): number {
    return this.contentItems.filter((item) => item.type === 'PRACTICE').length;
  }

  get materialCount(): number {
    return this.contentItems.filter((item) => item.type === 'MATERIAL').length;
  }

  get noteCount(): number {
    return this.contentItems.filter((item) => item.type === 'NOTE').length;
  }

  selectType(type: ContentType): void {
    this.selectedType = type;
  }

  openPreview(item: any): void {
    this.previewItem = item;
  }

  closePreview(): void {
    this.previewItem = null;
  }

  fileUrl(item: any): string {
    return `${this.trainerApi}/content/${item.id}/file`;
  }

  getTypeLabel(type: string): string {
    if (type === 'PRACTICE') return 'Practice';
    if (type === 'MATERIAL') return 'Material';
    if (type === 'NOTE') return 'Note';
    return 'Content';
  }

  getTypeIcon(type: string): string {
    if (type === 'PRACTICE') return 'bi-lightning-charge-fill';
    if (type === 'MATERIAL') return 'bi-folder2-open';
    if (type === 'NOTE') return 'bi-journal-text';
    return 'bi-file-earmark-text';
  }

  formatDate(value: string): string {
    if (!value) return 'Recently shared';

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2400);
  }

  trackById(_: number, item: any): any {
    return item.id || item.title;
  }
}
