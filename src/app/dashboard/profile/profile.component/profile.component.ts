import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserPlanBadgeService } from '../../../services/user-plan-badge.service';

type ToastType = 'success' | 'error';

interface PreferenceItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
  enabled: boolean;
}

interface ProfileAction {
  code: string;
  title: string;
  desc: string;
  route: string;
  icon: string;
}

interface ProfileInsight {
  label: string;
  value: string;
  helper: string;
  icon: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = {};
  loading = true;
  editMode = false;
  saving = false;
  message = '';
  error = '';
  profileImageFailed = false;

  localProfileImage = '';
  localCoverImage = '';
  tempProfileImage = '';
  tempCoverImage = '';

  resumeName = '';
  resumeSize = '';
  resumeTimestamp = '';
  resumeData = '';
  isUploadingResume = false;
  uploadProgress = 0;

  dailyStreak = 5;
  rewardPoints = 340;
  claimedToday = false;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly prefsKey = 'vt_profile_preferences';

  form = {
    name: '',
    phone: '',
    aboutMe: '',
  };

  aboutMe = '';
  skillTags: string[] = [];
  newSkillText = '';

  preferences: PreferenceItem[] = [
    {
      key: 'emailUpdates',
      title: 'Email Updates',
      desc: 'Course launches, invoices, and platform news',
      icon: 'bi bi-envelope-check',
      enabled: true,
    },
    {
      key: 'careerAlerts',
      title: 'Career Alerts',
      desc: 'Placement drives, jobs, and hiring reminders',
      icon: 'bi bi-briefcase',
      enabled: true,
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      desc: 'Login, password, and account activity updates',
      icon: 'bi bi-shield-check',
      enabled: true,
    },
    {
      key: 'learningNudges',
      title: 'Learning Nudges',
      desc: 'Assessment, assignment, and batch progress reminders',
      icon: 'bi bi-lightning-charge',
      enabled: true,
    },
  ];

  activities = [
    { title: 'Profile data synced', time: 'Just now', icon: 'bi bi-arrow-repeat' },
    { title: 'Dashboard session protected', time: 'Today', icon: 'bi bi-shield-lock' },
    { title: 'Role permissions refreshed', time: 'Recently', icon: 'bi bi-person-badge' },
    { title: 'Notification preferences ready', time: 'Recently', icon: 'bi bi-bell' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    public userPlanBadgeService: UserPlanBadgeService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.restorePreferences();
    this.loadNotificationPreferences();
    this.loadProfile();
    this.userPlanBadgeService.load();
    this.loadLocalProfileData();
    this.loadResumeData();
    this.loadGamificationData();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.showError('Please login to view your profile.');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        this.setUser(res);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const cachedUser = this.authService.getUser();

        if (cachedUser && Object.keys(cachedUser).length) {
          this.setUser(cachedUser);
          this.showError('Live profile is unavailable. Showing saved account data.');
        }

        this.loading = false;

        if (err?.status === 401) {
          this.authService.logout();
          this.showError('Session expired. Please login again.');
          setTimeout(() => this.router.navigate(['/login']), 700);
        } else if (err?.status === 403) {
          this.showError('Profile access blocked by server. Please check backend security config.');
        } else if (!cachedUser || !Object.keys(cachedUser).length) {
          this.showError('Profile load failed. Please try again.');
        }

        this.cdr.detectChanges();
      },
    });
  }

  private setUser(user: any): void {
    this.user = user || {};
    this.form.name = this.user.name || '';
    this.form.phone = this.user.phone || '';
  }

  get profileImageUrl(): string {
    if (this.tempProfileImage) {
      return this.tempProfileImage;
    }
    if (this.localProfileImage) {
      return this.localProfileImage;
    }
    const url = String(this.user?.profileImageUrl || '').trim();

    if (!url || this.profileImageFailed) {
      return '';
    }

    return url.startsWith('https://') ? url : '';
  }

  onProfileImageError(): void {
    this.profileImageFailed = true;
  }

  getInitials(): string {
    const name = this.user?.name || this.user?.email || 'User';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  get roleLabel(): string {
    return String(this.user?.role || 'USER').replace(/_/g, ' ');
  }

  get roleKey(): string {
    return String(this.user?.role || 'USER').toUpperCase();
  }

  get rolePath(): string {
    return this.roleKey.toLowerCase().replace(/_/g, '-');
  }

  get accountStatus(): string {
    return this.user?.active === false ? 'Inactive' : 'Active';
  }

  get statusTone(): string {
    return this.user?.active === false ? 'danger' : 'success';
  }

  get profileCompletion(): number {
    const checks = [
      !!this.user?.name,
      !!this.user?.email,
      !!this.user?.phone,
      !!this.user?.role,
      this.preferences.some((pref) => pref.enabled),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get completionText(): string {
    if (this.profileCompletion >= 90) return 'Excellent';
    if (this.profileCompletion >= 70) return 'Strong';
    if (this.profileCompletion >= 45) return 'Good start';
    return 'Needs details';
  }

  get enabledPreferenceCount(): number {
    return this.preferences.filter((pref) => pref.enabled).length;
  }

  get joinedLabel(): string {
    const raw = this.user?.createdAt || this.user?.createdDate || this.user?.joiningDate;
    if (!raw) return 'Not available';

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  get insights(): ProfileInsight[] {
    return [
      {
        label: 'Completion',
        value: `${this.profileCompletion}%`,
        helper: this.completionText,
        icon: 'bi bi-activity',
      },
      {
        label: 'Account',
        value: this.accountStatus,
        helper: this.user?.active === false ? 'Access disabled' : 'Ready to use',
        icon: 'bi bi-check2-circle',
      },
      {
        label: 'Role',
        value: this.roleLabel,
        helper: 'Permissions enabled',
        icon: 'bi bi-person-badge',
      },
      {
        label: 'Alerts',
        value: `${this.enabledPreferenceCount}/${this.preferences.length}`,
        helper: 'Preferences active',
        icon: 'bi bi-bell',
      },
    ];
  }

  get profileChecklist(): { label: string; done: boolean }[] {
    return [
      { label: 'Name added', done: !!this.user?.name },
      { label: 'Email verified', done: !!this.user?.email },
      { label: 'Phone available', done: !!this.user?.phone },
      { label: 'Role assigned', done: !!this.user?.role },
      { label: 'Alerts configured', done: this.enabledPreferenceCount > 0 },
    ];
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.form.name = this.user?.name || '';
    this.form.phone = this.user?.phone || '';
    this.form.aboutMe = this.aboutMe || '';
  }

  saveProfile(): void {
    if (!this.form.name.trim()) {
      this.showError('Name is required');
      return;
    }

    this.saving = true;
    this.aboutMe = this.form.aboutMe.trim();
    this.saveLocalProfileData();

    this.authService
      .updateProfile({
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
      })
      .subscribe({
        next: (res) => {
          this.setUser(res);
          this.editMode = false;
          this.saving = false;
          this.showMessage('Profile updated successfully');
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.showError('Profile update failed');
          this.cdr.markForCheck();
        },
      });
  }

  cancelEdit(): void {
    this.form.name = this.user?.name || '';
    this.form.phone = this.user?.phone || '';
    this.form.aboutMe = this.aboutMe || '';
    this.editMode = false;
  }

  copyEmail(): void {
    if (!this.user?.email) {
      this.showError('Email not available');
      return;
    }

    navigator.clipboard?.writeText(this.user.email);
    this.showMessage('Email copied');
  }

  togglePreference(pref: PreferenceItem): void {
    pref.enabled = !pref.enabled;
    this.savePreferences();
    this.syncNotificationPreferences();
  }

  setPreference(pref: PreferenceItem, enabled: boolean): void {
    pref.enabled = enabled;
    this.savePreferences();
    this.syncNotificationPreferences();
  }

  goToSettings(): void {
    this.router.navigate([`/dashboard/${this.rolePath}/settings`]);
  }

  goToAction(action: ProfileAction): void {
    this.router.navigate([action.route]);
  }

  showMessage(text: string): void {
    this.setToast('success', text);
  }

  showError(text: string): void {
    this.setToast('error', text);
  }

  private setToast(type: ToastType, text: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.message = type === 'success' ? text : '';
    this.error = type === 'error' ? text : '';

    this.toastTimer = setTimeout(() => {
      this.message = '';
      this.error = '';
      this.cdr.markForCheck();
    }, 3000);

    this.cdr.markForCheck();
  }

  private restorePreferences(): void {
    try {
      const saved = JSON.parse(localStorage.getItem(this.prefsKey) || '{}');
      this.preferences = this.preferences.map((pref) => ({
        ...pref,
        enabled: typeof saved[pref.key] === 'boolean' ? saved[pref.key] : pref.enabled,
      }));
    } catch {
      this.savePreferences();
    }
  }

  private savePreferences(): void {
    const payload = this.preferences.reduce(
      (acc, pref) => ({ ...acc, [pref.key]: pref.enabled }),
      {} as Record<string, boolean>,
    );

    localStorage.setItem(this.prefsKey, JSON.stringify(payload));
  }

  private loadNotificationPreferences(): void {
    this.notificationService.getPreferences().subscribe({
      next: (res: any) => {
        const enabled = res?.data?.notificationsEnabled !== false;
        if (!enabled) {
          this.setAllPreferences(false);
        }
        this.savePreferences();
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }

  private syncNotificationPreferences(): void {
    const enabled = this.enabledPreferenceCount > 0;

    this.notificationService.updatePreferences(enabled).subscribe({
      next: (res: any) => {
        const savedEnabled = res?.data?.notificationsEnabled !== false;
        if (!savedEnabled) {
          this.setAllPreferences(false);
        }
        this.savePreferences();
        this.showMessage(savedEnabled ? 'Notifications turned on' : 'Notifications turned off');
      },
      error: () => {
        this.showError('Notification preference sync failed');
        this.loadNotificationPreferences();
      },
    });
  }

  private setAllPreferences(enabled: boolean): void {
    this.preferences = this.preferences.map((pref) => ({
      ...pref,
      enabled,
    }));
  }

  get roleActions(): ProfileAction[] {
    const actions: Record<string, ProfileAction[]> = {
      STUDENT: [
        {
          code: 'LM',
          title: 'LMS Player',
          desc: 'Continue enrolled batch learning',
          route: '/dashboard/student/lms',
          icon: 'bi bi-play-circle',
        },
        {
          code: 'AS',
          title: 'Assessments',
          desc: 'Attempt pending tests and challenges',
          route: '/dashboard/student/assessments',
          icon: 'bi bi-clipboard-data',
        },
        {
          code: 'CR',
          title: 'Certificates',
          desc: 'View course certificates',
          route: '/dashboard/student/certificates',
          icon: 'bi bi-award',
        },
      ],
      TRAINER: [
        {
          code: 'BT',
          title: 'My Batches',
          desc: 'Manage live training cohorts',
          route: '/dashboard/trainer/batches',
          icon: 'bi bi-people',
        },
        {
          code: 'AS',
          title: 'Assessments',
          desc: 'Create and review learner tests',
          route: '/dashboard/trainer/assessments',
          icon: 'bi bi-clipboard-data',
        },
        {
          code: 'ST',
          title: 'Students',
          desc: 'Track student performance',
          route: '/dashboard/trainer/students',
          icon: 'bi bi-person-lines-fill',
        },
      ],
      ADMIN: [
        {
          code: 'US',
          title: 'Users',
          desc: 'Manage platform users',
          route: '/dashboard/admin/users',
          icon: 'bi bi-people-fill',
        },
        {
          code: 'BT',
          title: 'Batches',
          desc: 'Control enrollments and batches',
          route: '/dashboard/admin/batches',
          icon: 'bi bi-collection',
        },
        {
          code: 'AN',
          title: 'Analytics',
          desc: 'Track invoice and platform metrics',
          route: '/invoice-analytics',
          icon: 'bi bi-graph-up',
        },
      ],
      SUPER_ADMIN: [
        {
          code: 'UC',
          title: 'User Control',
          desc: 'Manage all accounts',
          route: '/dashboard/super-admin/users',
          icon: 'bi bi-people-fill',
        },
        {
          code: 'ST',
          title: 'System Settings',
          desc: 'Tune platform preferences',
          route: '/dashboard/super-admin/settings',
          icon: 'bi bi-sliders',
        },
        {
          code: 'AD',
          title: 'Admin Actions',
          desc: 'Review operations',
          route: '/dashboard/admin/actions',
          icon: 'bi bi-lightning-charge',
        },
      ],
    };

    return (
      actions[this.roleKey] || [
        {
          code: 'DB',
          title: 'Dashboard',
          desc: 'Open your workspace',
          route: `/dashboard/${this.rolePath}`,
          icon: 'bi bi-grid',
        },
        {
          code: 'ST',
          title: 'Settings',
          desc: 'Manage preferences',
          route: `/dashboard/${this.rolePath}/settings`,
          icon: 'bi bi-gear',
        },
      ]
    );
  }

  // === DYNAMIC PROFILE SKILLS & BADGES ===
  loadLocalProfileData(): void {
    this.aboutMe = localStorage.getItem('vt_profile_bio') || 'Passionate software developer learning code logic, system design, and building web architectures.';
    this.form.aboutMe = this.aboutMe;
    this.localProfileImage = localStorage.getItem('vt_profile_avatar') || '';
    this.localCoverImage = localStorage.getItem('vt_profile_cover') || '';
    try {
      this.skillTags = JSON.parse(localStorage.getItem('vt_profile_skills') || '[]');
      if (this.skillTags.length === 0) {
        this.skillTags = ['TypeScript', 'Angular', 'Algorithms', 'OOP Design', 'Web Tech'];
        this.saveLocalProfileData();
      }
    } catch {
      this.skillTags = [];
    }
  }

  saveLocalProfileData(): void {
    localStorage.setItem('vt_profile_bio', this.aboutMe);
    localStorage.setItem('vt_profile_skills', JSON.stringify(this.skillTags));
  }

  addSkillTag(): void {
    if (!this.newSkillText.trim()) return;
    const tag = this.newSkillText.trim();
    if (!this.skillTags.includes(tag)) {
      this.skillTags.push(tag);
      this.saveLocalProfileData();
      this.showMessage('Skill tag added successfully!');
    }
    this.newSkillText = '';
  }

  removeSkillTag(tag: string): void {
    this.skillTags = this.skillTags.filter(t => t !== tag);
    this.saveLocalProfileData();
    this.showMessage('Skill tag removed');
    this.cdr.detectChanges();
  }

  get earnedBadges() {
    const list = [];
    const email = this.user?.email || '';

    if (this.user?.name) {
      list.push({ title: 'Identified Dev', desc: 'Profile name is verified', icon: 'bi-patch-check-fill', tone: 'blue' });
    }
    if (this.user?.phone) {
      list.push({ title: 'Connected User', desc: 'Phone details verified', icon: 'bi-telephone-fill', tone: 'emerald' });
    }
    if (email.endsWith('.com')) {
      list.push({ title: 'Vidhura Scholar', desc: 'Official student member', icon: 'bi-mortarboard-fill', tone: 'violet' });
    }
    if (this.profileCompletion >= 80) {
      list.push({ title: 'Profile Elite', desc: '100% account strength unlocked', icon: 'bi-award-fill', tone: 'gold' });
    }

    // Dynamic Consistency & XP Badges
    if (this.dailyStreak >= 1) {
      list.push({ title: 'Streak Starter', desc: `${this.dailyStreak} day consistency active`, icon: 'bi-fire', tone: 'emerald' });
    }
    if (this.dailyStreak >= 7) {
      list.push({ title: 'Consistency Pro', desc: 'Maintained 7+ days learning streak', icon: 'bi-lightning-charge-fill', tone: 'violet' });
    }
    if (this.rewardPoints >= 350) {
      list.push({ title: 'Points Pioneer', desc: 'Accumulated over 350 XP reward points', icon: 'bi-star-fill', tone: 'gold' });
    }

    return list;
  }

  // === PHOTO UPLOADS & REPLACEMENTS ===
  onAvatarSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.tempProfileImage = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  saveAvatarTemp(): void {
    if (!this.tempProfileImage) return;
    this.localProfileImage = this.tempProfileImage;
    localStorage.setItem('vt_profile_avatar', this.localProfileImage);
    this.tempProfileImage = '';
    this.showMessage('Profile picture saved successfully!');
    this.cdr.markForCheck();
  }

  cancelAvatarTemp(): void {
    this.tempProfileImage = '';
    this.cdr.markForCheck();
  }

  onCoverSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.tempCoverImage = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  saveCoverTemp(): void {
    if (!this.tempCoverImage) return;
    this.localCoverImage = this.tempCoverImage;
    localStorage.setItem('vt_profile_cover', this.localCoverImage);
    this.tempCoverImage = '';
    this.showMessage('Cover image saved successfully!');
    this.cdr.markForCheck();
  }

  cancelCoverTemp(): void {
    this.tempCoverImage = '';
    this.cdr.markForCheck();
  }

  resetCover(): void {
    this.localCoverImage = '';
    localStorage.removeItem('vt_profile_cover');
    this.showMessage('Cover image reset');
    this.cdr.markForCheck();
  }

  // === RESUME MANAGER ===
  loadResumeData(): void {
    this.resumeName = localStorage.getItem('vt_resume_name') || '';
    this.resumeSize = localStorage.getItem('vt_resume_size') || '';
    this.resumeTimestamp = localStorage.getItem('vt_resume_timestamp') || '';
    this.resumeData = localStorage.getItem('vt_resume_data') || '';
  }

  onResumeSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      this.showError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    this.isUploadingResume = true;
    this.uploadProgress = 10;

    const interval = setInterval(() => {
      this.uploadProgress += 15;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        
        const reader = new FileReader();
        reader.onload = () => {
          this.resumeName = file.name;
          this.resumeSize = this.formatFileSize(file.size);
          
          const now = new Date();
          this.resumeTimestamp = now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          this.resumeData = reader.result as string;

          localStorage.setItem('vt_resume_name', this.resumeName);
          localStorage.setItem('vt_resume_size', this.resumeSize);
          localStorage.setItem('vt_resume_timestamp', this.resumeTimestamp);
          localStorage.setItem('vt_resume_data', this.resumeData);

          this.isUploadingResume = false;
          this.showMessage('Resume uploaded and stored successfully!');
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      }
    }, 120);
  }

  deleteResume(): void {
    this.resumeName = '';
    this.resumeSize = '';
    this.resumeTimestamp = '';
    this.resumeData = '';
    localStorage.removeItem('vt_resume_name');
    localStorage.removeItem('vt_resume_size');
    localStorage.removeItem('vt_resume_timestamp');
    localStorage.removeItem('vt_resume_data');
    this.showMessage('Resume deleted successfully');
    this.cdr.markForCheck();
  }

  downloadResume(): void {
    if (!this.resumeData || !this.resumeName) return;
    
    const link = document.createElement('a');
    link.href = this.resumeData;
    link.download = this.resumeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // === DYNAMIC STREAKS & REWARDS ===
  loadGamificationData(): void {
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      const history: string[] = historyJson ? JSON.parse(historyJson) : [];
      
      if (history.length === 0) {
        this.dailyStreak = 0;
      } else {
        const sorted = [...history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const todayStr = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
          this.dailyStreak = 0;
        } else {
          let streak = 0;
          const currentCheck = new Date(sorted[0]);

          while (true) {
            const currentCheckStr = currentCheck.toLocaleDateString('en-CA');
            if (sorted.includes(currentCheckStr)) {
              streak++;
              currentCheck.setDate(currentCheck.getDate() - 1);
            } else {
              break;
            }
          }
          this.dailyStreak = streak;
        }
      }
    } catch {
      this.dailyStreak = 0;
    }

    const savedPoints = localStorage.getItem('vt_profile_points');
    this.rewardPoints = savedPoints ? parseInt(savedPoints, 10) : (this.dailyStreak * 50 || 150);

    const lastClaimStr = localStorage.getItem('vt_profile_last_claim');
    if (lastClaimStr) {
      const lastClaimDate = new Date(lastClaimStr).toDateString();
      const todayDate = new Date().toDateString();
      this.claimedToday = lastClaimDate === todayDate;
    } else {
      this.claimedToday = false;
    }
  }

  claimDailyReward(): void {
    if (this.claimedToday) return;

    this.rewardPoints += 50;
    
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];
      const today = new Date().toLocaleDateString('en-CA');

      if (!history.includes(today)) {
        history.push(today);
        history = history.sort().slice(-60);
        localStorage.setItem('vt_login_history', JSON.stringify(history));
      }
    } catch {}

    this.claimedToday = true;

    const now = new Date();
    localStorage.setItem('vt_profile_points', String(this.rewardPoints));
    localStorage.setItem('vt_profile_last_claim', now.toISOString());

    this.loadGamificationData();

    this.showMessage('Daily checked in! +50 XP rewarded!');
    this.cdr.markForCheck();
  }
}
