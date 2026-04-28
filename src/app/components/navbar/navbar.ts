import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnDestroy {
  mobileMenuOpen = false;
  showDropdown = false;
  scrolled = false;

  private navSub: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    this.navSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.closeMenu();
        this.showDropdown = false;
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    document.body.style.overflow = 'auto';
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 20;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 991 && this.mobileMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : 'auto';
  }

  closeMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  toggleDropdown(event?: Event) {
    event?.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar')) {
      this.closeMenu();
      this.showDropdown = false;
    }
  }

  openDemo() {
    const modal = document.getElementById('enrollModal');
    if (modal && (window as any).bootstrap) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  logout() {
    this.authService.logout();
    this.showDropdown = false;
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  goDashboard() {
    const rawRole = this.authService.getUser()?.role || '';
    const role = String(rawRole).replace('ROLE_', '').toUpperCase();

    const routes: Record<string, string> = {
      STUDENT: '/dashboard/student',
      ADMIN: '/dashboard/admin',
      SUPER_ADMIN: '/dashboard/super-admin',
      HR: '/dashboard/hr',
      MANAGER: '/dashboard/manager',
      TRAINER: '/dashboard/trainer',
      MENTOR: '/dashboard/mentor'
    };

    this.showDropdown = false;
    this.closeMenu();
    this.router.navigate([routes[role] || '/dashboard/student']);
  }

  goToProfile() {
    const rawRole = this.authService.getUser()?.role || 'STUDENT';
    const role = String(rawRole).replace('ROLE_', '').toLowerCase();

    this.showDropdown = false;
    this.closeMenu();
    this.router.navigate([`/dashboard/${role}/profile`]);
  }
}
