import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { DASHBOARD_MENUS } from '../../shared/dashboard-menu.config';

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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.menuItems = DASHBOARD_MENUS[this.user?.role] || [];
  }

  get filteredMenuItems(): any[] {
    const term = this.searchText.trim().toLowerCase();

    if (!term) return this.menuItems;

    return this.menuItems.filter((item) =>
      `${item.label} ${item.route}`.toLowerCase().includes(term),
    );
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
