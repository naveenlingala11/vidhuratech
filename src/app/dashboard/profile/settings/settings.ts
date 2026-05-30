import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { DashboardThemeService } from '../../shared/dashboard-theme';
import { NotificationService } from '../../../services/notification.service';

interface SettingToggle {
  key: string;
  title: string;
  desc: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: any = {};
  loading = true;
  saving = false;
  securitySaving = false;
  currentPasswordChecking = false;
  currentPasswordValid = false;
  currentPasswordTouched = false;
  currentPasswordError = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  message = '';
  error = '';
  activeSection: 'account' | 'notifications' | 'appearance' | 'security' = 'account';

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private currentPasswordTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly notificationKey = 'vt_profile_preferences';
  private readonly settingsKey = 'vt_dashboard_settings';

  accountForm = {
    name: '',
    phone: '',
  };

  securityForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  notifications: SettingToggle[] = [
    {
      key: 'emailUpdates',
      title: 'Email Updates',
      desc: 'Course, invoice, and platform communication',
      icon: 'bi bi-envelope-check',
      enabled: true,
    },
    {
      key: 'careerAlerts',
      title: 'Career Alerts',
      desc: 'Jobs, drives, hiring updates, and placement reminders',
      icon: 'bi bi-briefcase',
      enabled: true,
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      desc: 'Account activity and important login notifications',
      icon: 'bi bi-shield-lock',
      enabled: true,
    },
    {
      key: 'learningNudges',
      title: 'Learning Nudges',
      desc: 'Batch, assessment, and assignment reminders',
      icon: 'bi bi-lightning-charge',
      enabled: true,
    },
  ];

  workspaceSettings: SettingToggle[] = [
    {
      key: 'compactCards',
      title: 'Compact Cards',
      desc: 'Use tighter dashboard spacing for dense work',
      icon: 'bi bi-layout-three-columns',
      enabled: false,
    },
    {
      key: 'smartSearch',
      title: 'Smart Search',
      desc: 'Prioritize role-specific pages in dashboard search',
      icon: 'bi bi-search',
      enabled: true,
    },
    {
      key: 'rememberSidebar',
      title: 'Remember Sidebar',
      desc: 'Keep navigation behavior consistent on this browser',
      icon: 'bi bi-sidebar',
      enabled: true,
    },
  ];

  sections = [
    { id: 'account', label: 'Account', icon: 'bi bi-person-circle' },
    { id: 'notifications', label: 'Notifications', icon: 'bi bi-bell' },
    { id: 'appearance', label: 'Appearance', icon: 'bi bi-palette' },
    { id: 'security', label: 'Security', icon: 'bi bi-shield-check' },
  ] as const;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: DashboardThemeService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.restoreLocalSettings();
    this.loadNotificationPreferences();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    if (this.currentPasswordTimer) {
      clearTimeout(this.currentPasswordTimer);
    }
  }

  loadProfile(): void {
    this.loading = true;

    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getProfile().subscribe({
      next: (user) => {
        this.setUser(user);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.setUser(this.authService.getUser());
        this.loading = false;
        this.showError('Live settings sync is unavailable. Showing saved account data.');
        this.cdr.detectChanges();
      },
    });
  }

  setSection(section: 'account' | 'notifications' | 'appearance' | 'security'): void {
    this.activeSection = section;
  }

  saveAccount(): void {
    if (!this.accountForm.name.trim()) {
      this.showError('Name is required');
      return;
    }

    this.saving = true;

    this.authService
      .updateProfile({
        name: this.accountForm.name.trim(),
        phone: this.accountForm.phone.trim(),
      })
      .subscribe({
        next: (user) => {
          this.setUser(user);
          this.saving = false;
          this.showMessage('Account settings updated');
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.showError('Account update failed');
          this.cdr.markForCheck();
        },
      });
  }

  resetAccount(): void {
    this.accountForm.name = this.user?.name || '';
    this.accountForm.phone = this.user?.phone || '';
  }

  toggleNotification(item: SettingToggle): void {
    item.enabled = !item.enabled;
    this.saveNotifications();
    this.syncNotificationPreferences();
  }

  setNotification(item: SettingToggle, enabled: boolean): void {
    item.enabled = enabled;
    this.saveNotifications();
    this.syncNotificationPreferences();
  }

  toggleWorkspace(item: SettingToggle): void {
    item.enabled = !item.enabled;
    this.saveWorkspaceSettings();
    this.showMessage('Workspace preference saved');
  }

  setWorkspace(item: SettingToggle, enabled: boolean): void {
    item.enabled = enabled;
    this.saveWorkspaceSettings();
    this.showMessage('Workspace preference saved');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.showMessage(`${this.themeService.isDark() ? 'Dark' : 'Light'} theme enabled`);
  }

  onCurrentPasswordInput(): void {
    this.currentPasswordTouched = true;
    this.currentPasswordValid = false;
    this.currentPasswordError = '';

    if (this.currentPasswordTimer) {
      clearTimeout(this.currentPasswordTimer);
    }

    const password = this.securityForm.currentPassword.trim();

    if (!password) {
      this.currentPasswordChecking = false;
      return;
    }

    if (password.length < 6) {
      this.currentPasswordChecking = false;
      this.currentPasswordError = 'Current password must be at least 6 characters';
      return;
    }

    this.currentPasswordChecking = true;

    this.currentPasswordTimer = setTimeout(() => {
      this.verifyCurrentPassword();
    }, 600);
  }

  verifyCurrentPassword(): void {
    const currentPassword = this.securityForm.currentPassword.trim();

    if (!currentPassword || currentPassword.length < 6) {
      this.currentPasswordChecking = false;
      return;
    }

    this.authService.verifyPassword({ currentPassword }).subscribe({
      next: () => {
        this.currentPasswordChecking = false;
        this.currentPasswordValid = true;
        this.currentPasswordError = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.currentPasswordChecking = false;
        this.currentPasswordValid = false;
        this.currentPasswordError = err?.error?.message || 'Current password is incorrect';
        this.cdr.markForCheck();
      },
    });
  }

  saveSecurity(): void {
    if (this.securitySaving) return;

    if (!this.securityForm.currentPassword || !this.securityForm.newPassword) {
      this.showError('Enter current and new password');
      return;
    }

    if (this.securityForm.newPassword.length < 6) {
      this.showError('New password must be at least 6 characters');
      return;
    }

    if (this.securityForm.newPassword !== this.securityForm.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (!this.currentPasswordValid) {
      this.showError('Please enter the correct current password');
      return;
    }

    this.securitySaving = true;

    this.authService
      .changePassword({
        currentPassword: this.securityForm.currentPassword,
        newPassword: this.securityForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.securityForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          this.currentPasswordValid = false;
          this.currentPasswordTouched = false;
          this.currentPasswordError = '';
          this.securitySaving = false;
          this.showMessage('Password changed successfully');
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.securitySaving = false;
          this.showError(err?.error?.message || 'Password change failed');
          this.cdr.markForCheck();
        },
      });
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get newPasswordRules(): { label: string; ok: boolean }[] {
    const password = this.securityForm.newPassword || '';

    return [
      { label: 'Minimum 6 characters', ok: password.length >= 6 },
      { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
      { label: 'One number', ok: /[0-9]/.test(password) },
      { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
      {
        label: 'Different from current password',
        ok: !!password && password !== this.securityForm.currentPassword,
      },
    ];
  }

  get newPasswordStrength(): number {
    return this.newPasswordRules.filter((rule) => rule.ok).length;
  }

  get newPasswordStrengthText(): string {
    if (!this.securityForm.newPassword) return '';
    if (this.newPasswordStrength <= 2) return 'Weak';
    if (this.newPasswordStrength === 3) return 'Good';
    return 'Strong';
  }

  get newPasswordStrengthClass(): string {
    return this.newPasswordStrengthText.toLowerCase();
  }

  get confirmPasswordValid(): boolean {
    return (
      !!this.securityForm.confirmPassword &&
      this.securityForm.newPassword === this.securityForm.confirmPassword
    );
  }

  get confirmPasswordInvalid(): boolean {
    return (
      !!this.securityForm.confirmPassword &&
      this.securityForm.newPassword !== this.securityForm.confirmPassword
    );
  }

  get canChangePassword(): boolean {
    return (
      this.currentPasswordValid &&
      this.securityForm.newPassword.length >= 6 &&
      this.securityForm.newPassword !== this.securityForm.currentPassword &&
      this.confirmPasswordValid &&
      !this.securitySaving
    );
  }

  goToProfile(): void {
    this.router.navigate([`/dashboard/${this.rolePath}/profile`]);
  }

  get initials(): string {
    const name = this.user?.name || this.user?.email || 'User';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return String(name).slice(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    return String(this.user?.role || 'USER').replace(/_/g, ' ');
  }

  get rolePath(): string {
    return String(this.user?.role || 'USER')
      .toLowerCase()
      .replace(/_/g, '-');
  }

  get accountStatus(): string {
    return this.user?.active === false ? 'Inactive' : 'Active';
  }

  get enabledNotifications(): number {
    return this.notifications.filter((item) => item.enabled).length;
  }

  private setUser(user: any): void {
    this.user = user || {};
    this.accountForm.name = this.user?.name || '';
    this.accountForm.phone = this.user?.phone || '';
  }

  private restoreLocalSettings(): void {
    try {
      const savedNotifications = JSON.parse(localStorage.getItem(this.notificationKey) || '{}');
      const savedWorkspace = JSON.parse(localStorage.getItem(this.settingsKey) || '{}');

      this.notifications = this.notifications.map((item) => ({
        ...item,
        enabled:
          typeof savedNotifications[item.key] === 'boolean'
            ? savedNotifications[item.key]
            : item.enabled,
      }));

      this.workspaceSettings = this.workspaceSettings.map((item) => ({
        ...item,
        enabled:
          typeof savedWorkspace[item.key] === 'boolean' ? savedWorkspace[item.key] : item.enabled,
      }));
    } catch {
      this.saveNotifications();
      this.saveWorkspaceSettings();
    }
  }

  private saveNotifications(): void {
    localStorage.setItem(
      this.notificationKey,
      JSON.stringify(this.toLocalPayload(this.notifications)),
    );
  }

  private loadNotificationPreferences(): void {
    this.notificationService.getPreferences().subscribe({
      next: (res: any) => {
        const enabled = res?.data?.notificationsEnabled !== false;
        if (!enabled) {
          this.setAllNotificationToggles(false);
        }
        this.saveNotifications();
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }

  private syncNotificationPreferences(): void {
    const enabled = this.enabledNotifications > 0;

    this.notificationService.updatePreferences(enabled).subscribe({
      next: (res: any) => {
        const savedEnabled = res?.data?.notificationsEnabled !== false;
        if (!savedEnabled) {
          this.setAllNotificationToggles(false);
        }
        this.saveNotifications();
        this.showMessage(savedEnabled ? 'Notifications turned on' : 'Notifications turned off');
      },
      error: () => {
        this.showError('Notification preference sync failed');
        this.loadNotificationPreferences();
      },
    });
  }

  private setAllNotificationToggles(enabled: boolean): void {
    this.notifications = this.notifications.map((item) => ({
      ...item,
      enabled,
    }));
  }

  private saveWorkspaceSettings(): void {
    localStorage.setItem(
      this.settingsKey,
      JSON.stringify(this.toLocalPayload(this.workspaceSettings)),
    );
  }

  private toLocalPayload(items: SettingToggle[]): Record<string, boolean> {
    return items.reduce((acc, item) => ({ ...acc, [item.key]: item.enabled }), {});
  }

  private showMessage(text: string): void {
    this.setToast('success', text);
  }

  private showError(text: string): void {
    this.setToast('error', text);
  }

  private setToast(type: 'success' | 'error', text: string): void {
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
}
