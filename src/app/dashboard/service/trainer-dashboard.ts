import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainerDashboardService {

  private API = `${environment.apiUrl}/api/trainer`; // ✅ FIXED

  constructor(private http: HttpClient) { }

  // ✅ DASHBOARD
  getDashboardData() {
    return this.http.get(`${this.API}/dashboard`);
  }

  // ✅ CURRICULUM
  uploadCurriculum(formData: FormData) {
    return this.http.post(`${this.API}/upload-curriculum`, formData);
  }

  getCurriculum(batchId: number, courseId: string) {
    return this.http.get(`${this.API}/curriculum?batchId=${batchId}&courseId=${courseId}`);
  }

  // ✅ BATCHES
  getBatches() {
    return this.http.get(`${this.API}/batches`);
  }

  // ✅ STUDENTS
  getStudents() {
    return this.http.get(`${this.API}/students`);
  }

  // ✅ CONTENT (same as curriculum)
  getContent(batchId: number, courseId: string) {
    return this.getCurriculum(batchId, courseId);
  }
}