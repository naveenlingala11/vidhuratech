import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentProgressService {

  private API = `${environment.apiUrl}/api/student/progress`;

  constructor(private http: HttpClient) { }

  markCompleted(batchId: number, sessionId: number) {
    return this.http.post(`${this.API}/complete?batchId=${batchId}&sessionId=${sessionId}`, {});
  }

  updateResume(batchId: number, sessionId: number) {
    return this.http.post(`${this.API}/resume?batchId=${batchId}&sessionId=${sessionId}`, {});
  }

  getProgress(batchId: number) {
    return this.http.get(`${this.API}/batches/${batchId}/progress`);
  }

  getResume(batchId: number) {
    return this.http.get(`${this.API}/batches/${batchId}/resume`);
  }

  updateResumeWithTime(batchId: number, sessionId: number, time: number) {
    return this.http.post(
      `${this.API}/resume-time?batchId=${batchId}&sessionId=${sessionId}&time=${time}`,
      {}
    );
  }
}