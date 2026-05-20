import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

type BatchFilter = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

@Component({
  selector: 'app-trainer-batches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-batches.html',
  styleUrls: ['./trainer-batches.css'],
})
export class TrainerBatchesComponent implements OnInit {
  batches: any[] = [];
  loading = true;
  searchText = '';
  selectedFilter: BatchFilter = 'ALL';

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.loading = true;

    this.service.getBatches().subscribe({
      next: (res: any) => {
        this.batches = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.batches = [];
        this.loading = false;
      },
    });
  }

  get filteredBatches(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.batches.filter((batch) => {
      const status = String(batch.status || '').toUpperCase();
      const matchesFilter = this.selectedFilter === 'ALL' || status === this.selectedFilter;

      const searchable = [
        batch.name,
        batch.course,
        batch.status,
        batch.students,
        batch.zoomTime,
        batch.id,
      ]
        .join(' ')
        .toLowerCase();

      return matchesFilter && (!term || searchable.includes(term));
    });
  }

  get totalStudents(): number {
    return this.batches.reduce((sum, batch) => sum + Number(batch.students || 0), 0);
  }

  get activeBatches(): number {
    return this.batches.filter((batch) => String(batch.status || '').toUpperCase() === 'ACTIVE')
      .length;
  }

  get upcomingBatches(): number {
    return this.batches.filter((batch) => String(batch.status || '').toUpperCase() === 'UPCOMING')
      .length;
  }

  get completedBatches(): number {
    return this.batches.filter((batch) => String(batch.status || '').toUpperCase() === 'COMPLETED')
      .length;
  }

  getStatusLabel(status: string): string {
    return status ? String(status).replaceAll('_', ' ') : 'Not Set';
  }

  getStatusClass(status: string): string {
    return String(status || 'unknown').toLowerCase();
  }

  trackByBatchId(_: number, batch: any): any {
    return batch.id || batch.name;
  }
}
