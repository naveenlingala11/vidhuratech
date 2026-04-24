import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BatchService } from '../../services/batch';

@Component({
  selector: 'app-trainer-batch-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-batch-management.html'
})
export class TrainerBatchManagementComponent implements OnInit {

  batchId!: number;

  batch: any;
  sessions: any[] = [];

  loading = false;

  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private batchService: BatchService,
    private toastr: ToastrService
  ) {}

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

  submitSession() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.batchService.createSession(
      this.batchId,
      this.form.value
    ).subscribe(() => {
      this.toastr.success('Session uploaded successfully');
      this.form.reset({ published: false });
      this.loadSessions();
    });
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