import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardThemeService } from '../../shared/dashboard-theme';
import { DashboardBreadcrumb } from '../dashboard-breadcrumb/dashboard-breadcrumb';

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

  profileOpen = false;
  notificationOpen = false;
  quickOpen = false;
  searchFocused = false;
  searchText = '';

  quickActions = [
    { label: 'Dashboard', icon: 'bi bi-speedometer2', route: '' },
    { label: 'Courses', icon: 'bi bi-book', route: '/dashboard/student/courses' },
    { label: 'Assessments', icon: 'bi bi-clipboard-data', route: '/dashboard/student/assessments' },
    { label: 'Certificates', icon: 'bi bi-award', route: '/dashboard/student/certificates' },
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    public themeService: DashboardThemeService,
  ) {}

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

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  get searchSuggestions(): any[] {
    const role = String(this.user?.role || '').toLowerCase();

    const base = [
      { label: 'Dashboard', icon: 'bi bi-grid', route: `/dashboard/${role}` },
      { label: 'Profile', icon: 'bi bi-person-circle', route: `/dashboard/${role}/profile` },
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
    ];

    const items = role === 'trainer' ? [...base, ...trainer] : [...base, ...student];
    const term = this.searchText.trim().toLowerCase();

    if (!term) return items.slice(0, 6);

    return items
      .filter((item) => item.label.toLowerCase().includes(term) || item.route.includes(term))
      .slice(0, 8);
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
      const role = String(this.user?.role || '').toLowerCase();
      this.router.navigate([`/dashboard/${role}`]);
      return;
    }

    this.router.navigate([route]);
    this.searchText = '';
    this.searchFocused = false;
    this.quickOpen = false;
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

  goToMainPage(): void {
    const role = this.user?.role?.toLowerCase();

    if (this.isProfilePage()) {
      this.router.navigate([`/dashboard/${role}`]);
      return;
    }

    this.router.navigate([`/dashboard/${role}/profile`]);
  }

  getInitials(): string {
    const name = this.user?.name || 'User';
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
