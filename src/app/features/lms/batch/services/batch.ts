import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class BatchService {

  private API = `${environment.apiUrl}/api/lms/batches`;

  constructor(private http: HttpClient) { }

  getBatchById(id: number) {
    return this.http.get(`${this.API}/${id}`);
  }

  getActiveBatch(courseId: number) {
    return this.http.get(`${this.API}/course/${courseId}/active`);
  }

  getSessions(batchId: number) {
    return this.http.get(`${this.API}/${batchId}/sessions`);
  }

  createSession(batchId: number, payload: any) {
    return this.http.post(`${this.API}/${batchId}/sessions`, payload);
  }

  publishSession(batchId: number, sessionId: number) {
    return this.http.patch(
      `${this.API}/${batchId}/sessions/${sessionId}/publish`,
      {}
    );
  }

  unpublishSession(batchId: number, sessionId: number) {
    return this.http.patch(
      `${this.API}/${batchId}/sessions/${sessionId}/unpublish`,
      {}
    );
  }

  deleteSession(batchId: number, sessionId: number) {
    return this.http.delete(
      `${this.API}/${batchId}/sessions/${sessionId}`
    );
  }
  
}