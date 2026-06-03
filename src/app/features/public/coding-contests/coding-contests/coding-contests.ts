import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicPracticeService } from '../../../services/public-practice.service';
import { PremiumLeaderboardComponent } from '../../../../shared/components/premium-leaderboard/premium-leaderboard/premium-leaderboard';

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
  imports: [CommonModule, FormsModule, RouterLink, PremiumLeaderboardComponent],
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
  selectedSort: 'latest' | 'marks' | 'duration' | 'company' = 'latest';

  challengePage = 1;
  challengePageSize = 6;
  challengePageSizeOptions = [4, 6, 9, 12];

  leaderboardScope: LeaderboardScope = 'period';
  leaderboardPeriod: Period = 'weekly';
  periodLeaderboard: any[] = [];
  challengeLeaderboard: any[] = [];

  leaderboardSearch = '';
  leaderboardSort: 'rank' | 'score' | 'latest' | 'name' = 'rank';
  leaderboardPage = 1;
  leaderboardPageSize = 10;
  leaderboardPageSizeOptions = [5, 10, 15, 25];

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

      if (this.selectedSort === 'company') {
        return String(a.company || '').localeCompare(String(b.company || ''));
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

  get challengePages(): number[] {
    const total = this.challengeTotalPages;
    const current = this.challengePage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get activeLeaderboard(): any[] {
    return this.leaderboardScope === 'challenge'
      ? this.challengeLeaderboard
      : this.periodLeaderboard;
  }

  get filteredLeaderboard(): any[] {
    const term = this.leaderboardSearch.trim().toLowerCase();

    const filtered = this.activeLeaderboard.filter((row) => {
      const text = [
        row.name,
        row.email,
        row.phone,
        row.language,
        row.company,
        row.challengeTitle,
        row.solvedSummary,
      ]
        .join(' ')
        .toLowerCase();

      return !term || text.includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (this.leaderboardSort === 'score') {
        return Number(b.score || 0) - Number(a.score || 0);
      }

      if (this.leaderboardSort === 'latest') {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      }

      if (this.leaderboardSort === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''));
      }

      return Number(a.rank || 999999) - Number(b.rank || 999999);
    });
  }

  get leaderboardTotalPages(): number {
    return Math.max(Math.ceil(this.filteredLeaderboard.length / this.leaderboardPageSize), 1);
  }

  get pagedLeaderboard(): any[] {
    const start = (this.leaderboardPage - 1) * this.leaderboardPageSize;
    return this.filteredLeaderboard.slice(start, start + this.leaderboardPageSize);
  }

  get leaderboardPages(): number[] {
    const total = this.leaderboardTotalPages;
    const current = this.leaderboardPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get featuredTopThree(): any[] {
    const source =
      this.leaderboardScope === 'challenge'
        ? this.challengeLeaderboard
        : this.leaderboardPeriod === 'daily'
          ? this.dailyTopThree
          : this.leaderboardPeriod === 'monthly'
            ? this.monthlyTopThree
            : this.weeklyTopThree;

    return [...(source || [])]
      .sort((a, b) => Number(a.rank || 999999) - Number(b.rank || 999999))
      .slice(0, 3);
  }

  get totalMarksAvailable(): number {
    return this.challenges.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
  }

  get averageDuration(): number {
    if (!this.challenges.length) return 0;
    const total = this.challenges.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
    return Math.round(total / this.challenges.length);
  }

  get premiumChallengeCount(): number {
    return this.challenges.filter((challenge) => this.isPremiumContent(challenge)).length;
  }

  get freeChallengeCount(): number {
    return this.challenges.length - this.premiumChallengeCount;
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
      next: (res: any) => {
        const entries = this.extractEntries(res);
        this.dailyTopThree = this.extractTopThree(res, entries);
      },
      error: () => (this.dailyTopThree = []),
    });

    this.publicPracticeService.getWeeklyLeaderboard().subscribe({
      next: (res: any) => {
        const entries = this.extractEntries(res);
        this.weeklyTopThree = this.extractTopThree(res, entries);
      },
      error: () => (this.weeklyTopThree = []),
    });

    this.publicPracticeService.getMonthlyLeaderboard().subscribe({
      next: (res: any) => {
        const entries = this.extractEntries(res);
        this.monthlyTopThree = this.extractTopThree(res, entries);
      },
      error: () => (this.monthlyTopThree = []),
    });
  }

  loadAnnouncements(): void {
    this.publicPracticeService.getContestAnnouncements().subscribe({
      next: (res: any) => (this.announcements = res?.data || []),
      error: () => (this.announcements = []),
    });
  }

  private extractLeaderboardPayload(res: any): any {
    return res?.data || res || {};
  }

  private extractEntries(res: any): any[] {
    const payload = this.extractLeaderboardPayload(res);

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.entries)) return payload.entries;
    if (Array.isArray(payload.leaderboard)) return payload.leaderboard;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data?.entries)) return payload.data.entries;
    if (Array.isArray(payload.data?.leaderboard)) return payload.data.leaderboard;

    return [];
  }

  private extractTopThree(res: any, entries: any[] = []): any[] {
    const payload = this.extractLeaderboardPayload(res);

    if (Array.isArray(payload.topThree)) return payload.topThree;
    if (Array.isArray(payload.winners)) return payload.winners;
    if (Array.isArray(payload.data?.topThree)) return payload.data.topThree;

    return entries.slice(0, 3);
  }

  get currentLeaderboardEntries(): any[] {
    if (this.leaderboardScope === 'challenge') {
      return this.challengeLeaderboard;
    }

    if (this.periodLeaderboard.length) {
      return this.periodLeaderboard;
    }

    return this.challengeLeaderboard;
  }

  get currentLeaderboardTopThree(): any[] {
    if (this.leaderboardScope === 'challenge') {
      return this.challengeLeaderboard.slice(0, 3);
    }

    if (this.featuredTopThree.length) {
      return this.featuredTopThree;
    }

    return this.challengeLeaderboard.slice(0, 3);
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
        const entries = this.extractEntries(res);
        const topThree = this.extractTopThree(res, entries);

        this.periodLeaderboard = entries;

        if (period === 'daily') this.dailyTopThree = topThree;
        if (period === 'weekly') this.weeklyTopThree = topThree;
        if (period === 'monthly') this.monthlyTopThree = topThree;

        this.leaderboardLoading = false;

        if (!entries.length && this.selectedChallenge?.id) {
          this.selectChallenge(this.selectedChallenge, true);
        }
      },
      error: () => {
        this.periodLeaderboard = [];
        this.leaderboardLoading = false;

        if (this.selectedChallenge?.id) {
          this.selectChallenge(this.selectedChallenge, true);
        }
      },
    });
  }

  selectChallenge(challenge: any, switchLeaderboard = true): void {
    if (!challenge?.id) return;

    this.selectedChallenge = challenge;
    this.challengeLeaderboard = [];
    this.leaderboardLoading = true;

    if (switchLeaderboard) {
      this.leaderboardScope = 'challenge';
      this.leaderboardPage = 1;
    }

    this.publicPracticeService.getChallengeLeaderboard(Number(challenge.id)).subscribe({
      next: (res: any) => {
        const entries = this.extractEntries(res);

        this.challengeLeaderboard = entries;
        this.leaderboardLoading = false;

        if (!this.periodLeaderboard.length && entries.length) {
          this.leaderboardScope = 'challenge';
        }
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
    this.challengePageSize = 6;
    this.challengePage = 1;
  }

  resetLeaderboardFilters(): void {
    this.leaderboardSearch = '';
    this.leaderboardSort = 'rank';
    this.leaderboardPageSize = 10;
    this.leaderboardPage = 1;
  }

  onChallengeFilterChange(): void {
    this.challengePage = 1;
  }

  onLeaderboardFilterChange(): void {
    this.leaderboardPage = 1;
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
    if (!this.isPremiumContent(challenge)) return 'Free Challenge';
    if (this.hasPremiumChallengeAccess()) return 'Premium Unlocked';
    return 'Premium Locked';
  }

  challengeActionLabel(challenge: any): string {
    if (!this.isPremiumContent(challenge)) return 'Start Challenge';
    if (this.hasPremiumChallengeAccess()) return 'Start Challenge';
    return 'Unlock Premium';
  }

  rankBadge(row: any): string {
    const rank = Number(row?.rank || 0);

    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner Up';
    if (rank === 3) return 'Top Three';
    if (rank <= 10) return 'Top 10';

    return 'Ranked';
  }

  rankClass(row: any): string {
    const rank = Number(row?.rank || 0);

    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    if (rank <= 10) return 'rank-blue';

    return '';
  }

  startChallenge(challenge: any): void {
    if (!challenge?.id) return;

    const challengeId = Number(challenge.id);

    if (!this.isPremiumContent(challenge)) {
      this.router.navigate(['/free-mock-tests', 'challenge', challengeId]);
      return;
    }

    if (this.hasPremiumChallengeAccess()) {
      this.unlockPremiumChallengeAndOpen(challenge);
      return;
    }

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
    return item?.id || item?.attemptId || item?.rank;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }
}
