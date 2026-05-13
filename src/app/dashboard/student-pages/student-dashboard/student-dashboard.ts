import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../service/student-dashboard';
import { StudentWorkflowService } from '../service/student-workflow';
interface StudentStats {
  enrolledCourses: number;
  attendance: number;
  assignmentsPending: number;
  assessmentsUpcoming: number;
  certificates: number;
  placementStatus: string;
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
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {
  loading = true;
  error = '';
  toast = '';
  showMockPopup = false;
  stats: StudentStats = {
    enrolledCourses: 0,
    attendance: 0,
    assignmentsPending: 0,
    assessmentsUpcoming: 0,
    certificates: 0,
    placementStatus: 'Not Eligible'
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
    notes: ''
  };
  quickActions: QuickAction[] = [
    {
      label: 'Open LMS',
      helper: 'Continue classes and content',
      icon: 'bi-play-circle',
      route: '/dashboard/student/lms',
      tone: 'action-blue'
    },
    {
      label: 'Resume Builder',
      helper: 'Prepare a job-ready resume',
      icon: 'bi-file-earmark-person',
      route: '/resume',
      tone: 'action-emerald'
    },
    {
      label: 'Practice Questions',
      helper: 'Interview preparation bank',
      icon: 'bi-lightbulb',
      route: '/preparation',
      tone: 'action-amber'
    },
    {
      label: 'Certificates',
      helper: 'View earned certificates',
      icon: 'bi-award',
      route: '/dashboard/student/certificates',
      tone: 'action-violet'
    },
    {
      label: 'Placements',
      helper: 'Track placement readiness',
      icon: 'bi-briefcase',
      route: '/placements',
      tone: 'action-rose'
    }
  ];
  constructor(
    private studentService: StudentDashboardService,
    private workflow: StudentWorkflowService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.loadDashboard();
    this.loadStudentWorkflow();
  }
  loadDashboard() {
    this.loading = true;
    this.error = '';
    this.studentService.getDashboardData().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const sections = data.sections || {};
        this.stats = { ...this.stats, ...(data.stats || {}) };
        this.myCourses = sections.myCourses || [];
        this.notifications = sections.notifications || [];
        this.mentorSessions = sections.mentorSessions || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Dashboard data could not be loaded.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  loadStudentWorkflow() {
    this.workflow.getWorkItems().subscribe({
      next: (res: any) => this.workItems = res?.data || [],
      error: () => this.workItems = []
    });
    this.workflow.getMockInterviews().subscribe({
      next: (res: any) => this.mockRequests = res?.data || [],
      error: () => this.mockRequests = []
    });
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
  get pendingWorkItems() {
    return this.workItems.filter(item => !item.submitted).slice(0, 5);
  }
  get placementTone(): string {
    const status = String(this.stats.placementStatus || '').toLowerCase();
    if (status.includes('eligible') && !status.includes('not')) return 'ready';
    if (this.averageProgress >= 70 && this.stats.attendance >= 75) return 'almost';
    return 'focus';
  }
  get placementMessage(): string {
    if (this.placementTone === 'ready') return 'You are ready for placement activities.';
    if (this.placementTone === 'almost') return 'You are close. Finish pending work to unlock more readiness.';
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
        route: '/dashboard/student/courses'
      },
      {
        label: 'Attendance',
        value: `${this.stats.attendance}%`,
        caption: this.stats.attendance >= 75 ? 'Healthy attendance' : 'Needs attention',
        icon: 'bi-calendar-check',
        tone: 'green'
      },
      {
        label: 'Pending Work',
        value: this.pendingWorkItems.length || this.totalPending,
        caption: `${this.stats.assignmentsPending} assignments, ${this.stats.assessmentsUpcoming} assessments`,
        icon: 'bi-list-check',
        tone: 'orange',
        route: '/dashboard/student/assignments'
      },
      {
        label: 'Mock Requests',
        value: this.mockRequests.length,
        caption: 'Interview practice requests',
        icon: 'bi-mic',
        tone: 'purple'
      },
      {
        label: 'Certificates',
        value: this.stats.certificates,
        caption: 'Earn and share credentials',
        icon: 'bi-patch-check',
        tone: 'teal',
        route: '/dashboard/student/certificates'
      }
    ];
  }
  get learningPlan() {
    return [
      {
        title: 'Complete today lesson',
        meta: this.activeCourse ? this.getCourseName(this.activeCourse) : 'Choose a course',
        done: this.averageProgress >= 80
      },
      {
        title: 'Clear pending assignments',
        meta: `${this.pendingWorkItems.length || this.stats.assignmentsPending} pending`,
        done: (this.pendingWorkItems.length || this.stats.assignmentsPending) === 0
      },
      {
        title: 'Maintain attendance',
        meta: `${this.stats.attendance}% attendance`,
        done: this.stats.attendance >= 75
      },
      {
        title: 'Prepare placement profile',
        meta: this.stats.placementStatus,
        done: this.placementTone === 'ready'
      }
    ];
  }
  get activityFeed(): DashboardItem[] {
    const courseActivities = this.myCourses.slice(0, 2).map(course => ({
      title: this.getCourseName(course),
      message: `${course.progress || 0}% course progress`
    }));
    return [...courseActivities, ...this.notifications].slice(0, 5);
  }
  getCourseName(course: StudentCourse): string {
    return course.name || course.courseName || 'Course';
  }
  goTo(route: string) {
    this.router.navigate([route]);
  }
  openMockInterviewPopup() {
    this.mockForm = {
      batchId: String(this.myCourses[0]?.batchId || ''),
      topic: '',
      preferredDate: '',
      preferredTime: '',
      notes: ''
    };
    this.showMockPopup = true;
  }
  closeMockInterviewPopup() {
    this.showMockPopup = false;
  }
  submitMockInterviewRequest() {
    if (!this.mockForm.batchId || !this.mockForm.topic || !this.mockForm.preferredDate || !this.mockForm.preferredTime) {
      this.showToast('Fill batch, topic, date, and time');
      return;
    }
    this.workflow.requestMockInterview(this.mockForm).subscribe({
      next: () => {
        this.showToast('Mock interview request sent');
        this.closeMockInterviewPopup();
        this.loadStudentWorkflow();
      },
      error: () => this.showToast('Unable to send request')
    });
  }
  showToast(message: string) {
    this.toast = message;
    setTimeout(() => this.toast = '', 2600);
  }
  progressStyle(value: number | undefined) {
    return { width: `${Math.min(Math.max(Number(value || 0), 0), 100)}%` };
  }
  trackByTitle(_: number, item: { title?: string; label?: string; name?: string; courseName?: string }) {
    return item.title || item.label || item.name || item.courseName;
  }
}
