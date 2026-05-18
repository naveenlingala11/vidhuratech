import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BatchService } from '../../services/batch';
@Component({
  selector: 'app-trainer-batch-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './trainer-batch-management.html',
  styleUrls: ['./trainer-batch-management.css']
})
export class TrainerBatchManagementComponent implements OnInit {
  batchId!: number;
  batch: any;
  sessions: any[] = [];
  loading = false;
  form!: FormGroup;
  editingSessionId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private batchService: BatchService,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadBatch();
    this.loadSessions();
  }
  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      videoUrl: ['', Validators.required],
      durationMinutes: [30, Validators.required],
      sessionDate: ['', Validators.required],
      published: [false]
    });
  }
  loadBatch() {
    this.batchService.getBatchById(this.batchId)
      .subscribe((res: any) => {
        this.batch = res.data;
      });
  }
  loadSessions() {
    this.loading = true;
    this.batchService.getSessions(this.batchId)
      .subscribe({
        next: (res: any) => {
          this.sessions = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to load sessions');
        }
      });
  }
  editSession(session: any) {
    this.editingSessionId = session.id;
    this.form.patchValue({
      title: session.title,
      description: session.description,
      videoUrl: session.videoUrl,
      durationMinutes: session.durationMinutes,
      sessionDate: session.sessionDate,
      published: session.published
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  submitSession() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request = this.editingSessionId
      ? this.batchService.updateSession(
        this.batchId,
        this.editingSessionId,
        this.form.value
      )
      : this.batchService.createSession(
        this.batchId,
        this.form.value
      );
    request.subscribe({
      next: () => {
        this.toastr.success(
          this.editingSessionId
            ? 'Session updated successfully'
            : 'Session uploaded successfully'
        );
        this.form.reset({
          published: false,
          durationMinutes: 30
        });
        this.editingSessionId = null;
        this.loadSessions();
      },
      error: () => {
        this.toastr.error(
          'Failed to save session'
        );
      }
    });
  }
  cancelEdit() {
    this.editingSessionId = null;
    this.form.reset({
      title: '',
      description: '',
      videoUrl: '',
      durationMinutes: 30,
      sessionDate: '',
      published: false
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.toastr.info('Edit cancelled');
  }
  publish(sessionId: number) {
    this.batchService.publishSession(this.batchId, sessionId)
      .subscribe(() => {
        this.toastr.success('Session published');
        this.loadSessions();
      });
  }
  unpublish(sessionId: number) {
    this.batchService.unpublishSession(this.batchId, sessionId)
      .subscribe(() => {
        this.toastr.warning('Session unpublished');
        this.loadSessions();
      });
  }
  delete(sessionId: number) {
    if (!confirm('Delete this session?')) return;
    this.batchService.deleteSession(this.batchId, sessionId)
      .subscribe(() => {
        this.toastr.success('Session deleted');
        this.loadSessions();
      });
  }
}