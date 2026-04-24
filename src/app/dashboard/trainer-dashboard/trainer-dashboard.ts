import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerDashboardService } from '../service/trainer-dashboard';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-dashboard.html',
  styleUrls: ['./trainer-dashboard.css']
})
export class TrainerDashboard implements OnInit {

  loading = true;

  stats = {
    assignedBatches: 0,
    totalStudents: 0,
    pendingReviews: 0,
    todaysSessions: 0,
    avgAttendance: 0,
    assignmentsSubmitted: 0
  };

  upcomingSessions: any[] = [];
  studentActivities: any[] = [];
  batches: any[] = [];

  constructor(
    private trainerService: TrainerDashboardService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.trainerService.getDashboardData().subscribe({
      next: (res: any) => {
        this.stats = res.data.stats;
        this.batches = res.data.sections.batches;
        this.upcomingSessions = res.data.sections.upcomingSessions;
        this.studentActivities = res.data.sections.studentActivities;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Curriculam

  selectedBatchId: any;
  selectedCourseId: any;
  selectedFile!: File;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadCurriculum() {
    if (!this.selectedFile || !this.selectedBatchId || !this.selectedCourseId) {
      alert('Select all fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('batchId', this.selectedBatchId);
    formData.append('courseId', this.selectedCourseId);

    this.trainerService.uploadCurriculum(formData).subscribe({
      next: () => alert('Uploaded successfully'),
      error: () => alert('Upload failed')
    });
  }
}