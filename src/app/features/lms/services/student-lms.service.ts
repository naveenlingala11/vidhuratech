import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentLmsService {

  private API = `${environment.apiUrl}/api/student/lms`;

  constructor(private http: HttpClient) { }

  getBatches() {
    return this.http.get(`${this.API}/batches`);
  }

  getSessions(batchId: number) {
    return this.http.get(`${this.API}/batches/${batchId}/sessions`);
  }

  getCurriculum(batchId: number) {
    return this.http.get(`${this.API}/batches/${batchId}/curriculum`);
  }
}