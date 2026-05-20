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
        this.sessions = (res?.data || []).map((session: any) => ({
          ...session,
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
            this.cdr.detectChanges();
            this.waitForPlayer();
          },
          error: () => {
            this.selected = this.sessions[0];
            this.startTime = 0;
            this.loading = false;
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

    if (this.player?.loadVideoById) {
      this.player.loadVideoById(session.videoId);
    } else {
      this.createPlayer(0);
    }

    this.progressService.updateResume(this.batchId, session.id).subscribe();
  }

  onVideoEnd(): void {
    if (!this.selected?.id) return;

    this.progressService.markCompleted(this.batchId, this.selected.id).subscribe();

    this.progressService.getProgress(this.batchId).subscribe({
      next: (progress: any) => (this.progress = Number(progress || 0)),
    });

    this.goToNextLesson();
  }

  goToNextLesson(): void {
    if (!this.nextSession) return;

    this.selected = this.nextSession;
    this.startTime = 0;

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

    if (!term) return this.sessions;

    return this.sessions.filter((session) =>
      [session.title, session.description, session.durationMinutes]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }

  get currentIndex(): number {
    return this.sessions.findIndex((session) => session.id === this.selected?.id);
  }

  get nextSession(): any {
    if (this.currentIndex < 0) return null;
    return this.sessions[this.currentIndex + 1] || null;
  }

  get progressValue(): number {
    return Math.min(Math.max(Number(this.progress || 0), 0), 100);
  }

  get totalDuration(): number {
    return this.sessions.reduce((sum, session) => sum + Number(session.durationMinutes || 0), 0);
  }

  get curriculumModules(): any[] {
    return this.curriculum?.curriculum || this.curriculum?.modules || [];
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
