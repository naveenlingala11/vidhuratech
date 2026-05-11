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
}
