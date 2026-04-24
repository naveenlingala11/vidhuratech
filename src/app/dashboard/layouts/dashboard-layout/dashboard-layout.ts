import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardBreadcrumb } from '../dashboard-breadcrumb/dashboard-breadcrumb';
import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardTopbar } from '../dashboard-topbar/dashboard-topbar';



@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardSidebar,
    DashboardTopbar,
    DashboardBreadcrumb
  ],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayout {

  sidebarOpen = true;
  mobile = false;

  constructor() {
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    this.mobile = window.innerWidth < 992;

    if (this.mobile) {
      this.sidebarOpen = false;
    } else {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (this.mobile) {
      this.sidebarOpen = false;
    }
  }
}