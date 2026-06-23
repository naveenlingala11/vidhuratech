import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class StudentWorkflowService {
  private API = `${environment.apiUrl}/api/student`;
  constructor(private http: HttpClient) { }
  getWorkItems() {
    return this.http.get(`${this.API}/work-items`);
  }
  requestMockInterview(payload: any) {
    return this.http.post(`${this.API}/mock-interviews`, payload);
  }
  getMockInterviews() {
    return this.http.get(`${this.API}/mock-interviews`);
  }
  checkPublicSessionStatus(id: number) {
    return this.http.get(`${environment.apiUrl}/api/public/mock-interviews/check/${id}`);
  }
  createPublicSession(payload: any) {
    return this.http.post(`${environment.apiUrl}/api/public/mock-interviews/create`, payload);
  }
  updatePublicSession(id: number, payload: any) {
    return this.http.patch(`${environment.apiUrl}/api/public/mock-interviews/${id}`, payload);
  }
  getOrCreatePublicSession(payload: any) {
    return this.http.post(`${environment.apiUrl}/api/public/mock-interviews/get-or-create`, payload);
  }
  logSessionJoin(id: number, payload: any) {
    return this.http.post(`${environment.apiUrl}/api/public/mock-interviews/${id}/join`, payload);
  }
}
