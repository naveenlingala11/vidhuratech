import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-batches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trainer-batches.html'
})
export class TrainerBatchesComponent implements OnInit {

  batches: any[] = [];
  loading = true;

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.service.getBatches().subscribe((res: any) => {
      this.batches = res.data;
      this.loading = false;
    });
  }
}