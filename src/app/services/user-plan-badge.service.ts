import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../features/auth/services/auth.service';

export type UserPlanTier = 'FREE' | 'BASIC' | 'PRO' | 'ELITE';

export interface UserPlanBadge {
  tier: UserPlanTier;
  label: string;
  className: string;
  icon: string;
  helper: string;
  active: boolean;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserPlanBadgeService {
  private readonly api = `${environment.apiUrl}/api/public/plans/my-access`;

  private readonly blockedPlanBadgeRoles = new Set([
    'ADMIN',
    'SUPER_ADMIN',
    'HR',
    'MANAGER',
    'TRAINER',
  ]);

  private readonly fallback: UserPlanBadge = {
    tier: 'FREE',
    label: 'Free',
    className: 'plan-free',
    icon: 'fa-solid fa-crown',
    helper:
      'Free access will expire soon. Upgrade for mock tests, coding challenges, and premium learning.',
    active: false,
  };

  badge$ = new BehaviorSubject<UserPlanBadge | null>(this.fallback);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  load(): void {
    const user = this.authService.getUser();

    if (!this.canShowPlanBadge(user)) {
      this.badge$.next(null);
      return;
    }

    // Check gamified override first
    try {
      const override = localStorage.getItem('vt_user_plan_override');
      if (override === 'elite') {
        this.badge$.next({
          tier: 'ELITE',
          label: 'Elite Pro',
          className: 'plan-elite',
          icon: 'bi bi-crown-fill',
          helper: 'Premium Elite active account. Unlocked via Rewards Shop!',
          active: true
        });
        return;
      }
    } catch {}

    this.http.get<any>(this.api).subscribe({
      next: (res) => this.badge$.next(this.mapAccess(res?.data)),
      error: () => this.badge$.next(this.fallback),
    });
  }

  private canShowPlanBadge(user: any): boolean {
    const role = String(user?.role || '')
      .trim()
      .toUpperCase();

    return !this.blockedPlanBadgeRoles.has(role);
  }

  private mapAccess(data: any): UserPlanBadge {
    if (!data?.active || !Array.isArray(data?.plans) || !data.plans.length) {
      return this.fallback;
    }

    const codes = data.plans
      .map((p: any) => String(p.planCode || '').toUpperCase())
      .filter(Boolean);

    const tier = this.resolveTier(codes);
    const latest = data.plans[0];

    return {
      tier,
      label: this.label(tier),
      className: this.className(tier),
      icon: this.icon(tier),
      helper: this.helper(tier, latest?.expiresAt),
      active: true,
      expiresAt: latest?.expiresAt,
    };
  }

  private resolveTier(codes: string[]): UserPlanTier {
    if (codes.some((c) => c.includes('ELITE'))) return 'ELITE';
    if (codes.some((c) => c.includes('PRO'))) return 'PRO';
    if (codes.some((c) => c.includes('STARTER') || c.includes('BASIC'))) return 'BASIC';
    return 'FREE';
  }

  private icon(tier: UserPlanTier): string {
    return {
      FREE: 'fa-regular fa-chess-king',
      BASIC: 'fa-solid fa-crown',
      PRO: 'fa-solid fa-gem',
      ELITE: 'fa-solid fa-trophy',
    }[tier];
  }

  private helper(tier: UserPlanTier, expiresAt?: string): string {
    if (tier === 'FREE') {
      return 'Free access will expire soon. Upgrade for mock tests, coding challenges, and premium learning.';
    }

    const expiry = this.formatDate(expiresAt);
    return expiry ? `Plan expires on ${expiry}` : 'Premium plan is active.';
  }

  private formatDate(value?: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private label(tier: UserPlanTier): string {
    return {
      FREE: 'Free',
      BASIC: 'Basic',
      PRO: 'Pro User',
      ELITE: 'Elite Gold',
    }[tier];
  }

  private className(tier: UserPlanTier): string {
    return {
      FREE: 'plan-free',
      BASIC: 'plan-basic',
      PRO: 'plan-pro',
      ELITE: 'plan-elite',
    }[tier];
  }
}
