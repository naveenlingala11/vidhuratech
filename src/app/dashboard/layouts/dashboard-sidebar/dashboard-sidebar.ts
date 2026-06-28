import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { DASHBOARD_MENUS } from '../../shared/dashboard-menu.config';
import { UserPlanBadgeService } from '../../../services/user-plan-badge.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrls: ['./dashboard-sidebar.css'],
})
export class DashboardSidebar implements OnInit {
  @Input() collapsed = false;
  @Input() mobile = false;
  @Output() menuToggle = new EventEmitter<void>();

  user: any = {};
  menuItems: any[] = [];
  searchText = '';
  currentYear = new Date().getFullYear();
  profileImageFailed = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public userPlanBadgeService: UserPlanBadgeService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.menuItems = DASHBOARD_MENUS[this.user?.role] || [];
    this.userPlanBadgeService.load();
  }

  get profileImageUrl(): string {
    const url = String(this.user?.profileImageUrl || '').trim();

    if (!url || this.profileImageFailed) {
      return '';
    }

    return url.startsWith('https://') ? url : '';
  }

  onProfileImageError(): void {
    this.profileImageFailed = true;
  }

  get filteredMenuItems(): any[] {
    const currentUrl = this.router.url.split('?')[0];

    const dashboardItem = this.menuItems.find(item => item.label === 'Dashboard');
    const profileItem = this.menuItems.find(item => item.label === 'Profile');

    const isDashboardPage = dashboardItem && currentUrl === dashboardItem.route;
    const isProfilePage = profileItem && currentUrl === profileItem.route;

    const headerItems: any[] = [];
    if (dashboardItem && !isDashboardPage) {
      headerItems.push(dashboardItem);
    }
    if (profileItem && !isProfilePage) {
      headerItems.push(profileItem);
    }

    const otherItems = this.menuItems.filter(
      item => item.label !== 'Dashboard' && item.label !== 'Profile'
    );
    otherItems.sort((a, b) => a.label.localeCompare(b.label));

    const allItems = [...headerItems, ...otherItems];
    const term = this.searchText.trim().toLowerCase();

    if (!term) return allItems;

    return allItems.filter((item) =>
      `${item.label} ${item.route}`.toLowerCase().includes(term)
    );
  }

  get groupedMenuItems(): { name: string; items: any[] }[] {
    const items = this.filteredMenuItems;
    const sections: Record<string, any[]> = {
      'Main Menu': [],
      'Learning Hub': [],
      'Career Tools': [],
      'Account Settings': [],
    };

    items.forEach(item => {
      const label = item.label.toLowerCase();
      if (label === 'dashboard' || label === 'profile') {
        sections['Main Menu'].push(item);
      } else if (
        label.includes('course') || 
        label.includes('lms') || 
        label.includes('session') || 
        label.includes('assignment') || 
        label.includes('assessment') || 
        label.includes('challenge') || 
        label.includes('practice') || 
        label.includes('material') || 
        label.includes('note') ||
        label.includes('question') ||
        label.includes('mentor') ||
        label.includes('student') ||
        label.includes('batch') ||
        label.includes('content')
      ) {
        sections['Learning Hub'].push(item);
      } else if (
        label.includes('job') || 
        label.includes('company') || 
        label.includes('placement') || 
        label.includes('resume') || 
        label.includes('project') || 
        label.includes('leaderboard') ||
        label.includes('certificate') ||
        label.includes('analytics') ||
        label.includes('invoice') ||
        label.includes('candidate') ||
        label.includes('hiring') ||
        label.includes('team') ||
        label.includes('lead') ||
        label.includes('bin') ||
        label.includes('action') ||
        label.includes('user') ||
        label.includes('guide')
      ) {
        sections['Career Tools'].push(item);
      } else {
        sections['Account Settings'].push(item);
      }
    });

    return Object.keys(sections)
      .map(key => ({ name: key, items: sections[key] }))
      .filter(sec => sec.items.length > 0);
  }

  get userInitials(): string {
    const name = String(this.user?.name || this.user?.fullName || this.user?.email || 'User');
    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    return String(this.user?.role || 'Dashboard').replace(/_/g, ' ');
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  navigateTo(item: any): void {
    if (!item?.route) return;

    const [path, query] = String(item.route).split('?');

    if (query) {
      this.router.navigate([path], {
        queryParams: Object.fromEntries(new URLSearchParams(query)),
      });
      return;
    }

    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    const path = String(route || '').split('?')[0];
    return !!path && this.router.url.startsWith(path);
  }

  clearSearch(): void {
    this.searchText = '';
  }

  logout(): void {
    this.authService.logout?.();
    this.router.navigate(['/login']);
  }
}
