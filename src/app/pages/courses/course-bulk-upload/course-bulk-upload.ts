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

  jsonError = '';
  validationErrors: string[] = [];
  successMessage = '';
  errorMessage = '';

  sampleJSON = `[
  {
    "title": "Introduction to Angular",
    "code": "ANG-101",
    "description": "Learn the basics of Angular, components, directives, and routing.",
    "level": "BEGINNER",
    "status": "PUBLISHED",
    "durationHours": 24,
    "price": 199.99
  },
  {
    "title": "Advanced TypeScript Design Patterns",
    "code": "TS-301",
    "description": "Master advanced TypeScript types, generics, and architectural patterns.",
    "level": "ADVANCED",
    "status": "PUBLISHED",
    "durationHours": 32,
    "price": 299.99
  },
  {
    "title": "Fullstack Spring Boot & React",
    "code": "FSD-202",
    "description": "Build modern enterprise web applications with Spring Boot backend and React SPA frontend.",
    "level": "INTERMEDIATE",
    "status": "DRAFT",
    "durationHours": 45,
    "price": 349.50
  }
]`;

  constructor(private http: HttpClient) { }

  // 📝 LOAD SAMPLE TEMPLATE
  loadSample() {
    this.jsonInput = this.sampleJSON;
    this.parseJSON();
  }

  // 🧹 CLEAR PANEL
  clearInput() {
    this.jsonInput = '';
    this.preview = [];
    this.jsonError = '';
    this.validationErrors = [];
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // 📋 COPY SAMPLE
  copyTemplate() {
    navigator.clipboard.writeText(this.sampleJSON).then(() => {
      this.successMessage = 'Sample JSON copied to clipboard!';
      setTimeout(() => {
        if (this.successMessage === 'Sample JSON copied to clipboard!') {
          this.successMessage = '';
        }
      }, 3000);
    }).catch(() => {
      this.errorMessage = 'Failed to copy to clipboard.';
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  // 🔍 PARSE & SEMANTICALLY VALIDATE JSON
  parseJSON() {
    this.jsonError = '';
    this.validationErrors = [];
    this.preview = [];
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.jsonInput.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(this.jsonInput);
      if (!Array.isArray(parsed)) {
        this.jsonError = 'JSON input must be a valid array of course objects.';
        return;
      }

      const errors: string[] = [];
      parsed.forEach((course: any, idx: number) => {
        const itemNum = idx + 1;
        if (!course.title || typeof course.title !== 'string' || !course.title.trim()) {
          errors.push(`Course #${itemNum}: "title" is required and must be a string.`);
        }
        if (!course.code || typeof course.code !== 'string' || !course.code.trim()) {
          errors.push(`Course #${itemNum}: "code" is required and must be a string.`);
        }
        if (course.level && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(course.level)) {
          errors.push(`Course #${itemNum}: "level" must be one of: 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'.`);
        } else if (!course.level) {
          errors.push(`Course #${itemNum}: "level" is required ('BEGINNER', 'INTERMEDIATE', or 'ADVANCED').`);
        }
        if (course.price !== undefined && (typeof course.price !== 'number' || course.price < 0)) {
          errors.push(`Course #${itemNum}: "price" must be a non-negative number.`);
        }
        if (course.durationHours !== undefined && (typeof course.durationHours !== 'number' || course.durationHours < 0)) {
          errors.push(`Course #${itemNum}: "durationHours" must be a non-negative number.`);
        }
      });

      if (errors.length > 0) {
        this.validationErrors = errors;
      } else {
        this.preview = parsed;
      }
    } catch (e: any) {
      this.jsonError = 'Invalid JSON: ' + (e.message || 'Syntax error.');
    }
  }

  // 🚀 BULK UPLOAD COURSES
  upload() {
    if (this.jsonError || this.validationErrors.length || !this.preview.length) {
      return;
    }
    this.loading = true;
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/api/lms/courses/bulk`, this.preview)
      .subscribe({
        next: (res: any) => {
          this.result = res.data || res;
          this.loading = false;
          this.successMessage = `Successfully processed ${this.preview.length} courses!`;
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Upload failed. Please check the backend connection or JSON values.';
        }
      });
  }
}