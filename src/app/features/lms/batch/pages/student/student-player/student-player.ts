import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentLmsService } from '../../../../services/student-lms.service';
import { StudentProgressService } from '../../../../services/student-progress-lms';

type PlayerTab = 'sessions' | 'curriculum' | 'overview';
type LessonSort = 'DEFAULT' | 'TITLE' | 'DURATION_HIGH' | 'DURATION_LOW';
type DurationFilter = 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG';

@Component({
  standalone: true,
  selector: 'app-student-player',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-player.html',
  styleUrls: ['./student-player.css'],
})
export class StudentPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('playerContainer') playerContainer!: ElementRef;

  activeTab: PlayerTab = 'sessions';
  batchId!: number;
  sessions: any[] = [];
  selected: any;
  curriculum: any;
  progress = 0;
  searchText = '';
  loading = true;
  curriculumLoading = true;

  player: any;
  watchInterval: any;
  playerWaitInterval: any;
  startTime = 0;

  lessonSort: LessonSort = 'DEFAULT';
  durationFilter: DurationFilter = 'ALL';
  theaterMode = false;
  sidebarCollapsed = false;
  descriptionExpanded = false;
  toast = '';

  constructor(
    private route: ActivatedRoute,
    private service: StudentLmsService,
    private progressService: StudentProgressService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadYouTubeAPI();
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.waitForPlayer();
  }

  loadData(): void {
    this.loading = true;

    this.service.getSessions(this.batchId).subscribe({
      next: (res: any) => {
        this.sessions = (res?.data || []).map((session: any, index: number) => ({
          ...session,
          originalIndex: index,
          videoId: this.extractVideoId(session.videoUrl),
        }));

        this.progressService.getResume(this.batchId).subscribe({
          next: (data: any) => {
            const sessionId = data?.sessionId;
            this.startTime = Number(data?.time || 0);
            this.selected = sessionId
              ? this.sessions.find((session) => session.id === sessionId) || this.sessions[0]
              : this.sessions[0];

            this.loading = false;
            this.descriptionExpanded = false;
            this.cdr.detectChanges();
            this.waitForPlayer();
          },
          error: () => {
            this.selected = this.sessions[0];
            this.startTime = 0;
            this.loading = false;
            this.descriptionExpanded = false;
            this.cdr.detectChanges();
            this.waitForPlayer();
          },
        });
      },
      error: () => {
        this.sessions = [];
        this.selected = null;
        this.loading = false;
      },
    });

    this.service.getCurriculum(this.batchId).subscribe({
      next: (res: any) => {
        try {
          this.curriculum = res?.data ? JSON.parse(res.data) : null;
        } catch {
          this.curriculum = null;
        }

        this.curriculumLoading = false;
      },
      error: () => {
        this.curriculum = null;
        this.curriculumLoading = false;
      },
    });

    this.refreshProgress();
  }

  refreshProgress(): void {
    this.progressService.getProgress(this.batchId).subscribe({
      next: (progress: any) => (this.progress = Number(progress || 0)),
      error: () => (this.progress = 0),
    });
  }

  waitForPlayer(): void {
    clearInterval(this.playerWaitInterval);

    this.playerWaitInterval = setInterval(() => {
      if ((window as any).YT && this.selected?.videoId && this.playerContainer) {
        clearInterval(this.playerWaitInterval);
        this.createPlayer(this.startTime);
      }
    }, 250);
  }

  createPlayer(startTime = 0): void {
    if (!this.selected?.videoId || !this.playerContainer) return;

    if (this.player?.destroy) {
      this.player.destroy();
    }

    this.player = new (window as any).YT.Player(this.playerContainer.nativeElement, {
      width: '100%',
      height: '100%',
      videoId: this.selected.videoId,
      playerVars: {
        start: startTime,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setSize('100%', '100%');
        },
        onStateChange: (event: any) => this.onPlayerStateChange(event),
      },
    });
  }

  loadYouTubeAPI(): void {
    if ((window as any).YT) return;

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (existingScript) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  onPlayerStateChange(event: any): void {
    const YT = (window as any).YT;

    if (event.data === YT.PlayerState.PLAYING) {
      this.startTracking();
    }

    if (event.data === YT.PlayerState.PAUSED) {
      this.saveCurrentTime();
      clearInterval(this.watchInterval);
    }

    if (event.data === YT.PlayerState.ENDED) {
      this.onVideoEnd();
    }
  }

  getSessionDuration(session: any): number {
    const minutes =
      Number(session?.durationMinutes) ||
      Number(session?.duration) ||
      Number(session?.videoDurationMinutes);

    if (minutes > 0) return Math.ceil(minutes);

    const seconds =
      Number(session?.durationSeconds) ||
      Number(session?.videoDurationSeconds) ||
      Number(session?.videoDuration);

    if (seconds > 0) return Math.ceil(seconds / 60);

    return 0;
  }

  startTracking(): void {
    clearInterval(this.watchInterval);

    this.watchInterval = setInterval(() => {
      this.saveCurrentTime();
    }, 5000);
  }

  saveCurrentTime(): void {
    if (!this.player || !this.selected?.id) return;

    const time = Math.floor(this.player.getCurrentTime() || 0);
    this.progressService.updateResumeWithTime(this.batchId, this.selected.id, time).subscribe();
  }

  select(session: any): void {
    if (!session) return;

    this.saveCurrentTime();
    this.selected = session;
    this.startTime = 0;
    this.descriptionExpanded = false;

    if (this.player?.loadVideoById) {
      this.player.loadVideoById(session.videoId);
    } else {
      this.createPlayer(0);
    }

    this.progressService.updateResume(this.batchId, session.id).subscribe();
  }

  onVideoEnd(): void {
    if (!this.selected?.id) return;

    this.progressService.markCompleted(this.batchId, this.selected.id).subscribe({
      next: () => this.refreshProgress(),
      error: () => this.refreshProgress(),
    });

    this.goToNextLesson();
  }

  markCurrentComplete(): void {
    if (!this.selected?.id) return;

    this.progressService.markCompleted(this.batchId, this.selected.id).subscribe({
      next: () => {
        this.showToast('Lesson marked as completed');
        this.refreshProgress();
      },
      error: () => this.showToast('Unable to update lesson progress'),
    });
  }

  goToPreviousLesson(): void {
    if (!this.previousSession) return;

    this.select(this.previousSession);
  }

  goToNextLesson(): void {
    if (!this.nextSession) return;

    this.selected = this.nextSession;
    this.startTime = 0;
    this.descriptionExpanded = false;

    setTimeout(() => {
      if (this.player?.loadVideoById) {
        this.player.loadVideoById(this.selected.videoId);
      } else {
        this.createPlayer(0);
      }
    }, 200);

    this.progressService.updateResume(this.batchId, this.selected.id).subscribe();
  }

  get filteredSessions(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return [...this.sessions]
      .filter((session) => {
        const matchesSearch =
          !term ||
          [session.title, session.description, session.durationMinutes]
            .join(' ')
            .toLowerCase()
            .includes(term);

        const duration = this.getSessionDuration(session);
        const matchesDuration =
          this.durationFilter === 'ALL' ||
          (this.durationFilter === 'SHORT' && duration <= 15) ||
          (this.durationFilter === 'MEDIUM' && duration > 15 && duration <= 45) ||
          (this.durationFilter === 'LONG' && duration > 45);

        return matchesSearch && matchesDuration;
      })
      .sort((a, b) => {
        if (this.lessonSort === 'TITLE') {
          return String(a.title || '').localeCompare(String(b.title || ''));
        }

        if (this.lessonSort === 'DURATION_HIGH') {
          return Number(b.durationMinutes || 0) - Number(a.durationMinutes || 0);
        }

        if (this.lessonSort === 'DURATION_LOW') {
          return Number(a.durationMinutes || 0) - Number(b.durationMinutes || 0);
        }

        return Number(a.originalIndex || 0) - Number(b.originalIndex || 0);
      });
  }

  get currentIndex(): number {
    return this.sessions.findIndex((session) => session.id === this.selected?.id);
  }

  get previousSession(): any {
    if (this.currentIndex <= 0) return null;
    return this.sessions[this.currentIndex - 1] || null;
  }

  get nextSession(): any {
    if (this.currentIndex < 0) return null;
    return this.sessions[this.currentIndex + 1] || null;
  }

  get progressValue(): number {
    return Math.min(Math.max(Number(this.progress || 0), 0), 100);
  }

  get totalDuration(): number {
    return this.sessions.reduce((sum, session) => sum + this.getSessionDuration(session), 0);
  }

  get totalHours(): string {
    return (this.totalDuration / 60).toFixed(1);
  }

  get curriculumModules(): any[] {
    return this.curriculum?.curriculum || this.curriculum?.modules || [];
  }

  get resumeLabel(): string {
    if (!this.startTime) return 'Start from beginning';

    const minutes = Math.floor(this.startTime / 60);
    const seconds = this.startTime % 60;

    return `${minutes}m ${seconds}s`;
  }

  shouldShowDescriptionToggle(description: string): boolean {
    return String(description || '').length > 150;
  }

  toggleDescription(): void {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  toggleTheaterMode(): void {
    this.theaterMode = !this.theaterMode;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  copyVideoLink(): void {
    if (!this.selected?.videoUrl) {
      this.showToast('No video link available');
      return;
    }

    navigator.clipboard
      ?.writeText(this.selected.videoUrl)
      .then(() => this.showToast('Video link copied'))
      .catch(() => this.showToast('Unable to copy video link'));
  }

  openVideoInNewTab(): void {
    if (!this.selected?.videoUrl) {
      this.showToast('No video link available');
      return;
    }

    window.open(this.selected.videoUrl, '_blank', 'noopener,noreferrer');
  }

  setTab(tab: PlayerTab): void {
    this.activeTab = tab;
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2500);
  }

  extractVideoId(url: string): string {
    if (!url) return '';

    if (url.includes('youtu.be')) {
      return url.split('/').pop()?.split('?')[0] ?? '';
    }

    if (url.includes('watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] ?? '';
    }

    if (url.includes('/embed/')) {
      return url.split('/embed/')[1]?.split('?')[0] ?? '';
    }

    if (url.includes('/shorts/')) {
      return url.split('/shorts/')[1]?.split('?')[0] ?? '';
    }

    return '';
  }

  ngOnDestroy(): void {
    this.saveCurrentTime();
    clearInterval(this.watchInterval);
    clearInterval(this.playerWaitInterval);

    if (this.player?.destroy) {
      this.player.destroy();
    }
  }
}
