import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../service/student-dashboard';
import { StudentWorkflowService } from '../service/student-workflow';
import { StudentService } from '../service/student';

interface StudentStats {
  enrolledCourses: number;
  assignmentsPending: number;
  assessmentsUpcoming: number;
  certificates: number;
  placementStatus: string;
  practiceItems: number;
  materials: number;
  notes: number;
}

interface StudentCourse {
  name?: string;
  courseName?: string;
  batchName?: string;
  progress: number;
  batchId?: number | string;
  mentor?: string;
  nextClass?: string;
}

interface DashboardItem {
  title: string;
  message?: string;
  date?: string;
}

interface StatCard {
  label: string;
  value: string | number;
  caption: string;
  icon: string;
  tone: string;
  route?: string;
}

interface QuickAction {
  label: string;
  helper: string;
  icon: string;
  route: string;
  tone: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css'],
})
export class StudentDashboard implements OnInit {
  loading = true;
  error = '';
  toast = '';
  showMockPopup = false;
  learningContent: any[] = [];

  stats: StudentStats = {
    enrolledCourses: 0,
    assignmentsPending: 0,
    assessmentsUpcoming: 0,
    certificates: 0,
    placementStatus: 'Not Eligible',
    practiceItems: 0,
    materials: 0,
    notes: 0,
  };

  myCourses: StudentCourse[] = [];
  notifications: DashboardItem[] = [];
  mentorSessions: DashboardItem[] = [];
  workItems: any[] = [];
  mockRequests: any[] = [];

  mockForm = {
    batchId: '',
    topic: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  };

  quickActions: QuickAction[] = [
    {
      label: 'Open LMS',
      helper: 'Continue classes and content',
      icon: 'bi-play-circle',
      route: '/dashboard/student/lms',
      tone: 'action-blue',
    },
    {
      label: 'Resume Builder',
      helper: 'Prepare a job-ready resume',
      icon: 'bi-file-earmark-person',
      route: '/resume',
      tone: 'action-emerald',
    },
    {
      label: 'Coding Practice',
      helper: 'Practice coding & MCQs',
      icon: 'bi-lightbulb',
      route: '/preparation',
      tone: 'action-amber',
    },
    {
      label: 'Certificates',
      helper: 'View earned certificates',
      icon: 'bi-award',
      route: '/dashboard/student/certificates',
      tone: 'action-violet',
    },
    {
      label: 'Placements',
      helper: 'Track placement readiness',
      icon: 'bi-briefcase',
      route: '/placements',
      tone: 'action-rose',
    },
  ];

  constructor(
    private studentService: StudentDashboardService,
    private workflow: StudentWorkflowService,
    private certificateService: StudentService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadStudentWorkflow();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.studentService.getDashboardData().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const sections = data.sections || {};
        const currentCertificateCount = this.stats.certificates;

        this.stats = {
          ...this.stats,
          ...(data.stats || {}),
          certificates: currentCertificateCount,
        };

        this.myCourses = sections.myCourses || [];
        this.notifications = sections.notifications || [];
        this.mentorSessions = sections.mentorSessions || [];
        this.learningContent = sections.learningContent || [];
        this.loading = false;

        this.loadCertificateCount();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Dashboard data could not be loaded.';
        this.loading = false;
        this.loadCertificateCount();
        this.cdr.detectChanges();
      },
    });
  }

  loadStudentWorkflow(): void {
    this.workflow.getWorkItems().subscribe({
      next: (res: any) => (this.workItems = res?.data || []),
      error: () => (this.workItems = []),
    });

    this.workflow.getMockInterviews().subscribe({
      next: (res: any) => (this.mockRequests = res?.data || []),
      error: () => (this.mockRequests = []),
    });
  }

  loadCertificateCount(): void {
    this.certificateService.getCertificates(this.currentUser?.email).subscribe({
      next: (res: any) => {
        const certificates = res?.data || res || [];

        this.stats = {
          ...this.stats,
          certificates: Array.isArray(certificates) ? certificates.length : 0,
        };

        this.cdr.detectChanges();
      },
      error: () => {
        this.stats = {
          ...this.stats,
          certificates: 0,
        };

        this.cdr.detectChanges();
      },
    });
  }

  get currentUser(): any {
    try {
      return JSON.parse(localStorage.getItem('vt_user') || '{}');
    } catch {
      return {};
    }
  }

  get studentName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('vt_user') || '{}');
      return user?.name || user?.fullName || 'Student';
    } catch {
      return 'Student';
    }
  }

  get totalPending(): number {
    return Number(this.stats.assignmentsPending || 0) + Number(this.stats.assessmentsUpcoming || 0);
  }

  get averageProgress(): number {
    if (!this.myCourses.length) return 0;

    const total = this.myCourses.reduce((sum, course) => sum + Number(course.progress || 0), 0);
    return Math.round(total / this.myCourses.length);
  }

  get activeCourse(): StudentCourse | null {
    if (!this.myCourses.length) return null;

    return [...this.myCourses].sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0))[0];
  }

  get pendingWorkItems(): any[] {
    return this.workItems.filter((item) => !item.submitted).slice(0, 5);
  }

  get placementTone(): string {
    const status = String(this.stats.placementStatus || '').toLowerCase();

    if (status.includes('eligible') && !status.includes('not')) {
      return 'ready';
    }

    if (this.averageProgress >= 70) {
      return 'almost';
    }

    return 'focus';
  }

  get placementMessage(): string {
    if (this.placementTone === 'ready') return 'You are ready for placement activities.';

    if (this.placementTone === 'almost') {
      return 'You are close. Finish pending work to unlock more readiness.';
    }

    return 'Improve attendance, course progress, and assignments to become placement ready.';
  }

  get statCards(): StatCard[] {
    return [
      {
        label: 'Enrolled Courses',
        value: this.stats.enrolledCourses,
        caption: `${this.averageProgress}% average progress`,
        icon: 'bi-journal-bookmark',
        tone: 'blue',
        route: '/dashboard/student/courses',
      },
      {
        label: 'Assignments',
        value: this.stats.assignmentsPending,
        caption: 'Pending submissions',
        icon: 'bi-file-earmark-text',
        tone: 'orange',
        route: '/dashboard/student/assignments',
      },
      {
        label: 'Practice',
        value: this.stats.practiceItems,
        caption: 'Practice tasks shared',
        icon: 'bi-lightning-charge',
        tone: 'orange',
        route: '/dashboard/student/learning-content?type=PRACTICE',
      },
      {
        label: 'Materials',
        value: this.stats.materials,
        caption: 'Learning files shared',
        icon: 'bi-folder2-open',
        tone: 'purple',
        route: '/dashboard/student/learning-content?type=MATERIAL',
      },
      {
        label: 'Notes',
        value: this.stats.notes,
        caption: 'Trainer notes shared',
        icon: 'bi-journal-text',
        tone: 'teal',
        route: '/dashboard/student/learning-content?type=NOTE',
      },
      {
        label: 'Assessments',
        value: this.stats.assessmentsUpcoming,
        caption: 'Upcoming evaluations',
        icon: 'bi-clipboard-data',
        tone: 'purple',
        route: '/dashboard/student/assessments',
      },
      {
        label: 'Mock Interviews',
        value: this.mockRequests.length,
        caption: 'Interview practice sessions',
        icon: 'bi-camera-video',
        tone: 'rose',
        route: '/dashboard/student/mock-interviews',
      },
      {
        label: 'Certificates',
        value: this.stats.certificates,
        caption: 'Earned credentials',
        icon: 'bi-patch-check',
        tone: 'teal',
        route: '/dashboard/student/certificates',
      },
    ];
  }
  get practiceContent() {
    return this.learningContent.filter((item) => item.type === 'PRACTICE');
  }

  get materialContent() {
    return this.learningContent.filter((item) => item.type === 'MATERIAL');
  }

  get notesContent() {
    return this.learningContent.filter((item) => item.type === 'NOTE');
  }
  get learningPlan() {
    return [
      {
        title: 'Complete today lesson',
        meta: this.activeCourse ? this.getCourseName(this.activeCourse) : 'Choose a course',
        done: this.averageProgress >= 80,
      },
      {
        title: 'Clear pending assignments',
        meta: `${this.pendingWorkItems.length || this.stats.assignmentsPending} pending`,
        done: (this.pendingWorkItems.length || this.stats.assignmentsPending) === 0,
      },
      {
        title: 'Prepare placement profile',
        meta: this.stats.placementStatus,
        done: this.placementTone === 'ready',
      },
    ];
  }

  get activityFeed(): DashboardItem[] {
    const courseActivities = this.myCourses.slice(0, 2).map((course) => ({
      title: this.getCourseName(course),
      message: `${course.progress || 0}% course progress`,
    }));

    return [...courseActivities, ...this.notifications].slice(0, 5);
  }

  getCourseName(course: StudentCourse): string {
    return course.name || course.courseName || 'Course';
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  openMockInterviewPopup(): void {
    this.mockForm = {
      batchId: String(this.myCourses[0]?.batchId || ''),
      topic: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    };

    this.showMockPopup = true;
  }

  closeMockInterviewPopup(): void {
    this.showMockPopup = false;
  }

  submitMockInterviewRequest(): void {
    if (
      !this.mockForm.batchId ||
      !this.mockForm.topic ||
      !this.mockForm.preferredDate ||
      !this.mockForm.preferredTime
    ) {
      this.showToast('Fill batch, topic, date, and time');
      return;
    }

    this.workflow.requestMockInterview(this.mockForm).subscribe({
      next: () => {
        this.showToast('Mock interview request sent');
        this.closeMockInterviewPopup();
        this.loadStudentWorkflow();
      },
      error: () => this.showToast('Unable to send request'),
    });
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  progressStyle(value: number | undefined) {
    return { width: `${Math.min(Math.max(Number(value || 0), 0), 100)}%` };
  }

  trackByTitle(
    _: number,
    item: { title?: string; label?: string; name?: string; courseName?: string },
  ): string | undefined {
    return item.title || item.label || item.name || item.courseName;
  }
}
