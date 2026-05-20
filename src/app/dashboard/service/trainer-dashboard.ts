import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainerDashboardService {
  private API = `${environment.apiUrl}/api/trainer`;

  constructor(private http: HttpClient) {}

  getDashboardData() {
    return this.http.get(`${this.API}/dashboard`);
  }

  uploadCurriculum(formData: FormData) {
    return this.http.post(`${this.API}/upload-curriculum`, formData);
  }

  uploadJsonCurriculum(payload: any) {
    return this.http.post(`${this.API}/upload-json-curriculum`, payload);
  }

  getCurriculum(batchId: number) {
    return this.http.get(`${this.API}/curriculum?batchId=${batchId}`);
  }

  getBatches() {
    return this.http.get(`${this.API}/batches`);
  }

  getStudents() {
    return this.http.get(`${this.API}/students`);
  }

  getMockInterviewRequests() {
    return this.http.get(`${this.API}/mock-interviews`);
  }

  updateMockInterview(id: number, payload: any) {
    return this.http.patch(`${this.API}/mock-interviews/${id}`, payload);
  }

  createWorkItem(payload: any) {
    return this.http.post(`${this.API}/work-items`, payload);
  }

  getWorkItems() {
    return this.http.get(`${this.API}/work-items`);
  }

  getSubmissions() {
    return this.http.get(`${this.API}/submissions`);
  }

  reviewSubmission(id: number, payload: any) {
    return this.http.patch(`${this.API}/submissions/${id}/review`, payload);
  }

  getContent() {
    return this.http.get(`${this.API}/content`);
  }

  uploadContent(formData: FormData) {
    return this.http.post(`${this.API}/content`, formData);
  }
}