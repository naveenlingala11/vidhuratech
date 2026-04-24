import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BatchEnrollmentService {

  private API = `${environment.apiUrl}/api/lms/batches`;

  constructor(private http: HttpClient) {}

  getBatch(id: number) {
    return this.http.get(`${this.API}/${id}`);
  }

  getEnrollments(batchId: number) {
    return this.http.get(`${this.API}/${batchId}/enrollments`);
  }

  enrollStudent(batchId: number, studentId: number) {
    return this.http.post(`${this.API}/${batchId}/enrollments`, {
      studentId
    });
  }

  removeEnrollment(enrollmentId: number) {
    return this.http.delete(`${this.API}/enrollments/${enrollmentId}`);
  }

  searchStudents(keyword: string) {
    const params = new HttpParams().set('keyword', keyword);

    return this.http.get(
      `${environment.apiUrl}/api/users/students/search`,
      { params }
    );
  }
}