import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BatchService } from '../../services/batch';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-trainer-batch-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './trainer-batch-management.html',
  styleUrls: ['./trainer-batch-management.css'],
})
export class TrainerBatchManagementComponent implements OnInit, OnDestroy {
  batchId!: number;
  batch: any;
  sessions: any[] = [];
  loading = false;
  form!: FormGroup;
  editingSessionId: number | null = null;
  expandedDescriptions = new Set<number>();
  durationLoading = false;
  durationError = '';
  private videoUrlSubscription?: Subscription;
  private durationProbePlayer: any;
  previewSession: any = null;
  previewEmbedUrl: SafeResourceUrl | null = null;
  previewVideoUrl = '';
  previewIsYouTube = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private batchService: BatchService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.watchVideoUrlForDuration();
    this.loadBatch();
    this.loadSessions();
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      videoUrl: ['', Validators.required],
      durationMinutes: [0, Validators.required],
      sessionDate: ['', Validators.required],
      published: [false],
    });
  }

  loadBatch(): void {
    this.batchService.getBatchById(this.batchId).subscribe((res: any) => {
      this.batch = res.data;
    });
  }

  loadSessions(): void {
    this.loading = true;

    this.batchService.getSessions(this.batchId).subscribe({
      next: (res: any) => {
        this.sessions = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load sessions');
      },
    });
  }

  editSession(session: any): void {
    this.editingSessionId = session.id;

    this.form.patchValue({
      title: session.title,
      description: session.description,
      videoUrl: session.videoUrl,
      durationMinutes: session.durationMinutes,
      sessionDate: session.sessionDate,
      published: session.published,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  submitSession(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.editingSessionId
      ? this.batchService.updateSession(this.batchId, this.editingSessionId, this.form.value)
      : this.batchService.createSession(this.batchId, this.form.value);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.editingSessionId ? 'Session updated successfully' : 'Session uploaded successfully',
        );

        this.form.reset({
          title: '',
          description: '',
          videoUrl: '',
          durationMinutes: 0,
          sessionDate: '',
          published: false,
        });

        this.editingSessionId = null;
        this.loadSessions();
      },
      error: () => {
        this.toastr.error('Failed to save session');
      },
    });
  }

  cancelEdit(): void {
    this.editingSessionId = null;

    this.form.reset({
      title: '',
      description: '',
      videoUrl: '',
      durationMinutes: 0,
      sessionDate: '',
      published: false,
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.toastr.info('Edit cancelled');
  }

  publish(sessionId: number): void {
    this.batchService.publishSession(this.batchId, sessionId).subscribe(() => {
      this.toastr.success('Session published');
      this.loadSessions();
    });
  }

  unpublish(sessionId: number): void {
    this.batchService.unpublishSession(this.batchId, sessionId).subscribe(() => {
      this.toastr.warning('Session unpublished');
      this.loadSessions();
    });
  }

  delete(sessionId: number): void {
    if (!confirm('Delete this session?')) return;

    this.batchService.deleteSession(this.batchId, sessionId).subscribe(() => {
      this.toastr.success('Session deleted');
      this.loadSessions();
    });
  }

  toggleDescription(sessionId: number): void {
    if (this.expandedDescriptions.has(sessionId)) {
      this.expandedDescriptions.delete(sessionId);
      return;
    }

    this.expandedDescriptions.add(sessionId);
  }

  isDescriptionExpanded(sessionId: number): boolean {
    return this.expandedDescriptions.has(sessionId);
  }

  shouldShowDescriptionToggle(description: string): boolean {
    return String(description || '').length > 120;
  }

  get publishedCount(): number {
    return this.sessions.filter((session) => session.published).length;
  }

  get draftCount(): number {
    return this.sessions.filter((session) => !session.published).length;
  }

  get totalMinutes(): number {
    return this.sessions.reduce((sum, session) => sum + Number(session.durationMinutes || 0), 0);
  }

  trackBySessionId(_: number, session: any): any {
    return session.id;
  }

  watchVideoUrlForDuration(): void {
    this.videoUrlSubscription = this.form
      .get('videoUrl')
      ?.valueChanges.pipe(debounceTime(700), distinctUntilChanged())
      .subscribe((url: string) => {
        this.detectVideoDuration(url);
      });
  }

  detectVideoDuration(url: string): void {
    this.durationError = '';

    if (!url || !url.trim()) {
      this.form.patchValue({ durationMinutes: 0 }, { emitEvent: false });
      return;
    }

    const videoId = this.extractYouTubeVideoId(url);

    if (videoId) {
      this.detectYouTubeDuration(videoId);
      return;
    }

    this.detectDirectVideoDuration(url);
  }

  extractYouTubeVideoId(url: string): string {
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

  detectYouTubeDuration(videoId: string): void {
    this.durationLoading = true;
    this.durationError = '';
    this.loadYouTubeApi()
      .then(() => {
        const probe = document.createElement('div');
        probe.style.position = 'fixed';
        probe.style.left = '-9999px';
        probe.style.top = '-9999px';
        probe.style.width = '1px';
        probe.style.height = '1px';
        document.body.appendChild(probe);

        if (this.durationProbePlayer?.destroy) {
          this.durationProbePlayer.destroy();
        }

        this.durationProbePlayer = new (window as any).YT.Player(probe, {
          videoId,
          events: {
            onReady: (event: any) => {
              setTimeout(() => {
                const seconds = Number(event.target.getDuration() || 0);

                if (seconds > 0) {
                  this.form.patchValue(
                    { durationMinutes: Math.ceil(seconds / 60) },
                    { emitEvent: false },
                  );
                  this.durationError = '';
                } else {
                  this.durationError = 'Unable to detect video duration';
                }

                this.durationLoading = false;

                if (this.durationProbePlayer?.destroy) {
                  this.durationProbePlayer.destroy();
                }

                probe.remove();
              }, 500);
            },
            onError: () => {
              this.durationLoading = false;
              this.durationError = 'Invalid or private YouTube video';
              probe.remove();
            },
          },
        });
      })
      .catch(() => {
        this.durationLoading = false;
        this.durationError = 'Unable to load YouTube duration';
      });
  }

  loadYouTubeApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).YT?.Player) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );

      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const startedAt = Date.now();
      const timer = setInterval(() => {
        if ((window as any).YT?.Player) {
          clearInterval(timer);
          resolve();
        }

        if (Date.now() - startedAt > 10000) {
          clearInterval(timer);
          reject();
        }
      }, 250);
    });
  }

  detectDirectVideoDuration(url: string): void {
    this.durationLoading = true;
    this.durationError = '';

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const seconds = Number(video.duration || 0);

      if (seconds > 0) {
        this.form.patchValue({ durationMinutes: Math.ceil(seconds / 60) }, { emitEvent: false });
        this.durationError = '';
      } else {
        this.durationError = 'Unable to detect video duration';
      }

      this.durationLoading = false;
      video.remove();
    };

    video.onerror = () => {
      this.durationLoading = false;
      this.durationError = 'Duration auto-detect works best with YouTube or direct video files';
      video.remove();
    };
  }

  ngOnDestroy(): void {
    this.videoUrlSubscription?.unsubscribe();

    if (this.durationProbePlayer?.destroy) {
      this.durationProbePlayer.destroy();
    }
  }

  openPreview(session: any): void {
    this.previewSession = session;

    const videoId = this.extractYouTubeVideoId(session.videoUrl);
    this.previewIsYouTube = !!videoId;

    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      this.previewEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      this.previewVideoUrl = '';
      return;
    }

    this.previewEmbedUrl = null;
    this.previewVideoUrl = session.videoUrl || '';
  }

  closePreview(): void {
    this.previewSession = null;
    this.previewEmbedUrl = null;
    this.previewVideoUrl = '';
    this.previewIsYouTube = false;
  }
}
