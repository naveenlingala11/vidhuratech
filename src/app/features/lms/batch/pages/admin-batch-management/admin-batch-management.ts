import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminBatchService } from '../../services/admin-batch';

import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-admin-batch-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-batch-management.html',
  styleUrls: ['./admin-batch-management.css']
})
export class AdminBatchManagementComponent implements OnInit {

  // ================= DATA =================
  batches: any[] = [];
  courses: any[] = [];
  trainers: any[] = [];

  loading = false;
  totalPages = 0;

  // ================= FILTERS =================
  filters = {
    keyword: '',
    status: '',
    courseId: '',
    trainerId: '',
    page: 0,
    size: 10
  };

  private searchSubject = new Subject<string>();

  // ================= MODAL =================
  showModal = false;
  editingId: number | null = null;

  form: any = {
    name: '',
    courseId: null,
    trainerId: null,
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  };

  constructor(
    private batchService: AdminBatchService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    this.loadBatches();
    this.loadDropdowns();

    this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.filters.page = 0;
      this.loadBatches();
    });
  }

  // ================= LOAD DATA =================
  loadBatches() {
    this.loading = true;

    this.batchService.getBatches(this.filters)
      .subscribe({
        next: (res: any) => {
          this.batches = res.data?.content || [];
          this.totalPages = res.data?.totalPages || 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to load batches');
        }
      });
  }

  loadDropdowns() {
    this.batchService.getCourses().subscribe((res: any) => {
      this.courses = res.data?.content || res.data || [];
      this.cd.detectChanges();
    });

    this.batchService.getTrainers().subscribe((res: any) => {
      this.trainers = res.data || [];
      this.cd.detectChanges();
    });
  }

  // ================= SEARCH =================
  triggerSearch() {
    this.searchSubject.next(this.filters.keyword);
  }

  setStatus(status: string) {
    this.filters.status = status;
    this.filters.page = 0;
    this.loadBatches();
  }

  // ================= PAGINATION =================
  nextPage() {
    if (this.filters.page + 1 >= this.totalPages) return;
    this.filters.page++;
    this.loadBatches();
  }

  prevPage() {
    if (this.filters.page === 0) return;
    this.filters.page--;
    this.loadBatches();
  }

  // ================= DELETE =================
  deleteBatch(id: number) {
    if (!confirm('Delete this batch?')) return;

    this.batchService.deleteBatch(id)
      .subscribe({
        next: () => {
          this.toastr.success('Batch deleted');
          this.loadBatches();
        },
        error: () => this.toastr.error('Delete failed')
      });
  }

  // ================= MODAL =================
  openCreateModal() {
    this.showModal = true;
    this.editingId = null;
    this.resetForm();
  }

  openEditModal(batch: any) {
    this.showModal = true;
    this.editingId = batch.id;

    this.form = {
      name: batch.name,
      courseId: batch.courseId,
      trainerId: batch.trainerId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      status: batch.status
    };
  }

  closeModal() {
    this.showModal = false;
  }

  resetForm() {
    this.form = {
      name: '',
      courseId: null,
      trainerId: null,
      startDate: '',
      endDate: '',
      status: 'ACTIVE'
    };
  }

  saveBatch() {
    const apiCall = this.editingId
      ? this.batchService.updateBatch(this.editingId, this.form)
      : this.batchService.createBatch(this.form);

    apiCall.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Updated successfully' : 'Created successfully');
        this.closeModal();
        this.loadBatches();
      },
      error: () => this.toastr.error('Save failed')
    });
  }
}