import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerDashboardService } from '../../service/trainer-dashboard';
import { environment } from '../../../../environments/environment';

type ContentType = 'ALL' | 'PRACTICE' | 'MATERIAL' | 'NOTE';
type UploadContentType = 'PRACTICE' | 'MATERIAL' | 'NOTE';
type ContentMode = 'file' | 'json';

@Component({
  selector: 'app-trainer-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-content.html',
  styleUrls: ['./trainer-content.css'],
})
export class TrainerContentComponent implements OnInit {
  loading = false;
  curriculumLoading = false;
  uploading = false;
  toast = '';

  batchId = '';
  searchText = '';
  selectedType: ContentType = 'ALL';

  contentItems: any[] = [];
  curriculum: any[] = [];
  rawCurriculum: any = null;

  contentMode: ContentMode = 'file';
  selectedContentFile?: File;
  contentJsonText = '';

  contentForm: {
    batchId: string;
    type: UploadContentType;
    title: string;
    description: string;
  } = {
    batchId: '',
    type: 'PRACTICE',
    title: '',
    description: '',
  };

  apiBase = `${environment.apiUrl}/api/trainer`;

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading = true;

    this.service.getContent().subscribe({
      next: (res: any) => {
        this.contentItems = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.contentItems = [];
        this.loading = false;
        this.showToast('Unable to load trainer content');
      },
    });
  }

  setContentMode(mode: ContentMode): void {
    this.contentMode = mode;

    if (mode === 'file') {
      this.contentJsonText = '';
    }

    if (mode === 'json') {
      this.selectedContentFile = undefined;
    }
  }

  onContentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedContentFile = input.files?.[0];
  }

  uploadContent(): void {
    if (!this.contentForm.batchId || !this.contentForm.type || !this.contentForm.title.trim()) {
      this.showToast('Select batch, type, and title');
      return;
    }

    const formData = new FormData();
    formData.append('batchId', this.contentForm.batchId);
    formData.append('type', this.contentForm.type);
    formData.append('title', this.contentForm.title.trim());
    formData.append('description', this.contentForm.description || '');

    if (this.contentMode === 'file' && this.selectedContentFile) {
      formData.append('file', this.selectedContentFile);
    }

    if (this.contentMode === 'json') {
      if (!this.contentJsonText.trim()) {
        this.showToast('Paste JSON content');
        return;
      }

      try {
        const parsed = JSON.parse(this.contentJsonText);
        formData.append('jsonData', JSON.stringify(parsed));
      } catch {
        this.showToast('Invalid JSON format');
        return;
      }
    }

    this.uploading = true;

    this.service.uploadContent(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.showToast('Content uploaded successfully');
        this.resetContentForm();
        this.loadContent();
      },
      error: () => {
        this.uploading = false;
        this.showToast('Unable to upload content');
      },
    });
  }

  resetContentForm(): void {
    this.contentForm = {
      batchId: '',
      type: 'PRACTICE',
      title: '',
      description: '',
    };

    this.contentMode = 'file';
    this.contentJsonText = '';
    this.selectedContentFile = undefined;
  }

  loadCurriculum(): void {
    if (!this.batchId) {
      this.showToast('Enter batch ID');
      return;
    }

    this.curriculumLoading = true;
    this.curriculum = [];
    this.rawCurriculum = null;

    this.service.getCurriculum(Number(this.batchId)).subscribe({
      next: (res: any) => {
        const data = res?.data || null;

        if (!data) {
          this.curriculumLoading = false;
          this.showToast('No curriculum found for this batch');
          return;
        }

        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          this.rawCurriculum = parsed;
          this.curriculum = parsed?.curriculum || parsed?.modules || [];
        } catch {
          this.rawCurriculum = data;
          this.curriculum = [];
          this.showToast('Curriculum loaded, but JSON format is not standard');
        }

        this.curriculumLoading = false;
      },
      error: () => {
        this.curriculumLoading = false;
        this.showToast('Unable to load curriculum');
      },
    });
  }

  get filteredContent(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.contentItems.filter((item) => {
      const matchesType = this.selectedType === 'ALL' || item.type === this.selectedType;

      const searchable = [
        item.title,
        item.description,
        item.type,
        item.batchId,
        item.fileName,
        item.jsonData ? 'json' : '',
      ]
        .join(' ')
        .toLowerCase();

      return matchesType && (!term || searchable.includes(term));
    });
  }

  get practiceCount(): number {
    return this.contentItems.filter((item) => item.type === 'PRACTICE').length;
  }

  get materialCount(): number {
    return this.contentItems.filter((item) => item.type === 'MATERIAL').length;
  }

  get notesCount(): number {
    return this.contentItems.filter((item) => item.type === 'NOTE').length;
  }

  getTypeLabel(type: string): string {
    if (type === 'PRACTICE') return 'Practice';
    if (type === 'MATERIAL') return 'Material';
    if (type === 'NOTE') return 'Note';
    return type || 'Content';
  }

  getTypeIcon(type: string): string {
    if (type === 'PRACTICE') return 'bi-lightning-charge-fill';
    if (type === 'MATERIAL') return 'bi-folder2-open';
    if (type === 'NOTE') return 'bi-journal-text';
    return 'bi-file-earmark-text';
  }

  fileUrl(item: any): string {
    return `${this.apiBase}/content/${item.id}/file`;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }

  trackById(_: number, item: any): any {
    return item.id || item.title;
  }
}
