import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-students.html',
  styleUrls: ['./trainer-students.css'],
})
export class TrainerStudentsComponent implements OnInit {
  students: any[] = [];
  mockRequests: any[] = [];
  submissions: any[] = [];
  activeTab: 'students' | 'mocks' | 'results' = 'students';
  search = '';
  toast = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  loading = true;

  /* ── Student features ── */
  studentSortMode: 'NAME' | 'BATCH' | 'COURSE' | 'RECENT' = 'NAME';
  studentSortOptions: ('NAME' | 'BATCH' | 'COURSE' | 'RECENT')[] = ['NAME', 'BATCH', 'COURSE', 'RECENT'];
  viewMode: 'GRID' | 'LIST' = 'GRID';
  studentPage = 1;
  studentPageSize = 8;
  selectedStudentIds = new Set<number>();
  expandedStudentId: number | null = null;

  /* ── Mock features ── */
  mockFilter: 'ALL' | 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'REJECTED' = 'ALL';
  mockFilters: ('ALL' | 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'REJECTED')[] = [
    'ALL', 'REQUESTED', 'SCHEDULED', 'COMPLETED', 'REJECTED',
  ];

  /* ── Results features ── */
  resultSort: 'RECENT' | 'MARKS_HIGH' | 'MARKS_LOW' | 'NAME' = 'RECENT';
  resultSortOptions: ('RECENT' | 'MARKS_HIGH' | 'MARKS_LOW' | 'NAME')[] = ['RECENT', 'MARKS_HIGH', 'MARKS_LOW', 'NAME'];

  reviewDraft: Record<number, { marks: number; feedback: string }> = {};

  constructor(
    private service: TrainerDashboardService,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.setSeo();
    this.load();
  }

  setSeo(): void {
    this.title.setTitle('Students & Mocks | Trainer Dashboard | Vidhura Tech');
    this.meta.updateTag({
      name: 'description',
      content: 'Comprehensive trainer dashboard for managing students, mock interview requests, and submission results with real-time analytics.',
    });
    this.meta.updateTag({
      name: 'keywords',
      content: 'trainer students, student management, mock interviews, assessment results, Vidhura Tech trainer dashboard',
    });
  }

  load(): void {
    this.loading = true;
    let done = 0;
    const check = () => { done++; if (done >= 3) this.loading = false; };

    this.service.getStudents().subscribe({
      next: (res: any) => { this.students = res?.data || []; check(); },
      error: () => { this.students = []; check(); },
    });

    this.service.getMockInterviewRequests().subscribe({
      next: (res: any) => { this.mockRequests = res?.data || []; check(); },
      error: () => { this.mockRequests = []; check(); },
    });

    this.service.getSubmissions().subscribe({
      next: (res: any) => {
        this.submissions = res?.data || [];
        this.submissions.forEach((item) => {
          this.reviewDraft[item.id] = {
            marks: item.marks || 0,
            feedback: item.feedback || '',
          };
        });
        check();
      },
      error: () => { this.submissions = []; check(); },
    });
  }

  /* ═══════════ STATS ═══════════ */
  get totalStudents(): number { return this.students.length; }
  get activeStudents(): number { return this.students.filter(s => (s.status || 'ACTIVE') === 'ACTIVE').length; }
  get totalBatches(): number { return new Set(this.students.map(s => s.batch).filter(Boolean)).size; }
  get totalCourses(): number { return new Set(this.students.map(s => s.course).filter(Boolean)).size; }
  get pendingMocks(): number { return this.mockRequests.filter(m => m.status === 'REQUESTED').length; }
  get reviewedCount(): number { return this.submissions.filter(s => s.marks > 0).length; }

  /* ═══════════ STUDENTS ═══════════ */
  get filteredStudents(): any[] {
    const q = this.search.toLowerCase().trim();
    let list = this.students;
    if (q) {
      list = list.filter((s) =>
        [s.name, s.email, s.phone, s.batch, s.course, s.status].some((v) =>
          String(v || '').toLowerCase().includes(q),
        ),
      );
    }
    return this.sortStudents(list);
  }

  sortStudents(list: any[]): any[] {
    const copy = [...list];
    switch (this.studentSortMode) {
      case 'NAME': return copy.sort((a, b) => String(a.name || '').localeCompare(b.name || ''));
      case 'BATCH': return copy.sort((a, b) => String(a.batch || '').localeCompare(b.batch || ''));
      case 'COURSE': return copy.sort((a, b) => String(a.course || '').localeCompare(b.course || ''));
      case 'RECENT': return copy.reverse();
      default: return copy;
    }
  }

  get studentTotalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.studentPageSize) || 1;
  }
  get pagedStudents(): any[] {
    const start = (this.studentPage - 1) * this.studentPageSize;
    return this.filteredStudents.slice(start, start + this.studentPageSize);
  }
  get studentStartRecord(): number {
    return this.filteredStudents.length ? (this.studentPage - 1) * this.studentPageSize + 1 : 0;
  }
  get studentEndRecord(): number {
    return Math.min(this.studentPage * this.studentPageSize, this.filteredStudents.length);
  }
  get studentPageNumbers(): number[] {
    const total = this.studentTotalPages;
    const current = this.studentPage;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  changeStudentPage(p: number): void {
    if (p >= 1 && p <= this.studentTotalPages) this.studentPage = p;
  }
  changeStudentPageSize(size: number): void {
    this.studentPageSize = +size;
    this.studentPage = 1;
  }

  toggleStudentSelect(id: number): void {
    this.selectedStudentIds.has(id) ? this.selectedStudentIds.delete(id) : this.selectedStudentIds.add(id);
  }
  isStudentSelected(id: number): boolean { return this.selectedStudentIds.has(id); }
  get selectedStudentCount(): number { return this.selectedStudentIds.size; }
  selectVisibleStudents(): void {
    this.pagedStudents.forEach(s => this.selectedStudentIds.add(s.id));
  }
  clearStudentSelection(): void { this.selectedStudentIds.clear(); }

  toggleStudentDetail(id: number): void {
    this.expandedStudentId = this.expandedStudentId === id ? null : id;
  }
  isStudentExpanded(id: number): boolean { return this.expandedStudentId === id; }

  exportStudents(): void {
    const selected = this.students.filter(s => this.selectedStudentIds.has(s.id));
    const rows = selected.length ? selected : this.filteredStudents;
    if (!rows.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Batch', 'Course', 'Status'];
    const csv = [headers.join(','), ...rows.map(s =>
      [s.name, s.email, s.phone, s.batch, s.course, s.status || 'ACTIVE'].map(v => `"${v || ''}"`).join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students_export.csv'; a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported ' + rows.length + ' students', 'success');
  }

  setStudentSort(mode: 'NAME' | 'BATCH' | 'COURSE' | 'RECENT'): void {
    this.studentSortMode = mode;
    this.studentPage = 1;
  }

  setView(mode: 'GRID' | 'LIST'): void { this.viewMode = mode; }

  sortLabel(sort: string): string {
    switch (sort) {
      case 'NAME': return 'Name';
      case 'BATCH': return 'Batch';
      case 'COURSE': return 'Course';
      case 'RECENT': return 'Recent';
      default: return sort;
    }
  }

  sortIcon(sort: string): string {
    switch (sort) {
      case 'NAME': return 'bi bi-person';
      case 'BATCH': return 'bi bi-collection';
      case 'COURSE': return 'bi bi-mortarboard';
      case 'RECENT': return 'bi bi-clock';
      default: return 'bi bi-sort-alpha-down';
    }
  }

  /* ═══════════ MOCKS ═══════════ */
  get filteredMocks(): any[] {
    const q = this.search.toLowerCase().trim();
    let list = this.mockRequests;
    if (this.mockFilter !== 'ALL') {
      list = list.filter(m => m.status === this.mockFilter);
    }
    if (q) {
      list = list.filter(m =>
        [m.student, m.email, m.topic, m.batch, m.status].some(v =>
          String(v || '').toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }

  mockStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'ts-tag--amber';
      case 'SCHEDULED': return 'ts-tag--blue';
      case 'COMPLETED': return 'ts-tag--green';
      case 'REJECTED': return 'ts-tag--rose';
      default: return 'ts-tag--slate';
    }
  }

  mockStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'bi bi-clock-history';
      case 'SCHEDULED': return 'bi bi-calendar-check';
      case 'COMPLETED': return 'bi bi-check-circle-fill';
      case 'REJECTED': return 'bi bi-x-circle-fill';
      default: return 'bi bi-question-circle';
    }
  }

  updateMock(item: any, status: string): void {
    if (status === 'SCHEDULED' && !String(item.meetingLink || '').trim()) {
      this.showToast('Meeting link required to schedule', 'error');
      return;
    }
    this.service
      .updateMockInterview(item.id, {
        status,
        meetingLink: item.meetingLink || '',
        trainerRemarks: item.trainerRemarks || '',
      })
      .subscribe({
        next: () => {
          this.showToast('Mock interview updated to ' + status, 'success');
          this.load();
        },
        error: () => this.showToast('Update failed – try again', 'error'),
      });
  }

  /* ═══════════ RESULTS ═══════════ */
  get filteredSubmissions(): any[] {
    const q = this.search.toLowerCase().trim();
    let list = [...this.submissions];
    if (q) {
      list = list.filter(s =>
        [s.student, s.title, s.type, s.batch].some(v =>
          String(v || '').toLowerCase().includes(q),
        ),
      );
    }
    switch (this.resultSort) {
      case 'MARKS_HIGH': list.sort((a, b) => (b.marks || 0) - (a.marks || 0)); break;
      case 'MARKS_LOW': list.sort((a, b) => (a.marks || 0) - (b.marks || 0)); break;
      case 'NAME': list.sort((a, b) => String(a.student || '').localeCompare(b.student || '')); break;
      default: break;
    }
    return list;
  }

  getMarkPercent(sub: any): number {
    if (!sub.totalMarks) return 0;
    return Math.round(((sub.marks || 0) / sub.totalMarks) * 100);
  }

  getMarkColor(sub: any): string {
    const p = this.getMarkPercent(sub);
    if (p >= 80) return 'ts-mark--green';
    if (p >= 50) return 'ts-mark--amber';
    return 'ts-mark--rose';
  }

  review(submission: any): void {
    this.service.reviewSubmission(submission.id, this.reviewDraft[submission.id]).subscribe({
      next: () => {
        this.showToast('Result saved successfully', 'success');
        this.load();
      },
      error: () => this.showToast('Result save failed', 'error'),
    });
  }

  resultSortLabel(sort: string): string {
    switch (sort) {
      case 'RECENT': return 'Recent';
      case 'MARKS_HIGH': return 'Highest';
      case 'MARKS_LOW': return 'Lowest';
      case 'NAME': return 'Name';
      default: return sort;
    }
  }

  /* ═══════════ UTILITIES ═══════════ */
  getInitials(name: string): string {
    return String(name || 'ST')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toast = message;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }

  resetStudentPage(): void { this.studentPage = 1; }

  trackById(_: number, item: any): number { return item.id; }
}
