import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = {};
  loading = true;
  editMode = false;
  saving = false;
  message = '';
  error = '';
  private toastTimer: any;

  form = {
    name: '',
    phone: ''
  };

  preferences = [
    { title: 'Email Updates', desc: 'Receive course and platform updates', enabled: true },
    { title: 'Career Alerts', desc: 'Get placement and job notifications', enabled: true },
    { title: 'Security Alerts', desc: 'Notify me about account activity', enabled: true }
  ];

  activities = [
    'Profile details reviewed',
    'Account security verified',
    'Dashboard access enabled',
    'Role permissions synchronized'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    clearTimeout(this.toastTimer);
  }

  loadProfile() {
    this.loading = true;
    this.error = '';

    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.showError('Please login to view your profile.');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        this.setUser(res);
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err: any) => {
        const cachedUser = this.authService.getUser();

        if (cachedUser) {
          this.setUser(cachedUser);
        }

        this.loading = false;

        if (err?.status === 401) {
          this.authService.logout();
          this.showError('Session expired. Please login again.');
          setTimeout(() => this.router.navigate(['/login']), 700);
        } else if (err?.status === 403) {
          this.showError('Profile access blocked by server. Please check backend security config.');
        } else {
          this.showError('Profile load failed. Please try again.');
        }

        this.cdr.detectChanges();
      }
    });
  }

  private setUser(user: any) {
    this.user = user || {};
    this.form.name = this.user.name || '';
    this.form.phone = this.user.phone || '';
  }

  getInitials(): string {
    const name = this.user?.name || 'User';
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : 'U';
  }

  get roleLabel(): string {
    return (this.user?.role || 'USER').replace('_', ' ');
  }

  get accountStatus(): string {
    return this.user?.active === false ? 'Inactive' : 'Active';
  }

  get profileCompletion(): number {
    let score = 0;
    if (this.user?.name) score += 25;
    if (this.user?.email) score += 25;
    if (this.user?.phone) score += 25;
    if (this.user?.role) score += 25;
    return score;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.form.name = this.user?.name || '';
    this.form.phone = this.user?.phone || '';
  }

  saveProfile() {
    if (!this.form.name.trim()) {
      this.showError('Name is required');
      return;
    }

    this.saving = true;

    this.authService.updateProfile({
      name: this.form.name.trim(),
      phone: this.form.phone.trim()
    }).subscribe({
      next: (res) => {
        this.setUser(res);
        this.editMode = false;
        this.saving = false;
        this.showMessage('Profile updated successfully');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.showError('Profile update failed');
        this.cdr.markForCheck();
      }
    });
  }

  cancelEdit() {
    this.form.name = this.user?.name || '';
    this.form.phone = this.user?.phone || '';
    this.editMode = false;
  }

  copyEmail() {
    if (!this.user?.email) {
      this.showError('Email not available');
      return;
    }

    navigator.clipboard?.writeText(this.user.email);
    this.showMessage('Email copied');
  }

  showMessage(text: string) {
    this.setToast('success', text);
  }

  showError(text: string) {
    this.setToast('error', text);
  }

  private setToast(type: 'success' | 'error', text: string) {
    clearTimeout(this.toastTimer);

    setTimeout(() => {
      this.message = type === 'success' ? text : '';
      this.error = type === 'error' ? text : '';

      this.toastTimer = setTimeout(() => {
        this.message = '';
        this.error = '';
        this.cdr.markForCheck();
      }, 3000);

      this.cdr.markForCheck();
    }, 0);
  }

  get roleActions() {
    const actions: any = {
      STUDENT: [
        { code: 'CR', title: 'Certificates', desc: 'View course certificates' },
        { code: 'LM', title: 'My Learning', desc: 'Continue enrolled courses' }
      ],
      ADMIN: [
        { code: 'US', title: 'Users', desc: 'Manage platform users' },
        { code: 'AN', title: 'Analytics', desc: 'Track performance' }
      ],
      SUPER_ADMIN: [
        { code: 'UC', title: 'User Control', desc: 'Manage all accounts' },
        { code: 'AU', title: 'Audit', desc: 'Review system actions' }
      ]
    };

    return actions[this.user?.role] || [
      { code: 'DB', title: 'Dashboard', desc: 'Open workspace' },
      { code: 'SP', title: 'Support', desc: 'Contact support' }
    ];
  }
}
