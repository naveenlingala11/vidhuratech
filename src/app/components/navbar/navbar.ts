import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserPlanBadgeService } from '../../services/user-plan-badge.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnDestroy {
  mobileMenuOpen = false;
  showDropdown = false;
  scrolled = false;
  private navSub: Subscription;
  profileImageFailed = false;
  constructor(
    private router: Router,
    public authService: AuthService,
    public userPlanBadgeService: UserPlanBadgeService,
  ) {
    this.userPlanBadgeService.load();
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
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
      this.showCodingMenu = false;
      this.showMentorsMenu = false;
      this.showDropdown = false;
      this.closeMenu();
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
      MENTOR: '/dashboard/mentor',
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
  get user(): any {
    return this.authService.getUser() || {};
  }
  get profileImageUrl(): string {
    const url = String(this.user?.profileImageUrl || '').trim();
    if (!url || this.profileImageFailed) {
      return '';
    }
    return url.startsWith('https://') ? url : '';
  }
  getInitials(): string {
    const name = this.user?.name || this.user?.email || 'User';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  onProfileImageError(): void {
    this.profileImageFailed = true;
  }
  showCodingMenu = false;
  showMentorsMenu = false;
  currentPlan = 'FREE';
  toggleCodingMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showCodingMenu = !this.showCodingMenu;
  }
  openCodingMenu() {
    if (window.innerWidth > 991) {
      this.showCodingMenu = true;
    }
  }
  closeCodingMenu() {
    if (window.innerWidth > 991) {
      this.showCodingMenu = false;
    }
  }
  toggleMentorsMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showMentorsMenu = !this.showMentorsMenu;
  }
  openMentorsMenu() {
    if (window.innerWidth > 991) {
      this.showMentorsMenu = true;
    }
  }
  closeMentorsMenu() {
    if (window.innerWidth > 991) {
      this.showMentorsMenu = false;
    }
  }
  closeAllMenus() {
    this.showCodingMenu = false;
    this.showMentorsMenu = false;
    this.showDropdown = false;
    this.closeMenu();
  }
  isProOrElite(): boolean {
    const plan = this.currentPlan;
    return plan === 'PRO' || plan === 'ELITE';
  }
  isElite(): boolean {
    return this.currentPlan === 'ELITE';
  }
}
