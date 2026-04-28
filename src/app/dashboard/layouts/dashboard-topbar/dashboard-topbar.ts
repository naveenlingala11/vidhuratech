import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardThemeService } from '../../shared/dashboard-theme';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-topbar.html',
  styleUrls: ['./dashboard-topbar.css']
})
export class DashboardTopbar {

  @Output() menuToggle = new EventEmitter<void>();

  profileOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    public themeService: DashboardThemeService
  ) { }

  @HostListener('document:click')
  closeProfile() {
    this.profileOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    const role = this.authService.getUser()?.role?.toLowerCase();
    this.router.navigate([`/dashboard/${role}/profile`]);
  }

  getInitials(): string {
    const name = this.authService.getUser()?.name || 'User';
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
