import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-course-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-bulk-upload.html',
  styleUrls: ['./course-bulk-upload.css']
})
export class CourseBulkUploadComponent {

  jsonInput = '';
  preview: any[] = [];
  loading = false;
  result: any = null;

  constructor(private http: HttpClient) { }

  // 🔥 PREVIEW JSON
  parseJSON() {
    try {
      this.preview = JSON.parse(this.jsonInput);
    } catch {
      alert('❌ Invalid JSON');
      this.preview = [];
    }
  }

  // 🔥 UPLOAD
  upload() {
    if (!this.preview.length) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/api/lms/courses/bulk`, this.preview)
      .subscribe({
        next: (res: any) => {
          this.result = res.data;
          this.loading = false;
        },
        error: () => {
          alert('❌ Upload failed');
          this.loading = false;
        }
      });
  }
}