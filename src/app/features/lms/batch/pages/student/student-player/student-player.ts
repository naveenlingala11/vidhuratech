import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { StudentLmsService } from '../../../../services/student-lms.service';
import { StudentProgressService } from '../../../../services/student-progress-lms';

@Component({
  standalone: true,
  selector: 'app-student-player',
  imports: [CommonModule],
  templateUrl: './student-player.html',
  styleUrls: ['./student-player.css']
})
export class StudentPlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('playerContainer') playerContainer!: ElementRef;
  activeTab: string = 'sessions';

  batchId!: number;
  sessions: any[] = [];
  selected: any;
  curriculum: any;
  progress: number = 0;

  player: any;
  watchInterval: any;
  startTime: number = 0;

  constructor(
    private route: ActivatedRoute,
    private service: StudentLmsService,
    private progressService: StudentProgressService,
    private cdr: ChangeDetectorRef
  ) { }

  /* =========================
     INIT
  ========================= */
  ngOnInit() {

    this.batchId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadYouTubeAPI();

    this.loadData();
  }

  loadData() {

    this.service.getSessions(this.batchId).subscribe((res: any) => {

      this.sessions = (res.data || []).map((s: any) => ({
        ...s,
        videoId: this.extractVideoId(s.videoUrl)
      }));

      // ✅ Resume
      this.progressService.getResume(this.batchId)
        .subscribe((data: any) => {

          const sessionId = data?.sessionId;
          this.startTime = data?.time || 0;

          this.selected = sessionId
            ? this.sessions.find(s => s.id === sessionId)
            : this.sessions[0];

          this.cdr.detectChanges(); // fix NG0100
        });
    });

    // curriculum
    this.service.getCurriculum(this.batchId)
      .subscribe((res: any) => {
        this.curriculum = res.data ? JSON.parse(res.data) : null;
      });

    // progress
    this.progressService.getProgress(this.batchId)
      .subscribe((p: any) => this.progress = p);
  }

  /* =========================
     AFTER VIEW
  ========================= */
  ngAfterViewInit() {

    const wait = setInterval(() => {

      if ((window as any).YT && this.selected && this.playerContainer) {

        clearInterval(wait);

        this.createPlayer(this.startTime);
      }

    }, 300);
  }

  /* =========================
     CREATE PLAYER
  ========================= */
  createPlayer(startTime = 0) {

    if (this.player) {
      this.player.destroy();
    }

    this.player = new (window as any).YT.Player(
      this.playerContainer.nativeElement,
      {
        width: '100%',   // ✅ IMPORTANT
        height: '100%',  // ✅ IMPORTANT

        videoId: this.selected?.videoId || '',

        playerVars: {
          start: startTime,
          rel: 0,
          modestbranding: 1
        },

        events: {
          onReady: (event: any) => {
            event.target.setSize('100%', '100%'); // ✅ FORCE FIT
          },
          onStateChange: (e: any) => this.onPlayerStateChange(e)
        }
      }
    );
  }

  /* =========================
     LOAD YOUTUBE API
  ========================= */
  loadYouTubeAPI() {

    if ((window as any).YT) return;

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  /* =========================
     PLAYER EVENTS
  ========================= */
  onPlayerStateChange(event: any) {

    const YT = (window as any).YT;

    if (event.data === YT.PlayerState.PLAYING) {
      this.startTracking();
    }

    if (event.data === YT.PlayerState.ENDED) {
      this.onVideoEnd();
    }
  }

  /* =========================
     TRACK TIME
  ========================= */
  startTracking() {

    clearInterval(this.watchInterval);

    this.watchInterval = setInterval(() => {

      if (!this.player) return;

      const time = Math.floor(this.player.getCurrentTime());

      this.progressService.updateResumeWithTime(
        this.batchId,
        this.selected.id,
        time
      ).subscribe();

    }, 5000);
  }

  /* =========================
     SELECT SESSION
  ========================= */
  select(session: any) {

    this.selected = session;

    if (this.player?.loadVideoById) {
      this.player.loadVideoById(session.videoId);
    } else {
      this.createPlayer(0);
    }

    this.progressService.updateResume(this.batchId, session.id).subscribe();
  }

  /* =========================
     VIDEO END
  ========================= */
  onVideoEnd() {

    this.progressService.markCompleted(this.batchId, this.selected.id).subscribe();

    this.progressService.getProgress(this.batchId)
      .subscribe((p: any) => this.progress = p);

    const index = this.sessions.findIndex(s => s.id === this.selected.id);

    if (index < this.sessions.length - 1) {

      const next = this.sessions[index + 1];

      this.selected = next;

      setTimeout(() => {
        this.player.loadVideoById(next.videoId);
      }, 300);

      this.progressService.updateResume(this.batchId, next.id).subscribe();
    }
  }

  /* =========================
     EXTRACT VIDEO ID
  ========================= */
  extractVideoId(url: string): string {

    if (!url) return '';

    if (url.includes('youtu.be')) {
      return url.split('/').pop()?.split('?')[0] ?? '';
    }

    if (url.includes('watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] ?? '';
    }

    return '';
  }

  /* =========================
     CLEANUP
  ========================= */
  ngOnDestroy() {
    clearInterval(this.watchInterval);
    if (this.player) this.player.destroy();
  }
}