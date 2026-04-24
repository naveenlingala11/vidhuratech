import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminBatchService {

  private API = `${environment.apiUrl}/api/lms/admin/batches`;
  private COURSE_API = `${environment.apiUrl}/api/lms/courses`;
  private USER_API = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) { }

  // ================= GET BATCHES =================
  getBatches(params: any) {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] != null) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(this.API, { params: httpParams });
  }

  // ================= CREATE =================
  createBatch(payload: any) {
    return this.http.post(this.API, payload);
  }

  // ================= UPDATE =================
  updateBatch(id: number, payload: any) {
    return this.http.put(`${this.API}/${id}`, payload);
  }

  // ================= DELETE =================
  deleteBatch(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }

  // ================= DROPDOWNS =================

  // Courses list
  getCourses() {
    return this.http.get(`${this.COURSE_API}`);
  }

  // Trainers list (filter by role if needed)
  getTrainers() {
    let params = new HttpParams().set('role', 'TRAINER');
    return this.http.get(`${this.USER_API}`, { params });
  }
}