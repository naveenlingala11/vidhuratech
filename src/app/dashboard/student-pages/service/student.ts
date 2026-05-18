import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private api = `${environment.apiUrl}/api/student`;
  private certificateApi = `${environment.apiUrl}/certificates`;
  constructor(private http: HttpClient) {}
  getDashboard() {
    return this.http.get(`${this.api}/dashboard`);
  }
  getCourses() {
    return this.http.get(`${this.api}/courses`);
  }
  getAssignments() {
    return this.http.get(`${this.api}/assignments`);
  }
  getCertificates(email?: string) {
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    return this.http.get(`${this.certificateApi}/student`, { params });
  }
  generateCertificateForCourse(payload: any) {
    return this.http.post(`${this.certificateApi}/student/generate`, payload);
  }
  sendCertificateToEmail(id: string) {
    return this.http.post(`${this.certificateApi}/${id}/send-email`, {});
  }
  getCurriculum(batchId: number) {
    return this.http.get(`${this.api}/batches/${batchId}/curriculum`);
  }
}