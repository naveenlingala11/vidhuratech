import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  mobileMenuOpen = false;
  showDropdown = false;
  scrolled = false;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => window.scrollTo({ top: 0 }));
  }

  // ===== SCROLL SHADOW =====
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 20;
  }

  // ===== MOBILE MENU =====
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : 'auto';
  }

  closeMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  // ===== DROPDOWN =====
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // ===== OUTSIDE CLICK =====
  @HostListener('document:click', ['$event'])
  handleClick(event: any) {
    if (!event.target.closest('.navbar')) {
      this.closeMenu();
      this.showDropdown = false;
    }
  }

  // ===== ACTIONS =====
  openDemo() {
    const modal = document.getElementById('enrollModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goDashboard() {
    const role = this.authService.getUser()?.role;

    const routes: any = {
      STUDENT: '/dashboard/student',
      ADMIN: '/dashboard/admin',
      HR: '/dashboard/hr',
      MANAGER: '/dashboard/manager'
    };

    this.router.navigate([routes[role] || '/dashboard/student']);
  }

  goToProfile() {
    const role = this.authService.getUser()?.role?.toLowerCase();
    this.router.navigate([`/dashboard/${role}/profile`]);
  }
}