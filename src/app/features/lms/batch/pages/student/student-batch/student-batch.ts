import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentLmsService } from '../../../../services/student-lms.service';

@Component({
  standalone: true,
  selector: 'app-student-batches',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-batch.html',
  styleUrls: ['./student-batch.css']
})
export class StudentBatchesComponent implements OnInit {

  batches: any[] = [];

  constructor(
    private service: StudentLmsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.service.getBatches().subscribe({
      next: (res: any) => {
        this.batches = res.data || [];
        this.cdr.detectChanges();
      }
    });
  }
}