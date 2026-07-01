import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../service/student-dashboard';
import { StudentWorkflowService } from '../service/student-workflow';
import { StudentService } from '../service/student';
import { PseudoChallengeService } from '../../../features/services/pseudo-challenge';
import { GamificationService } from '../../../services/gamification.service';

interface StudentStats {
  enrolledCourses: number;
  assignmentsPending: number;
  assessmentsUpcoming: number;
  certificates: number;
  placementStatus: string;
  practiceItems: number;
  materials: number;
  notes: number;
  pseudoChallenges?: number;
  solvedChallenges?: number;
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
    pseudoChallenges: 0,
    solvedChallenges: 0,
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

  localTasks: { id: number; text: string; done: boolean }[] = [];
  newTaskText = '';
  loginHistory: string[] = [];
  streakPoints = 0;
  claimedToday = false;
  claimLogs: { date: string; points: number }[] = [];

  dailyTips = [
    "Tip: Code is read more often than it's written. Use clear descriptive naming.",
    "Concept: Big O Notation defines worst-case performance limits.",
    "Best Practice: Commit small and commit often with atomic descriptive messages.",
    "Vitals: Mock interviews reduce real anxiety and build clean storytelling patterns.",
    "Design: Keep components modular and reusable (Single Responsibility Principle)."
  ];

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
    {
      label: 'Pseudo Challenges',
      helper: 'Solve logic and output challenges',
      icon: 'bi-code-square',
      route: '/dashboard/student/pseudo-challenges',
      tone: 'action-blue',
    },
  ];

  constructor(
    private studentService: StudentDashboardService,
    private workflow: StudentWorkflowService,
    private certificateService: StudentService,
    private pseudoChallengeService: PseudoChallengeService,
    private gamificationService: GamificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadStudentWorkflow();
    this.loadLocalTasks();
    this.trackLoginAndStreak();
    this.initGamification();
    this.loadClaimLogs();
  }

  initGamification(): void {
    this.gamificationService.load();
    this.gamificationService.points$.subscribe(pts => {
      this.streakPoints = pts;
      this.cdr.detectChanges();
    });
    this.gamificationService.claimedToday$.subscribe(claimed => {
      this.claimedToday = claimed;
      this.cdr.detectChanges();
    });
  }

  loadClaimLogs(): void {
    try {
      const saved = localStorage.getItem('vt_claim_logs');
      let logs = saved ? JSON.parse(saved) : [];
      
      // If claimLogs is empty but we have loginHistory, dynamically populate logs
      if (logs.length === 0 && this.loginHistory.length > 0) {
        // Sort descending
        const sortedHistory = [...this.loginHistory].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        logs = sortedHistory.map(dateStr => {
          const d = new Date(dateStr);
          return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', 09:00 AM',
            points: 50
          };
        });
        localStorage.setItem('vt_claim_logs', JSON.stringify(logs));
      }
      this.claimLogs = logs;
    } catch {
      this.claimLogs = [];
    }
  }

  claimPoints(): void {
    const streak = this.calculatedStreak;
    let bonus = 0;
    if (streak > 0 && streak % 7 === 0) {
      bonus = Math.floor(streak / 7) * 100;
    }
    this.gamificationService.claimDailyReward();

    // Log the claim event in claimLogs history
    try {
      const saved = localStorage.getItem('vt_claim_logs') || '[]';
      const logs = JSON.parse(saved);
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      // Prevent duplicates
      if (logs.length === 0 || !logs[0].date.includes(todayStr)) {
        logs.unshift({
          date: `${todayStr}, ${timeStr}`,
          points: 50 + bonus
        });
        localStorage.setItem('vt_claim_logs', JSON.stringify(logs.slice(0, 5)));
      }
    } catch {}

    this.loadClaimLogs();

    if (bonus > 0) {
      this.showToast(`Daily streak claimed! +50 PTS & +${bonus} PTS Milestone Bonus!`);
    } else {
      this.showToast('Daily streak points claimed! +50 PTS');
    }
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
        this.loadPseudoChallengeCount();
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

  loadPseudoChallengeCount(): void {
    this.pseudoChallengeService.getStudentChallenges().subscribe({
      next: (res: any) => {
        const count = this.countPseudoChallenges(res?.data ?? res);

        this.stats = {
          ...this.stats,
          pseudoChallenges: count,
        };

        this.cdr.detectChanges();
      },

      error: () => {
        this.stats = {
          ...this.stats,
          pseudoChallenges: 0,
        };

        this.cdr.detectChanges();
      },
    });
  }

  private countPseudoChallenges(payload: any): number {
    if (Array.isArray(payload)) return payload.length;
    if (Array.isArray(payload?.content)) return payload.content.length;
    if (Array.isArray(payload?.items)) return payload.items.length;
    if (Array.isArray(payload?.challenges)) return payload.challenges.length;
    return Number(payload?.totalElements ?? payload?.total ?? payload?.count ?? 0);
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
        label: 'Pseudo Challenges',
        value: this.stats.pseudoChallenges ?? 0,
        caption: 'Solve coding logic tasks',
        icon: 'bi-code-square',
        tone: 'blue',
        route: '/dashboard/student/pseudo-challenges',
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

  // === CUSTOM PREMIUM TO-DO PLANNER ===
  loadLocalTasks(): void {
    try {
      this.localTasks = JSON.parse(localStorage.getItem('vt_student_tasks') || '[]');
      if (this.localTasks.length === 0) {
        this.localTasks = [
          { id: 1, text: 'Review OOP concepts & class inheritance', done: false },
          { id: 2, text: 'Solve 1 dynamic coding pseudo challenge', done: true },
          { id: 3, text: 'Prepare response for mock interview questions', done: false }
        ];
        this.saveLocalTasks();
      }
    } catch {
      this.localTasks = [];
    }
  }

  saveLocalTasks(): void {
    localStorage.setItem('vt_student_tasks', JSON.stringify(this.localTasks));
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
    this.showToast('Daily task added to planner');
  }

  toggleLocalTask(task: any): void {
    task.done = !task.done;
    this.saveLocalTasks();
    this.cdr.detectChanges();
  }

  deleteLocalTask(id: number): void {
    this.localTasks = this.localTasks.filter(t => t.id !== id);
    this.saveLocalTasks();
    this.showToast('Task removed from list');
    this.cdr.detectChanges();
  }

  // === GAMIFICATION & METRIC CONSOLES ===
  // === REAL LOGIN & STREAK TRACKING ===
  trackLoginAndStreak(): void {
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];
      
      const today = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
      
      // If history is empty, populate past 4 days to build a beautiful default streak of 5 days
      if (history.length === 0) {
        const todayDate = new Date();
        for (let i = 4; i >= 0; i--) {
          const d = new Date();
          d.setDate(todayDate.getDate() - i);
          const dateStr = d.toLocaleDateString('en-CA');
          history.push(dateStr);
        }
        localStorage.setItem('vt_login_history', JSON.stringify(history));

        // Initialize points & claim logs for these past days
        localStorage.setItem('vt_profile_points', '250');
        
        const initialClaimLogs = [];
        const todayDateLogs = new Date();
        for (let i = 4; i >= 1; i--) {
          const d = new Date();
          d.setDate(todayDateLogs.getDate() - i);
          initialClaimLogs.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', 09:00 AM',
            points: 50
          });
        }
        localStorage.setItem('vt_claim_logs', JSON.stringify(initialClaimLogs));
      } else if (!history.includes(today)) {
        history.push(today);
        history = history.sort().slice(-60);
        localStorage.setItem('vt_login_history', JSON.stringify(history));
      }
      this.loginHistory = history;
    } catch {
      this.loginHistory = [new Date().toLocaleDateString('en-CA')];
    }
  }

  get calculatedStreak(): number {
    if (this.loginHistory.length === 0) return 0;
    
    // Sort descending
    const sorted = [...this.loginHistory].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const currentCheck = new Date(sorted[0]);
    currentCheck.setHours(0, 0, 0, 0);
    
    const dateStrings = sorted.map(dStr => {
      const tempDate = new Date(dStr);
      tempDate.setHours(0, 0, 0, 0);
      return tempDate.toLocaleDateString('en-CA');
    });

    while (true) {
      const checkStr = currentCheck.toLocaleDateString('en-CA');
      if (dateStrings.includes(checkStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        // Streak freeze / 1-day grace period: check if the day before exists
        const dayBefore = new Date(currentCheck);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const dayBeforeStr = dayBefore.toLocaleDateString('en-CA');
        
        if (dateStrings.includes(dayBeforeStr)) {
          streak++; // count grace day
          currentCheck.setDate(currentCheck.getDate() - 2);
        } else {
          break;
        }
      }
    }
    return streak;
  }

  get last7DaysActivity(): { dateLabel: string; active: boolean }[] {
    const list = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      list.push({
        dateLabel: `${dayLabel} (${d.getDate()})`,
        active: this.loginHistory.includes(dateStr)
      });
    }
    return list;
  }

  get totalXP(): number {
    const courseXP = this.myCourses.reduce((sum, c) => sum + (c.progress || 0) * 8, 0);
    const challengeXP = (this.stats.solvedChallenges || 0) * 35;
    const practiceXP = (this.stats.practiceItems || 0) * 20;
    const streakXP = Math.floor((this.streakPoints || 0) / 10);
    const calculatedXP = courseXP + challengeXP + practiceXP + streakXP;

    // Retrieve lifetime XP from localStorage to ensure it never decreases
    let lifetimeXP = calculatedXP;
    try {
      const savedLifetimeXP = localStorage.getItem('vt_student_lifetime_xp');
      const savedVal = savedLifetimeXP ? parseInt(savedLifetimeXP, 10) : 0;
      if (savedVal > lifetimeXP) {
        lifetimeXP = savedVal;
      }
    } catch {}

    // Persist current lifetime XP to storage
    try {
      localStorage.setItem('vt_student_lifetime_xp', String(lifetimeXP));
      localStorage.setItem('vt_student_total_xp', String(lifetimeXP));
      localStorage.setItem('vt_student_level', String(Math.floor(lifetimeXP / 450) + 1));
      
      const user = JSON.parse(localStorage.getItem('vt_user') || '{}');
      if (user && Object.keys(user).length) {
        user.totalXP = lifetimeXP;
        user.userLevel = Math.floor(lifetimeXP / 450) + 1;
        localStorage.setItem('vt_user', JSON.stringify(user));
      }
    } catch {}

    return lifetimeXP;
  }

  get userLevel(): number {
    return Math.floor(this.totalXP / 450) + 1;
  }

  get xpProgressPercentage(): number {
    return Math.round(((this.totalXP % 450) / 450) * 100);
  }

  get nextMilestoneDays(): number {
    const streak = this.calculatedStreak;
    return Math.ceil((streak + 1) / 7) * 7;
  }

  get daysToNextMilestone(): number {
    return Math.max(this.nextMilestoneDays - this.calculatedStreak, 0);
  }

  get milestoneProgress(): number {
    const streak = this.calculatedStreak;
    const target = this.nextMilestoneDays;
    const prev = target - 7;
    const currentDone = streak - prev;
    return Math.min(Math.max(Math.round((currentDone / 7) * 100), 0), 100);
  }

  get milestoneTargetDateLabel(): string {
    const needed = this.nextMilestoneDays - this.calculatedStreak;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + needed);
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  }

  get milestoneCalendarDays(): any[] {
    const list = [];
    const streak = this.calculatedStreak;
    const target = this.nextMilestoneDays;
    const needed = target - streak;

    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Center the 7-day window around Today
    for (let i = -4; i <= 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const dateStr = d.toLocaleDateString('en-CA');
      const todayStr = new Date().toLocaleDateString('en-CA');
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + needed);
      const targetStr = targetDate.toLocaleDateString('en-CA');

      const isTarget = dateStr === targetStr;
      const isToday = dateStr === todayStr;

      const iterationDate = new Date(d);
      iterationDate.setHours(0, 0, 0, 0);

      let status = 'PENDING';
      if (isTarget) {
        status = 'TARGET';
      } else if (isToday) {
        status = 'CURRENT';
      } else if (this.loginHistory.includes(dateStr)) {
        status = 'COMPLETED';
      } else if (iterationDate < checkDate) {
        status = 'MISSED';
      }

      list.push({
        dayNum: d.getDate(),
        monthLabel: d.toLocaleDateString('en-US', { month: 'short' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: status
      });
    }
    return list;
  }

  get skillMetrics() {
    const solved = this.stats.solvedChallenges || 0;
    const totalChallenges = this.stats.pseudoChallenges || 0;
    const mockCount = this.mockRequests.length;
    const certificatesCount = this.stats.certificates || 0;
    const avgProgress = this.averageProgress;

    // Coding & Logic: based on solved ratio, falling back to course progress
    let codingLogic = 30;
    if (totalChallenges > 0) {
      codingLogic = Math.min(30 + Math.round((solved / totalChallenges) * 70), 100);
    } else {
      codingLogic = Math.min(35 + Math.round(avgProgress * 0.6), 95);
    }

    // DSA & Concepts: mapped directly to average course learning progress
    const conceptualDsa = Math.min(35 + Math.round(avgProgress * 0.65), 100);

    // Interview Vitals: mapped to mock interview count and course progress
    const mockVitals = mockCount > 0 
      ? Math.min(40 + (mockCount * 15), 95)
      : Math.min(30 + Math.round(avgProgress * 0.5), 90);

    // Core Tech Stack: course progress combined with certificate validations
    const coreTechStack = Math.min(30 + Math.round(avgProgress * 0.5) + (certificatesCount * 10), 98);

    return [
      { name: 'Coding & Logic', value: codingLogic, icon: 'bi-code-slash', tone: 'blue' },
      { name: 'DSA & Concepts', value: conceptualDsa, icon: 'bi-calculator', tone: 'purple' },
      { name: 'Interview Vitals', value: mockVitals, icon: 'bi-people', tone: 'rose' },
      { name: 'Core Tech Stack', value: coreTechStack, icon: 'bi-layers', tone: 'teal' }
    ];
  }

  get currentTip(): string {
    const day = new Date().getDay();
    return this.dailyTips[day % this.dailyTips.length];
  }
}
