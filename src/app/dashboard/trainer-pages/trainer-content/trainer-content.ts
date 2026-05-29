import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerDashboardService } from '../../service/trainer-dashboard';
import { environment } from '../../../../environments/environment';

type ContentType = 'ALL' | 'PRACTICE' | 'MATERIAL' | 'NOTE';
type UploadContentType = 'PRACTICE' | 'MATERIAL' | 'NOTE';
type ContentMode = 'file' | 'json' | 'link';

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
  batches: any[] = [];
  searchText = '';
  selectedType: ContentType = 'ALL';

  contentItems: any[] = [];
  curriculum: any[] = [];
  rawCurriculum: any = null;

  contentMode: ContentMode = 'file';
  selectedContentFile?: File;
  contentJsonText = '';
  contentLinks: string[] = [''];

  dragActive = false;
  copiedLink = '';

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

  formErrors = {
    batchId: '',
    title: '',
    file: '',
    json: '',
    links: '',
  };

  apiBase = `${environment.apiUrl}/api/trainer`;

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadBatches();
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

  loadBatches(): void {
    this.service.getBatches().subscribe({
      next: (res: any) => {
        this.batches = res?.data || [];
      },
      error: () => {
        this.batches = [];
        this.showToast('Unable to load assigned batches');
      },
    });
  }

  setContentMode(mode: ContentMode): void {
    this.contentMode = mode;

    if (mode !== 'file') {
      this.selectedContentFile = undefined;
    }

    if (mode !== 'json') {
      this.contentJsonText = '';
    }

    if (mode !== 'link') {
      this.contentLinks = [''];
    }
  }

  onContentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedContentFile = input.files?.[0];
  }

  addLink(): void {
    this.contentLinks.push('');
  }

  removeLink(index: number): void {
    this.contentLinks.splice(index, 1);

    if (!this.contentLinks.length) {
      this.contentLinks = [''];
    }
  }

  get cleanLinks(): string[] {
    return this.contentLinks.map((link) => link.trim()).filter(Boolean);
  }

  isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  clearFormErrors(): void {
    this.formErrors = {
      batchId: '',
      title: '',
      file: '',
      json: '',
      links: '',
    };
  }

  validateContentForm(): boolean {
    this.clearFormErrors();

    if (!this.contentForm.batchId) {
      this.formErrors.batchId = 'Batch ID is required';
    }

    if (!this.contentForm.title.trim()) {
      this.formErrors.title = 'Title is required';
    }

    if (this.contentMode === 'file' && !this.selectedContentFile) {
      this.formErrors.file = 'Choose a file or switch to JSON/Links';
    }

    if (this.contentMode === 'json') {
      if (!this.contentJsonText.trim()) {
        this.formErrors.json = 'Paste JSON content';
      } else {
        try {
          JSON.parse(this.contentJsonText);
        } catch {
          this.formErrors.json = 'Invalid JSON format';
        }
      }
    }

    if (this.contentMode === 'link') {
      const links = this.cleanLinks;

      if (!links.length) {
        this.formErrors.links = 'Add at least one link';
      } else if (links.some((link) => !this.isValidUrl(link))) {
        this.formErrors.links = 'Use valid http or https links only';
      }
    }

    const hasError = Object.values(this.formErrors).some(Boolean);

    if (hasError) {
      this.showToast('Please fix highlighted fields');
      return false;
    }

    return true;
  }

  uploadContent(): void {
    if (!this.validateContentForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('batchId', this.contentForm.batchId);
    formData.append('type', this.contentForm.type);
    formData.append('title', this.contentForm.title.trim());
    formData.append('description', this.contentForm.description || '');

    if (this.contentMode === 'file') {
      if (!this.selectedContentFile) {
        this.showToast('Choose a file to upload');
        return;
      }

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

    if (this.contentMode === 'link') {
      const links = this.cleanLinks;

      if (!links.length) {
        this.showToast('Add at least one link');
        return;
      }

      if (links.some((link) => !this.isValidUrl(link))) {
        this.showToast('Use valid http or https links');
        return;
      }

      formData.append('links', JSON.stringify(links));
    }

    this.uploading = true;

    this.service.uploadContent(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.showToast('Content uploaded successfully');
        this.clearFormErrors();
        this.resetContentForm();
        this.loadContent();
      },
      error: (err) => {
        this.uploading = false;
        console.error('Content upload failed:', err);

        const message = err?.error?.message || err?.error || 'Unable to upload content';

        if (String(message).toLowerCase().includes('access denied')) {
          this.formErrors.batchId = 'Select a batch assigned to your trainer account';
          this.showToast('This batch is not assigned to you');
          return;
        }

        this.showToast(message);
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
    this.contentLinks = [''];
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
        item.links,
        item.url,
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

  get totalLinksCount(): number {
    return this.contentItems.reduce((count, item) => count + this.getItemLinks(item).length, 0);
  }

  getItemLinks(item: any): string[] {
    if (Array.isArray(item.links)) return item.links;
    if (typeof item.links === 'string') {
      try {
        const parsed = JSON.parse(item.links);
        return Array.isArray(parsed) ? parsed : [item.links];
      } catch {
        return item.links ? [item.links] : [];
      }
    }

    if (item.url) return [item.url];
    if (item.link) return [item.link];

    return [];
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

  trackByIndex(index: number): number {
    return index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedContentFile = file;
      this.contentMode = 'file';
    }
  }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link).then(() => {
      this.copiedLink = link;
      this.showToast('Link copied');
      setTimeout(() => (this.copiedLink = ''), 1600);
    });
  }

  getInitials(title: string): string {
    return (title || 'CT')
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  getContentAccent(type: string): string {
    if (type === 'PRACTICE') return 'Practice Sprint';
    if (type === 'MATERIAL') return 'Learning Asset';
    if (type === 'NOTE') return 'Trainer Note';
    return 'Resource';
  }
}
