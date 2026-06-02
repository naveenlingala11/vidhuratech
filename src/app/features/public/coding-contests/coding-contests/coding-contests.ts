import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicPracticeService } from '../../../services/public-practice.service';

type Period = 'daily' | 'weekly' | 'monthly';
type LeaderboardScope = 'period' | 'challenge';
type PracticeType = 'ASSESSMENT' | 'CHALLENGE';

interface PracticeGrant {
  accessToken: string;
  practiceType: PracticeType;
  practiceId: number;
  expiresAt: string;
  maxAttempts: number;
  authenticated?: boolean;
  userId?: number;
  ownerMode?: 'AUTH' | 'GUEST';
}

@Component({
  selector: 'app-coding-contests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coding-contests.html',
  styleUrls: ['./coding-contests.css'],
})
export class CodingContestsComponent implements OnInit {
  loading = false;
  leaderboardLoading = false;
  toast = '';

  challenges: any[] = [];
  announcements: any[] = [];
  companies: string[] = [];
  skills: string[] = [];

  selectedChallenge: any = null;

  search = '';
  selectedCompany = 'ALL';
  selectedSkill = 'ALL';
  selectedSort: 'latest' | 'marks' | 'duration' = 'latest';

  challengePage = 1;
  challengePageSize = 5;

  leaderboardScope: LeaderboardScope = 'period';
  leaderboardPeriod: Period = 'weekly';
  periodLeaderboard: any[] = [];
  challengeLeaderboard: any[] = [];

  leaderboardPage = 1;
  leaderboardPageSize = 10;

  dailyTopThree: any[] = [];
  weeklyTopThree: any[] = [];
  monthlyTopThree: any[] = [];

  planAccessLoading = false;

  planAccess: any = {
    loggedIn: false,
    active: false,
    accessPremiumChallenges: false,
    accessMockTests: false,
    accessCourses: false,
    accessInterviews: false,
    accessNotes: false,
    accessMaterials: false,
    accessVideos: false,
    accessLiveClasses: false,
    accessPracticeCompanies: false,
  };

  constructor(
    private publicPracticeService: PublicPracticeService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.loadContestData();
    this.loadMyPlanAccess();
  }

  get filteredChallenges(): any[] {
    const term = this.search.trim().toLowerCase();

    const list = this.challenges.filter((challenge) => {
      const text = [
        challenge.title,
        challenge.description,
        challenge.company,
        challenge.skill,
        challenge.challengeGroupTitle,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!term || text.includes(term)) &&
        (this.selectedCompany === 'ALL' || challenge.company === this.selectedCompany) &&
        (this.selectedSkill === 'ALL' || challenge.skill === this.selectedSkill)
      );
    });

    return [...list].sort((a, b) => {
      if (this.selectedSort === 'marks') {
        return Number(b.totalMarks || 0) - Number(a.totalMarks || 0);
      }

      if (this.selectedSort === 'duration') {
        return Number(a.durationMinutes || 0) - Number(b.durationMinutes || 0);
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });
  }

  get challengeTotalPages(): number {
    return Math.max(Math.ceil(this.filteredChallenges.length / this.challengePageSize), 1);
  }

  get pagedChallenges(): any[] {
    const start = (this.challengePage - 1) * this.challengePageSize;
    return this.filteredChallenges.slice(start, start + this.challengePageSize);
  }

  get activeLeaderboard(): any[] {
    return this.leaderboardScope === 'challenge'
      ? this.challengeLeaderboard
      : this.periodLeaderboard;
  }

  get leaderboardTotalPages(): number {
    return Math.max(Math.ceil(this.activeLeaderboard.length / this.leaderboardPageSize), 1);
  }

  get pagedLeaderboard(): any[] {
    const start = (this.leaderboardPage - 1) * this.leaderboardPageSize;
    return this.activeLeaderboard.slice(start, start + this.leaderboardPageSize);
  }

  get featuredTopThree(): any[] {
    if (this.leaderboardPeriod === 'daily') return this.dailyTopThree;
    if (this.leaderboardPeriod === 'monthly') return this.monthlyTopThree;
    return this.weeklyTopThree;
  }

  get totalMarksAvailable(): number {
    return this.challenges.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
  }

  get averageDuration(): number {
    if (!this.challenges.length) return 0;
    const total = this.challenges.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
    return Math.round(total / this.challenges.length);
  }

  loadContestData(): void {
    this.loading = true;

    this.publicPracticeService.getLibrary().subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.challenges = data.challenges || [];
        this.companies = Array.from(data.companies || []);
        this.skills = Array.from(data.skills || []);
        this.loading = false;

        if (this.challenges.length) {
          this.selectChallenge(this.challenges[0], false);
        }
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load coding contests');
      },
    });

    this.loadPeriodLeaderboard('weekly');
    this.preloadTopThree();
    this.loadAnnouncements();
  }

  preloadTopThree(): void {
    this.publicPracticeService.getDailyLeaderboard().subscribe({
      next: (res: any) => (this.dailyTopThree = res?.data?.topThree || []),
      error: () => (this.dailyTopThree = []),
    });

    this.publicPracticeService.getWeeklyLeaderboard().subscribe({
      next: (res: any) => (this.weeklyTopThree = res?.data?.topThree || []),
      error: () => (this.weeklyTopThree = []),
    });

    this.publicPracticeService.getMonthlyLeaderboard().subscribe({
      next: (res: any) => (this.monthlyTopThree = res?.data?.topThree || []),
      error: () => (this.monthlyTopThree = []),
    });
  }

  loadAnnouncements(): void {
    this.publicPracticeService.getContestAnnouncements().subscribe({
      next: (res: any) => (this.announcements = res?.data || []),
      error: () => (this.announcements = []),
    });
  }

  loadPeriodLeaderboard(period: Period): void {
    this.leaderboardScope = 'period';
    this.leaderboardPeriod = period;
    this.leaderboardPage = 1;
    this.leaderboardLoading = true;

    const request =
      period === 'daily'
        ? this.publicPracticeService.getDailyLeaderboard()
        : period === 'monthly'
          ? this.publicPracticeService.getMonthlyLeaderboard()
          : this.publicPracticeService.getWeeklyLeaderboard();

    request.subscribe({
      next: (res: any) => {
        this.periodLeaderboard = res?.data?.entries || [];
        const topThree = res?.data?.topThree || [];

        if (period === 'daily') this.dailyTopThree = topThree;
        if (period === 'weekly') this.weeklyTopThree = topThree;
        if (period === 'monthly') this.monthlyTopThree = topThree;

        this.leaderboardLoading = false;
      },
      error: () => {
        this.periodLeaderboard = [];
        this.leaderboardLoading = false;
      },
    });
  }

  selectChallenge(challenge: any, switchLeaderboard = true): void {
    this.selectedChallenge = challenge;
    this.challengeLeaderboard = [];
    this.leaderboardLoading = true;

    if (switchLeaderboard) {
      this.leaderboardScope = 'challenge';
      this.leaderboardPage = 1;
    }

    this.publicPracticeService.getChallengeLeaderboard(Number(challenge.id)).subscribe({
      next: (res: any) => {
        this.challengeLeaderboard = res?.data?.entries || [];
        this.leaderboardLoading = false;
      },
      error: () => {
        this.challengeLeaderboard = [];
        this.leaderboardLoading = false;
      },
    });
  }

  showPeriodLeaderboard(): void {
    this.leaderboardScope = 'period';
    this.leaderboardPage = 1;
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCompany = 'ALL';
    this.selectedSkill = 'ALL';
    this.selectedSort = 'latest';
    this.challengePage = 1;
  }

  setChallengePage(page: number): void {
    if (page < 1 || page > this.challengeTotalPages) return;
    this.challengePage = page;
  }

  setLeaderboardPage(page: number): void {
    if (page < 1 || page > this.leaderboardTotalPages) return;
    this.leaderboardPage = page;
  }

  scrollToLeaderboard(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById('contest-leaderboard')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  loadMyPlanAccess(callback?: () => void): void {
    this.planAccessLoading = true;

    this.publicPracticeService.getMyPlanAccess().subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};

        this.planAccess = {
          loggedIn: !!data.loggedIn,
          active: !!data.active,
          accessPremiumChallenges: !!data.accessPremiumChallenges,
          accessMockTests: !!data.accessMockTests,
          accessCourses: !!data.accessCourses,
          accessInterviews: !!data.accessInterviews,
          accessNotes: !!data.accessNotes,
          accessMaterials: !!data.accessMaterials,
          accessVideos: !!data.accessVideos,
          accessLiveClasses: !!data.accessLiveClasses,
          accessPracticeCompanies: !!data.accessPracticeCompanies,
        };

        this.planAccessLoading = false;
        callback?.();
      },
      error: () => {
        this.planAccess = {
          loggedIn: false,
          active: false,
          accessPremiumChallenges: false,
        };

        this.planAccessLoading = false;
        callback?.();
      },
    });
  }

  isPremiumContent(challenge: any): boolean {
    const accessLevel = String(
      challenge?.accessLevel || challenge?.publicAccessLevel || 'LEAD_REQUIRED',
    )
      .trim()
      .toUpperCase();

    return ['PAID_STUDENT_ONLY', 'PREMIUM', 'PRO_ONLY', 'ELITE_ONLY'].includes(accessLevel);
  }

  hasPremiumChallengeAccess(): boolean {
    return !!(
      this.planAccess?.loggedIn &&
      this.planAccess?.active &&
      this.planAccess?.accessPremiumChallenges
    );
  }

  isPremiumLocked(challenge: any): boolean {
    return this.isPremiumContent(challenge) && !this.hasPremiumChallengeAccess();
  }

  accessLabel(challenge: any): string {
    if (!this.isPremiumContent(challenge)) {
      return 'Free Challenge';
    }

    if (this.hasPremiumChallengeAccess()) {
      return 'Premium Unlocked';
    }

    return 'Unlock Premium to Access';
  }

  challengeActionLabel(challenge: any): string {
    if (!this.isPremiumContent(challenge)) {
      return 'Start Challenge';
    }

    if (this.hasPremiumChallengeAccess()) {
      return 'Start Challenge';
    }

    return 'Unlock Premium';
  }

  startChallenge(challenge: any): void {
    if (!challenge?.id) return;

    const challengeId = Number(challenge.id);

    // 1. Free challenge: logged-in or guest both can go to challenge page.
    // Guest registration modal will be handled inside PublicPracticeComponent.
    if (!this.isPremiumContent(challenge)) {
      this.router.navigate(['/free-mock-tests', 'challenge', challengeId]);
      return;
    }

    // 2. Premium challenge + active premium plan: create access grant and open challenge.
    if (this.hasPremiumChallengeAccess()) {
      this.unlockPremiumChallengeAndOpen(challenge);
      return;
    }

    // 3. Premium challenge + no premium access:
    // logged-in or not logged-in both should go to pricing.
    this.router.navigate(['/pricing-plans'], {
      queryParams: {
        redirect: '/coding-contests',
        unlock: 'premium-challenge',
        challengeId,
      },
    });
  }

  unlockPremiumChallengeAndOpen(challenge: any): void {
    const challengeId = Number(challenge.id);

    this.loading = true;

    this.publicPracticeService
      .registerAuthenticatedAccess({
        practiceType: 'CHALLENGE',
        practiceId: challengeId,
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          const grant = res?.data as PracticeGrant;

          if (grant?.accessToken) {
            this.persistContestGrant(grant);
          }

          this.router.navigate(['/free-mock-tests', 'challenge', challengeId]);
        },
        error: (err) => {
          this.loading = false;

          const message =
            err?.error?.message || err?.error?.error || 'Unable to unlock premium challenge access';

          this.showToast(message);

          this.router.navigate(['/pricing-plans'], {
            queryParams: {
              redirect: '/coding-contests',
              unlock: 'premium-challenge',
              challengeId,
            },
          });
        },
      });
  }

  private grantStorageKey(type: PracticeType, id: number): string {
    return `practiceGrant_${type}_${id}`;
  }

  private persistContestGrant(grant: PracticeGrant): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const ownedGrant: PracticeGrant = {
      ...grant,
      ownerMode: 'AUTH',
      userId: grant.userId,
    };

    sessionStorage.setItem(
      this.grantStorageKey(grant.practiceType, Number(grant.practiceId)),
      JSON.stringify(ownedGrant),
    );
  }

  trackById(_: number, item: any): any {
    return item?.id || item?.attemptId;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }
}
