import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardTopbar } from '../dashboard-topbar/dashboard-topbar';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardSidebar, DashboardTopbar],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
})
export class DashboardLayout implements OnInit, OnDestroy {
  sidebarOpen = true;
  mobile = false;

  notifications: any[] = [];
  private notificationSub?: Subscription;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.checkScreen();
  }

  ngOnInit(): void {
    this.loadNotifications();

    this.notificationSub = interval(60000).subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }

  @HostListener('window:resize')
  checkScreen(): void {
    this.mobile = window.innerWidth < 992;
    this.sidebarOpen = !this.mobile;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    if (this.mobile) {
      this.sidebarOpen = false;
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (res: any) => {
        this.notifications = res?.data || [];
      },
      error: (err) => {
        console.warn('Notifications unavailable:', err?.message || err);
        this.notifications = [];
      },
    });
  }

  markNotificationRead(id: number): void {
    if (!id) return;

    this.notificationService.markRead(id).subscribe({
      next: () => this.loadNotifications(),
      error: () => this.loadNotifications(),
    });
  }

  isFullscreenPage(): boolean {
    return (
      this.router.url.includes('/student/pseudocode') ||
      this.router.url.includes('/student/compiler') ||
      this.router.url.includes('/student/coding')
    );
  }
}
