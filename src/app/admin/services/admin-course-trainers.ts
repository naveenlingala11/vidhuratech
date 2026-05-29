import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminCourseTrainerService {
  private readonly baseUrl = `${environment.apiUrl}/api/admin/course-trainers`;
  private readonly monthlyBatchUrl = `${environment.apiUrl}/api/admin/monthly-batches`;

  constructor(private http: HttpClient) {}

  getTrainers() {
    return this.http.get(`${this.baseUrl}/trainers`);
  }

  getAssignments() {
    return this.http.get(`${this.baseUrl}/assignments`);
  }

  assignTrainer(payload: { courseId: number; trainerId: number }) {
    return this.http.post(`${this.baseUrl}/assign`, payload);
  }

  deactivateAssignment(id: number) {
    return this.http.put(`${this.baseUrl}/assignments/${id}/deactivate`, {});
  }

  generateCurrentMonth() {
    return this.http.post(`${this.monthlyBatchUrl}/generate-current`, {});
  }

  generateNextMonth() {
    return this.http.post(`${this.monthlyBatchUrl}/generate-next`, {});
  }
}