import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../service/trainer-dashboard';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-dashboard.html',
  styleUrls: ['./trainer-dashboard.css'],
})
export class TrainerDashboard implements OnInit {
  loading = true;
  saving = false;
  toast = '';

  // Workspace Navigation and Filter States
  activeTab: 'overview' | 'students' | 'mocks' | 'submissions' | 'content' = 'overview';
  filterBatchId = '';
  studentSearch = '';
  submissionSearch = '';

  // Local Trainer Tasks Checklist Planner
  localTasks: { id: number; text: string; done: boolean }[] = [];
  newTaskText = '';

  // Dynamic Curriculum outline properties
  curriculumList: any[] = [];
  loadingCurriculum = false;
  taughtTopics: Record<string, string[]> = {};

  stats = {
    assignedCourses: 0,
    assignedBatches: 0,
    totalStudents: 0,
    pendingReviews: 0,
    todaysSessions: 0,
    avgAttendance: 0,
    assignmentsSubmitted: 0,
    requestedMocks: 0,
    scheduledMocks: 0,
    completedMocks: 0,
    contentUploaded: 0,
  };
  courses: any[] = [];
  upcomingSessions: any[] = [];
  studentActivities: any[] = [];
  batches: any[] = [];
  students: any[] = [];
  mockRequests: any[] = [];
  workItems: any[] = [];
  submissions: any[] = [];
  showCurriculumPopup = false;
  selectedBatchId = '';
  selectedStudent: any = null;
  submissionFilterState: 'all' | 'pending' | 'reviewed' = 'all';
  selectedFile?: File;
  mode: 'file' | 'paste' = 'file';
  jsonText = '';
  reviewDraft: Record<
    number,
    {
      marks: number;
      feedback: string;
    }
  > = {};
  contentItems: any[] = [];
  contentMode: 'file' | 'json' | 'link' = 'file';
  contentJsonText = '';
  contentLinks: string[] = [''];

  contentForm = {
    batchId: '',
    type: 'PRACTICE',
    title: '',
    description: '',
  };

  selectedContentFile?: File;
  constructor(
    private trainerService: TrainerDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.loadDashboard();
    this.loadWorkspace();
    this.loadLocalTasks();
    this.loadTaughtTopics();
  }
  loadDashboard() {
    this.loading = true;
    this.trainerService.getDashboardData().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.stats = {
          ...this.stats,
          ...(data.stats || {}),
        };
        this.batches = data.sections?.batches || [];
        this.courses = data.sections?.courses || [];
        this.upcomingSessions = data.sections?.upcomingSessions || [];
        this.studentActivities = data.sections?.studentActivities || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showToast('Trainer dashboard failed to load');
      },
    });
  }
  loadWorkspace() {
    this.trainerService.getStudents().subscribe({
      next: (res: any) => (this.students = res?.data || []),
      error: () => (this.students = []),
    });

    this.trainerService.getMockInterviewRequests().subscribe({
      next: (res: any) => (this.mockRequests = res?.data || []),
      error: () => (this.mockRequests = []),
    });

    this.trainerService.getWorkItems().subscribe({
      next: (res: any) => (this.workItems = res?.data || []),
      error: () => (this.workItems = []),
    });

    this.trainerService.getSubmissions().subscribe({
      next: (res: any) => {
        this.submissions = res?.data || [];
        this.submissions.forEach((item) => {
          this.reviewDraft[item.id] = {
            marks: item.marks || 0,
            feedback: item.feedback || '',
          };
        });
      },
      error: () => (this.submissions = []),
    });

    this.trainerService.getContent().subscribe({
      next: (res: any) => (this.contentItems = res?.data || []),
      error: () => (this.contentItems = []),
    });
  }
  get pendingMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'REQUESTED');
  }
  get pendingSubmissions() {
    return this.submissions.filter((item) => item.status === 'SUBMITTED');
  }
  get scheduledMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'SCHEDULED');
  }
  get completedMockRequests() {
    return this.mockRequests.filter((item) => item.status === 'COMPLETED');
  }
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }
  courseImage(url: string | null | undefined): string {
  if (!url) return '';

  if (url.startsWith('data:')) {
    return url;
  }

  if (url.startsWith('http')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${environment.apiUrl}${url}`;
  }

  return `${environment.apiUrl}/course-thumbnails/${url}`;
}
  openCurriculumPopup() {
    this.showCurriculumPopup = true;
  }
  closeCurriculumPopup() {
    this.showCurriculumPopup = false;
    this.selectedFile = undefined;
    this.jsonText = '';
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0];
  }
  submitCurriculum() {
    if (!this.selectedBatchId) {
      this.showToast('Select batch first');
      return;
    }
    if (this.mode === 'file') {
      if (!this.selectedFile) {
        this.showToast('Select curriculum file');
        return;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('batchId', this.selectedBatchId);
      this.trainerService.uploadCurriculum(formData).subscribe({
        next: () => {
          this.showToast('Curriculum uploaded successfully');
          this.closeCurriculumPopup();
        },
        error: () => this.showToast('Upload failed'),
      });
      return;
    }
    try {
      const parsed = JSON.parse(this.jsonText);
      this.trainerService
        .uploadJsonCurriculum({
          batchId: this.selectedBatchId,
          json: JSON.stringify(parsed),
        })
        .subscribe({
          next: () => {
            this.showToast('Curriculum saved successfully');
            this.closeCurriculumPopup();
          },
          error: () => this.showToast('Backend rejected this JSON'),
        });
    } catch {
      this.showToast('Invalid JSON format');
    }
  }
  updateMock(item: any, status: string) {
    if (status === 'SCHEDULED' && !String(item.meetingLink || '').trim()) {
      this.showToast('Meeting link required to schedule');
      return;
    }

    this.trainerService
      .updateMockInterview(item.id, {
        status,
        meetingLink: item.meetingLink || '',
        trainerRemarks: item.trainerRemarks || '',
      })
      .subscribe({
        next: () => {
          this.showToast('Mock interview updated');
          this.loadWorkspace();
          this.loadDashboard();
        },
        error: () => this.showToast('Unable to update request'),
      });
  }
  review(submission: any) {
    const draft = this.reviewDraft[submission.id];
    this.trainerService.reviewSubmission(submission.id, draft).subscribe({
      next: () => {
        this.showToast('Result saved');
        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => this.showToast('Unable to save result'),
    });
  }
  showToast(message: string) {
    this.toast = message;
    setTimeout(() => {
      this.toast = '';
    }, 2600);
  }
  setContentMode(mode: 'file' | 'json' | 'link'): void {
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
    return this.contentLinks.map(link => link.trim()).filter(Boolean);
  }

  isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
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

    if (this.contentMode === 'file') {
      if (this.selectedContentFile) {
        formData.append('file', this.selectedContentFile);
      }
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
      if (links.some(link => !this.isValidUrl(link))) {
        this.showToast('Use valid http or https links');
        return;
      }
      formData.append('links', JSON.stringify(links));
    }

    this.trainerService.uploadContent(formData).subscribe({
      next: () => {
        this.showToast('Content uploaded successfully');

        this.contentForm = {
          batchId: '',
          type: 'PRACTICE',
          title: '',
          description: '',
        };

        this.contentMode = 'file';
        this.contentJsonText = '';
        this.selectedContentFile = undefined;
        this.contentLinks = [''];

        this.loadWorkspace();
        this.loadDashboard();
      },
      error: () => this.showToast('Unable to upload content'),
    });
  }

  // Trainer Local Task Planner Methods
  loadLocalTasks(): void {
    try {
      this.localTasks = JSON.parse(localStorage.getItem('vt_trainer_tasks') || '[]');
      if (this.localTasks.length === 0) {
        this.localTasks = [
          { id: 1, text: 'Review today\'s session attendance', done: false },
          { id: 2, text: 'Schedule mock interviews for next week', done: false },
          { id: 3, text: 'Grade student practice lab submissions', done: true },
          { id: 4, text: 'Upload curriculum draft for Java Batch #4', done: false }
        ];
        this.saveLocalTasks();
      }
    } catch {
      this.localTasks = [];
    }
  }

  saveLocalTasks(): void {
    localStorage.setItem('vt_trainer_tasks', JSON.stringify(this.localTasks));
  }

  addLocalTask(): void {
    if (!this.newTaskText.trim()) return;
    this.localTasks.push({
      id: Date.now(),
      text: this.newTaskText.trim(),
      done: false
    });
    this.newTaskText = '';
    this.saveLocalTasks();
    this.showToast('Task added to checklist');
  }

  toggleLocalTask(task: any): void {
    task.done = !task.done;
    this.saveLocalTasks();
    this.cdr.detectChanges();
  }

  deleteLocalTask(id: number): void {
    this.localTasks = this.localTasks.filter(t => t.id !== id);
    this.saveLocalTasks();
    this.showToast('Task deleted');
    this.cdr.detectChanges();
  }

  // Reactive filtered data getters
  get filteredStudentsList(): any[] {
    let list = this.students || [];
    const searchVal = this.studentSearch.toLowerCase().trim();
    
    if (this.filterBatchId) {
      list = list.filter(s => String(s.batchId || s.batch || s.id || '') === String(this.filterBatchId));
    }
    
    if (searchVal) {
      list = list.filter(s => 
        [s.name, s.email, s.phone, s.batch, s.course].some(field => 
          String(field || '').toLowerCase().includes(searchVal)
        )
      );
    }
    return list;
  }

  get filteredSubmissionsList(): any[] {
    let list = this.submissions || [];
    const searchVal = this.submissionSearch.toLowerCase().trim();
    
    if (this.filterBatchId) {
      list = list.filter(sub => String(sub.batchId || sub.batch || '') === String(this.filterBatchId));
    }

    if (this.submissionFilterState === 'pending') {
      list = list.filter(sub => sub.status === 'SUBMITTED' || !sub.marks);
    } else if (this.submissionFilterState === 'reviewed') {
      list = list.filter(sub => sub.status === 'REVIEWED' || sub.marks);
    }
    
    if (searchVal) {
      list = list.filter(sub => 
        [sub.student, sub.title, sub.type, sub.status].some(field => 
          String(field || '').toLowerCase().includes(searchVal)
        )
      );
    }
    return list;
  }

  getStudentSubmissions(studentName: string): any[] {
    if (!studentName) return [];
    return this.submissions.filter(s => String(s.student || '').toLowerCase() === String(studentName).toLowerCase());
  }

  getStudentMocks(studentName: string): any[] {
    if (!studentName) return [];
    return this.mockRequests.filter(m => String(m.student || '').toLowerCase() === String(studentName).toLowerCase());
  }

  get curriculumProgressPercentage(): number {
    if (!this.curriculumList.length || !this.filterBatchId) return 0;
    const taughtCount = this.curriculumList.filter(t => this.isTopicTaught(t.name || t.title)).length;
    return Math.round((taughtCount / this.curriculumList.length) * 100);
  }

  trackByIndex(index: number): number {
    return index;
  }

  toggleBatchSelection(batchId: any): void {
    const stringId = String(batchId || '');
    if (this.filterBatchId === stringId) {
      this.filterBatchId = '';
    } else {
      this.filterBatchId = stringId;
    }
    this.onBatchFilterChange();
  }

  get filteredMocksList(): any[] {
    let list = this.mockRequests || [];
    if (this.filterBatchId) {
      list = list.filter(item => String(item.batchId || item.batch || '') === String(this.filterBatchId));
    }
    return list;
  }

  get filteredContentList(): any[] {
    let list = this.contentItems || [];
    if (this.filterBatchId) {
      list = list.filter(item => String(item.batchId || '') === String(this.filterBatchId));
    }
    return list;
  }

  get filteredUpcomingSessionsList(): any[] {
    let list = this.upcomingSessions || [];
    if (this.filterBatchId) {
      list = list.filter(item => String(item.batchId || item.batch || '') === String(this.filterBatchId));
    }
    return list;
  }

  getInitials(name: string): string {
    return String(name || 'ST')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  get attendanceRateStyle(): any {
    const rate = this.stats.avgAttendance || 0;
    return { 'stroke-dasharray': `${rate}, 100` };
  }

  get submissionRatePercentage(): number {
    if (!this.students.length) return 0;
    const submittedCount = this.stats.assignmentsSubmitted || 0;
    const totalCount = this.students.length;
    return Math.round((submittedCount / totalCount) * 100) || 0;
  }

  get mockConversionPercentage(): number {
    const totalMocks = this.mockRequests.length || 0;
    if (!totalMocks) return 0;
    const completedCount = this.mockRequests.filter(item => item.status === 'COMPLETED').length;
    return Math.round((completedCount / totalMocks) * 100) || 0;
  }

  // Unified batch filter action to retrieve curriculum details dynamically
  onBatchFilterChange(): void {
    if (!this.filterBatchId) {
      this.curriculumList = [];
      return;
    }
    this.loadingCurriculum = true;
    this.trainerService.getCurriculum(Number(this.filterBatchId)).subscribe({
      next: (res: any) => {
        const raw = res?.data || res || [];
        if (typeof raw === 'string') {
          try {
            this.curriculumList = JSON.parse(raw);
          } catch {
            this.curriculumList = [];
          }
        } else if (Array.isArray(raw)) {
          this.curriculumList = raw;
        } else if (raw.json) {
          try {
            this.curriculumList = JSON.parse(raw.json);
          } catch {
            this.curriculumList = [];
          }
        } else {
          this.curriculumList = [];
        }
        this.loadingCurriculum = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.curriculumList = [];
        this.loadingCurriculum = false;
        this.cdr.detectChanges();
      }
    });
  }

  get selectedBatchDetails(): any {
    if (!this.filterBatchId) return null;
    return this.batches.find(b => String(b.id) === String(this.filterBatchId)) || null;
  }

  // Dynamic Average Grade Calculation
  get averageGrade(): number {
    let list = this.submissions || [];
    if (this.filterBatchId) {
      list = list.filter(sub => String(sub.batchId || sub.batch || '') === String(this.filterBatchId));
    }
    const reviewed = list.filter(sub => sub.status === 'REVIEWED' || sub.marks || sub.percentage);
    if (!reviewed.length) return 0;
    const total = reviewed.reduce((sum, sub) => sum + Number(sub.marks || sub.percentage || 0), 0);
    return Math.round(total / reviewed.length);
  }

  // Dynamic Batch Leaderboard Calculation
  get batchLeaderboard(): any[] {
    let activeStudents = this.students || [];
    if (this.filterBatchId) {
      activeStudents = activeStudents.filter(s => String(s.batchId || s.batch || s.id || '') === String(this.filterBatchId));
    }
    
    const leaderboard = activeStudents.map(student => {
      const studentSubs = this.submissions.filter(sub => 
        String(sub.student).toLowerCase() === String(student.name).toLowerCase()
      );
      
      const gradedSubs = studentSubs.filter(sub => sub.marks || sub.percentage);
      let avgMark = 0;
      if (gradedSubs.length > 0) {
        const total = gradedSubs.reduce((sum, sub) => sum + Number(sub.marks || sub.percentage || 0), 0);
        avgMark = Math.round(total / gradedSubs.length);
      }
      
      return {
        name: student.name,
        email: student.email,
        phone: student.phone,
        averageMark: avgMark,
        submissionsCount: studentSubs.length
      };
    });
    
    return leaderboard.sort((a, b) => b.averageMark - a.averageMark).slice(0, 5);
  }

  // Submissions that need immediate grading reviews
  get pendingReviewsList(): any[] {
    let list = this.submissions || [];
    list = list.filter(sub => sub.status === 'SUBMITTED' || !sub.marks);
    if (this.filterBatchId) {
      list = list.filter(sub => String(sub.batchId || sub.batch || '') === String(this.filterBatchId));
    }
    return list;
  }

  // Taught topics loaders and togglers
  loadTaughtTopics(): void {
    try {
      this.taughtTopics = JSON.parse(localStorage.getItem('vt_trainer_taught_topics') || '{}');
    } catch {
      this.taughtTopics = {};
    }
  }

  saveTaughtTopics(): void {
    localStorage.setItem('vt_trainer_taught_topics', JSON.stringify(this.taughtTopics));
  }

  isTopicTaught(topicName: string): boolean {
    if (!this.filterBatchId || !topicName) return false;
    const list = this.taughtTopics[this.filterBatchId] || [];
    return list.includes(topicName);
  }

  toggleTopicTaught(topicName: string): void {
    if (!this.filterBatchId || !topicName) return;
    
    if (!this.taughtTopics[this.filterBatchId]) {
      this.taughtTopics[this.filterBatchId] = [];
    }
    
    const index = this.taughtTopics[this.filterBatchId].indexOf(topicName);
    if (index > -1) {
      this.taughtTopics[this.filterBatchId].splice(index, 1);
      this.showToast(`Marked "${topicName}" as pending`);
    } else {
      this.taughtTopics[this.filterBatchId].push(topicName);
      this.showToast(`Marked "${topicName}" as taught`);
    }
    this.saveTaughtTopics();
    this.cdr.detectChanges();
  }
}
