import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardTopbar } from '../dashboard-topbar/dashboard-topbar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardSidebar, DashboardTopbar],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
})
export class DashboardLayout {
  sidebarOpen = true;
  mobile = false;

  constructor(private router: Router) {
    this.checkScreen();
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

  isFullscreenPage(): boolean {
    return (
      this.router.url.includes('/student/pseudocode') ||
      this.router.url.includes('/student/compiler') ||
      this.router.url.includes('/student/coding')
    );
  }
}
