import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-content.html'
})
export class TrainerContentComponent {

  batchId!: number;
  courseId!: string;

  content: any;

  constructor(private service: TrainerDashboardService) {}

  load() {
    this.service.getContent(this.batchId, this.courseId)
      .subscribe((res: any) => {
        this.content = res.jsonData
          ? JSON.parse(res.jsonData)
          : null;
      });
  }
}