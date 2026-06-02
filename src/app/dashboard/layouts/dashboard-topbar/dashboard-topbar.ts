import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardThemeService } from '../../shared/dashboard-theme';
import { DashboardBreadcrumb } from '../dashboard-breadcrumb/dashboard-breadcrumb';
import { UserPlanBadgeService } from '../../../services/user-plan-badge.service';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardBreadcrumb],
  templateUrl: './dashboard-topbar.html',
  styleUrls: ['./dashboard-topbar.css'],
})
export class DashboardTopbar {
  @Output() menuToggle = new EventEmitter<void>();
  @Input() notifications: any[] = [];
  @Input() notificationsEnabled = true;
  @Output() markNotificationRead = new EventEmitter<number>();

  profileOpen = false;
  notificationOpen = false;
  quickOpen = false;
  searchFocused = false;
  searchText = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    public themeService: DashboardThemeService,
    public userPlanBadgeService: UserPlanBadgeService,
  ) {
    this.userPlanBadgeService.load();
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.profileOpen = false;
    this.notificationOpen = false;
    this.quickOpen = false;
    this.searchFocused = false;
  }

  get user(): any {
    return this.authService.getUser() || {};
  }

  get roleLabel(): string {
    return String(this.user?.role || 'Member').replace(/_/g, ' ');
  }

  get rolePath(): string {
    return String(this.user?.role || 'student')
      .toLowerCase()
      .replace(/_/g, '-');
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  get searchSuggestions(): any[] {
    const role = this.rolePath;

    const base = [
      { label: 'Dashboard', icon: 'bi bi-grid', route: `/dashboard/${role}` },
      { label: 'Profile', icon: 'bi bi-person-circle', route: `/dashboard/${role}/profile` },
      { label: 'Settings', icon: 'bi bi-gear', route: `/dashboard/${role}/settings` },
      { label: 'Notifications', icon: 'bi bi-bell', route: `/dashboard/${role}/notifications` },
    ];

    const student = [
      { label: 'My Courses', icon: 'bi bi-book', route: '/dashboard/student/courses' },
      { label: 'LMS Player', icon: 'bi bi-play-circle', route: '/dashboard/student/lms' },
      {
        label: 'Assessments',
        icon: 'bi bi-clipboard-data',
        route: '/dashboard/student/assessments',
      },
      {
        label: 'Pseudo Challenges',
        icon: 'bi bi-code-square',
        route: '/dashboard/student/pseudo-challenges',
      },
      {
        label: 'Mock Interviews',
        icon: 'bi bi-camera-video',
        route: '/dashboard/student/mock-interviews',
      },
      { label: 'Certificates', icon: 'bi bi-award', route: '/dashboard/student/certificates' },
    ];

    const trainer = [
      { label: 'My Batches', icon: 'bi bi-people', route: '/dashboard/trainer/batches' },
      { label: 'Students', icon: 'bi bi-person-lines-fill', route: '/dashboard/trainer/students' },
      {
        label: 'Create Assessment',
        icon: 'bi bi-plus-circle',
        route: '/dashboard/trainer/create-assessment',
      },
      {
        label: 'Assessments',
        icon: 'bi bi-clipboard-data',
        route: '/dashboard/trainer/assessments',
      },
      {
        label: 'Pseudo Challenges',
        icon: 'bi bi-code-square',
        route: '/dashboard/trainer/pseudo-challenges',
      },
      { label: 'Content', icon: 'bi bi-folder2-open', route: '/dashboard/trainer/content' },
      {
        label: 'LMS Courses',
        icon: 'bi bi-journal-bookmark-fill',
        route: '/dashboard/lms/courses',
      },
      { label: 'Course Manager', icon: 'bi bi-kanban', route: '/dashboard/lms/courses-manager' },
    ];

    const admin = [
      { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/admin/users' },
      { label: 'Create User', icon: 'bi bi-person-plus', route: '/dashboard/admin/create-user' },
      { label: 'Admissions', icon: 'bi bi-mortarboard', route: '/dashboard/admin/admissions' },
      { label: 'Batches', icon: 'bi bi-collection', route: '/dashboard/admin/batches' },
      {
        label: 'LMS Courses',
        icon: 'bi bi-journal-bookmark-fill',
        route: '/dashboard/lms/courses',
      },
      { label: 'Course Manager', icon: 'bi bi-kanban', route: '/dashboard/lms/courses-manager' },
      { label: 'Create Course', icon: 'bi bi-plus-square', route: '/dashboard/lms/courses/create' },
    ];

    const mentor = [
      { label: 'Mentees', icon: 'bi bi-people', route: '/dashboard/mentor/mentees' },
      { label: 'Sessions', icon: 'bi bi-calendar-event', route: '/dashboard/mentor/sessions' },
      {
        label: 'LMS Courses',
        icon: 'bi bi-journal-bookmark-fill',
        route: '/dashboard/lms/courses',
      },
      { label: 'Course Manager', icon: 'bi bi-kanban', route: '/dashboard/lms/courses-manager' },
    ];

    const superAdmin = [
      { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/super-admin/users' },
      { label: 'Admissions', icon: 'bi bi-mortarboard', route: '/dashboard/admin/admissions' },
      { label: 'Batches', icon: 'bi bi-collection', route: '/dashboard/admin/batches' },
      {
        label: 'LMS Courses',
        icon: 'bi bi-journal-bookmark-fill',
        route: '/dashboard/lms/courses',
      },
      { label: 'Course Manager', icon: 'bi bi-kanban', route: '/dashboard/lms/courses-manager' },
      { label: 'Create Course', icon: 'bi bi-plus-square', route: '/dashboard/lms/courses/create' },
    ];

    const roleItems: Record<string, any[]> = {
      student,
      trainer,
      admin,
      hr: admin,
      manager: [],
      mentor,
      'super-admin': superAdmin,
    };

    const items = [...base, ...(roleItems[role] || student)];
    const term = this.searchText.trim().toLowerCase();

    if (!term) return items.slice(0, 8);

    return items
      .filter((item) => item.label.toLowerCase().includes(term) || item.route.includes(term))
      .slice(0, 10);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
    this.notificationOpen = false;
    this.quickOpen = false;
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationOpen = !this.notificationOpen;
    this.profileOpen = false;
    this.quickOpen = false;
  }

  toggleQuick(event: MouseEvent): void {
    event.stopPropagation();
    this.quickOpen = !this.quickOpen;
    this.profileOpen = false;
    this.notificationOpen = false;
  }

  focusSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchFocused = true;
    this.profileOpen = false;
    this.notificationOpen = false;
    this.quickOpen = false;
  }

  goTo(route: string): void {
    if (!route) {
      this.router.navigate([`/dashboard/${this.rolePath}`]);
      return;
    }

    this.router.navigate([route]);
    this.searchText = '';
    this.searchFocused = false;
    this.quickOpen = false;
    this.profileOpen = false;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isProfilePage(): boolean {
    return this.router.url.includes('/profile');
  }

  isSettingsPage(): boolean {
    return this.router.url.includes('/settings');
  }

  goToMainPage(): void {
    if (this.isProfilePage()) {
      this.router.navigate([`/dashboard/${this.rolePath}`]);
      return;
    }

    this.router.navigate([`/dashboard/${this.rolePath}/profile`]);
    this.profileOpen = false;
  }

  goToSettings(): void {
    this.router.navigate([`/dashboard/${this.rolePath}/settings`]);
    this.profileOpen = false;
  }

  goToNotifications(): void {
    this.router.navigate([`/dashboard/${this.rolePath}/notifications`]);
    this.notificationOpen = false;
  }

  getInitials(): string {
    const name = this.user?.name || this.user?.email || 'User';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  get unreadNotifications(): any[] {
    return this.notifications.filter((n) => !n.read);
  }

  openNotification(n: any): void {
    if (!n) return;

    if (!n.read && n.id) {
      this.markNotificationRead.emit(n.id);
    }

    if (n.link) {
      this.router.navigate([n.link]);
    }

    this.notificationOpen = false;
  }
}
