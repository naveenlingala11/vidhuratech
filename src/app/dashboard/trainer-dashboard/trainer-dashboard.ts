import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    private trainerService: TrainerDashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.trainerService.getDashboardData().subscribe({
      next: (res: any) => {

        setTimeout(() => {   // ✅ FIX
          this.stats = res.data.stats;
          this.cdr.detectChanges();
          this.batches = res.data.sections.batches;
          this.upcomingSessions = res.data.sections.upcomingSessions;
          this.studentActivities = res.data.sections.studentActivities;
          this.loading = false;
        });

      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Curriculam

  selectedBatchId: any;
  selectedFile!: File;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadCurriculum() {
    if (!this.selectedFile || !this.selectedBatchId) {
      alert('Select all fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('batchId', this.selectedBatchId);

    this.trainerService.uploadCurriculum(formData).subscribe({
      next: () => alert('Uploaded successfully'),
      error: () => alert('Upload failed')
    });
  }
  showPopup = false;
  mode: 'file' | 'paste' = 'file';
  jsonText = '';

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  submit() {

    console.log("🚀 Submit clicked");
    console.log("📦 Mode:", this.mode);
    console.log("📦 BatchId:", this.selectedBatchId);
    console.log("📦 Raw JSON:", this.jsonText);

    if (!this.selectedBatchId) {
      alert('Select batch');
      return;
    }

    // FILE MODE
    if (this.mode === 'file') {

      console.log("📁 FILE MODE");

      if (!this.selectedFile) {
        alert('Select file');
        return;
      }

      console.log("📁 File:", this.selectedFile.name);

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('batchId', this.selectedBatchId);

      this.trainerService.uploadCurriculum(formData).subscribe({
        next: (res) => {
          console.log("✅ File upload success:", res);
          alert('Uploaded successfully');
          this.closePopup();
        },
        error: (err) => {
          console.error("❌ File upload error:", err);
          alert('Upload failed');
        }
      });
    }

    // JSON MODE
    if (this.mode === 'paste') {

      console.log("📝 JSON MODE");

      try {

        const parsed = JSON.parse(this.jsonText);
        console.log("✅ Parsed JSON:", parsed);

        const cleanJson = JSON.stringify(parsed);
        console.log("✅ Clean JSON:", cleanJson);

        const payload = {
          batchId: this.selectedBatchId,
          json: cleanJson
        };

        console.log("📤 Sending payload:", payload);

        this.trainerService.uploadJsonCurriculum(payload).subscribe({
          next: (res) => {
            console.log("✅ Backend success:", res);
            alert('Saved successfully');
            this.closePopup();
          },
          error: (err) => {
            console.error("❌ Backend error:", err);
            alert('Invalid JSON (backend rejected)');
          }
        });

      } catch (e) {
        console.error("❌ JSON PARSE ERROR:", e);
        alert('Invalid JSON format (frontend)');
      }
    }
  }
}