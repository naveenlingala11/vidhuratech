import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicPracticeService } from '../../../../features/services/public-practice.service';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';
export type LeaderboardScope = 'period' | 'challenge';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { GamificationService } from '../../../../services/gamification.service';
import { AuthService } from '../../../../features/auth/services/auth.service';

@Component({
  selector: 'app-premium-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premium-leaderboard.html',
  styleUrls: ['./premium-leaderboard.css'],
})
export class PremiumLeaderboardComponent implements OnInit, OnChanges {
  constructor(
    private publicPracticeService: PublicPracticeService,
    private gamificationService: GamificationService,
    private authService: AuthService,
  ) {}
  @Input() title = 'Weekly Leaderboard';
  @Input() subtitle =
    'Track top performers by rank, score, solved challenges, and latest submissions.';
  @Input() loading = false;
  @Input() scope: LeaderboardScope = 'period';
  @Input() period: LeaderboardPeriod = 'weekly';
  @Input() selectedChallenge: any = null;

  @Input() entries: any[] | any = [];
  @Input() topThree: any[] | any = [];
  @Input() showChallengeTab = true;

  // Keep true. This makes component work in Home and Coding Contest even if parent forgets data.
  @Input() autoLoad = true;

  @Output() periodChange = new EventEmitter<LeaderboardPeriod>();
  @Output() overallClick = new EventEmitter<void>();
  @Output() challengeClick = new EventEmitter<void>();

  search = '';
  sortBy: 'rank' | 'score' | 'latest' | 'name' = 'rank';
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 15, 25];

  internalLoading = false;
  internalEntries: any[] = [];
  internalTopThree: any[] = [];

  ngOnInit(): void {
    this.loadFromApiIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['entries'] ||
      changes['scope'] ||
      changes['period'] ||
      changes['selectedChallenge']
    ) {
      this.page = 1;
    }

    if (changes['period'] || changes['scope'] || changes['selectedChallenge']) {
      this.loadFromApiIfNeeded();
    }
  }

  get isLoading(): boolean {
    return this.loading || this.internalLoading;
  }

  get inputEntries(): any[] {
    return this.normalizeList(this.entries);
  }

  get inputTopThree(): any[] {
    return this.normalizeList(this.topThree);
  }

  get normalizedEntries(): any[] {
    if (this.inputEntries.length) return this.inputEntries;
    if (this.internalEntries.length) return this.internalEntries;
    if (this.inputTopThree.length) return this.inputTopThree;
    return this.internalTopThree;
  }

  get normalizedTopThree(): any[] {
    if (this.inputTopThree.length) return this.inputTopThree;
    if (this.internalTopThree.length) return this.internalTopThree;
    return this.normalizedEntries.slice(0, 3);
  }

  get displayTitle(): string {
    if (this.scope === 'challenge' && this.selectedChallenge?.title) {
      return `${this.selectedChallenge.title} Leaderboard`;
    }

    return this.title || `${this.periodLabel} Leaderboard`;
  }

  get periodLabel(): string {
    return this.period.charAt(0).toUpperCase() + this.period.slice(1);
  }

  get podiumEntries(): any[] {
    return [...this.normalizedTopThree]
      .sort((a, b) => this.rankValue(a) - this.rankValue(b))
      .slice(0, 3);
  }
  safeProfileImageUrl(value: any): string {
    const url = String(value || '').trim();

    if (!url) {
      return '';
    }

    return url.startsWith('https://') ? url : '';
  }

  avatarUrl(row: any): string {
    if (!row || row.__avatarFailed) {
      return '';
    }

    return this.safeProfileImageUrl(
      row.profileImageUrl ||
        row.userProfileImageUrl ||
        row.authorProfileImageUrl ||
        row.imageUrl ||
        row.photoURL ||
        row.photoUrl ||
        row.picture ||
        row.avatarUrl ||
        row.user?.profileImageUrl ||
        row.user?.picture ||
        row.student?.profileImageUrl ||
        row.participant?.profileImageUrl ||
        row.author?.profileImageUrl,
    );
  }

  avatarInitial(row: any): string {
    const name = this.nameValue(row).trim();

    if (!name) {
      return 'P';
    }

    return name.charAt(0).toUpperCase();
  }

  markAvatarFailed(row: any): void {
    if (row) {
      row.__avatarFailed = true;
    }
  }

  get filteredEntries(): any[] {
    const term = this.search.trim().toLowerCase();

    const list = this.normalizedEntries.filter((row) => {
      const text = [
        row.name,
        row.studentName,
        row.fullName,
        row.participantName,
        row.userName,
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

    return [...list].sort((a, b) => {
      if (this.sortBy === 'score') return this.scoreValue(b) - this.scoreValue(a);
      if (this.sortBy === 'latest') return this.dateValue(b) - this.dateValue(a);
      if (this.sortBy === 'name') return this.nameValue(a).localeCompare(this.nameValue(b));
      return this.rankValue(a) - this.rankValue(b);
    });
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.filteredEntries.length / this.pageSize), 1);
  }

  get pagedEntries(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEntries.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  private loadFromApiIfNeeded(): void {
    if (!this.autoLoad) return;

    // Parent already supplied data, no duplicate request needed.
    if (this.inputEntries.length || this.inputTopThree.length) return;

    if (this.scope === 'challenge') {
      const challengeId = Number(
        this.selectedChallenge?.id || this.selectedChallenge?.challengeId || 0,
      );
      if (!challengeId) return;
      this.loadChallengeLeaderboard(challengeId);
      return;
    }

    this.loadPeriodLeaderboard(this.period);
  }

  private loadPeriodLeaderboard(period: LeaderboardPeriod): void {
    this.internalLoading = true;

    const request =
      period === 'daily'
        ? this.publicPracticeService.getDailyLeaderboard()
        : period === 'monthly'
          ? this.publicPracticeService.getMonthlyLeaderboard()
          : this.publicPracticeService.getWeeklyLeaderboard();

    request.subscribe({
      next: (res: any) => {
        const entries = this.extractEntries(res);
        const top = this.extractTopThree(res, entries);

        this.internalEntries = entries.length ? entries : top;
        this.internalTopThree = top.length ? top : entries.slice(0, 3);
        this.internalLoading = false;
      },
      error: () => {
        this.internalEntries = [];
        this.internalTopThree = [];
        this.internalLoading = false;
      },
    });
  }

  private loadChallengeLeaderboard(challengeId: number): void {
    this.internalLoading = true;

    this.publicPracticeService.getChallengeLeaderboard(challengeId).subscribe({
      next: (res: any) => {
        const entries = this.extractEntries(res);
        const top = this.extractTopThree(res, entries);

        this.internalEntries = entries.length ? entries : top;
        this.internalTopThree = top.length ? top : entries.slice(0, 3);
        this.internalLoading = false;
      },
      error: () => {
        this.internalEntries = [];
        this.internalTopThree = [];
        this.internalLoading = false;
      },
    });
  }

  normalizeList(value: any): any[] {
    if (Array.isArray(value)) return value;

    if (Array.isArray(value?.entries)) return value.entries;
    if (Array.isArray(value?.leaderboard)) return value.leaderboard;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.winners)) return value.winners;
    if (Array.isArray(value?.topThree)) return value.topThree;
    if (Array.isArray(value?.content)) return value.content;

    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.data?.entries)) return value.data.entries;
    if (Array.isArray(value?.data?.leaderboard)) return value.data.leaderboard;
    if (Array.isArray(value?.data?.results)) return value.data.results;
    if (Array.isArray(value?.data?.winners)) return value.data.winners;
    if (Array.isArray(value?.data?.topThree)) return value.data.topThree;
    if (Array.isArray(value?.data?.content)) return value.data.content;

    return [];
  }

  private extractPayload(res: any): any {
    return res?.data || res || {};
  }

  private extractEntries(res: any): any[] {
    return this.normalizeList(this.extractPayload(res));
  }

  private extractTopThree(res: any, entries: any[] = []): any[] {
    const payload = this.extractPayload(res);

    if (Array.isArray(payload?.topThree)) return payload.topThree;
    if (Array.isArray(payload?.winners)) return payload.winners;
    if (Array.isArray(payload?.data?.topThree)) return payload.data.topThree;
    if (Array.isArray(payload?.data?.winners)) return payload.data.winners;

    return entries.slice(0, 3);
  }

  changePeriod(period: LeaderboardPeriod): void {
    this.period = period;
    this.scope = 'period';
    this.page = 1;
    this.internalEntries = [];
    this.internalTopThree = [];
    this.periodChange.emit(period);

    if (this.autoLoad) {
      this.loadPeriodLeaderboard(period);
    }
  }

  showOverall(): void {
    this.scope = 'period';
    this.page = 1;
    this.overallClick.emit();

    if (this.autoLoad) {
      this.loadPeriodLeaderboard(this.period);
    }
  }

  showChallenge(): void {
    this.scope = 'challenge';
    this.page = 1;
    this.challengeClick.emit();

    const challengeId = Number(
      this.selectedChallenge?.id || this.selectedChallenge?.challengeId || 0,
    );
    if (this.autoLoad && challengeId) {
      this.loadChallengeLeaderboard(challengeId);
    }
  }

  resetTable(): void {
    this.search = '';
    this.sortBy = 'rank';
    this.pageSize = 10;
    this.page = 1;
  }

  onFilterChange(): void {
    this.page = 1;
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
  }

  nameValue(row: any): string {
    return String(
      row?.name ||
        row?.studentName ||
        row?.fullName ||
        row?.participantName ||
        row?.userName ||
        'Participant',
    );
  }

  rankValue(row: any): number {
    return Number(row?.rank || row?.position || row?.serialNo || 999999);
  }

  scoreValue(row: any): number {
    return Number(
      row?.score || row?.marksObtained || row?.totalScore || row?.obtainedMarks || row?.marks || 0,
    );
  }

  totalValue(row: any): number {
    return Number(row?.totalMarks || row?.maxMarks || row?.maximumMarks || row?.outOf || 0);
  }

  dateValue(row: any): number {
    return new Date(
      row?.submittedAt || row?.createdAt || row?.attemptedAt || row?.updatedAt || 0,
    ).getTime();
  }

  submittedAt(row: any): any {
    return row?.submittedAt || row?.createdAt || row?.attemptedAt || row?.updatedAt || null;
  }

  rankBadge(row: any): string {
    const rank = this.rankValue(row);

    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner Up';
    if (rank === 3) return 'Top Three';
    if (rank <= 10) return 'Top 10';

    return 'Ranked';
  }

  rankClass(row: any): string {
    const rank = this.rankValue(row);

    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    if (rank <= 10) return 'rank-blue';

    return '';
  }

  trackByEntry(index: number, item: any): any {
    return item?.id || item?.attemptId || item?.rank || item?.email || item?.phone || index;
  }
}
