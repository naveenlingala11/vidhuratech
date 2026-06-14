import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private API = `${environment.apiUrl}/api/lms/courses`;
  private ADMIN_BATCH_API = `${environment.apiUrl}/api/lms/admin/batches`;
  private ADMIN_MANAGER_API = `${environment.apiUrl}/api/lms/admin/course-manager`;
  private USER_API = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}
  getCourses(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(this.API, { params: httpParams });
  }
  getCourseById(id: number): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }
  createCourse(payload: any): Observable<any> {
    return this.http.post(this.API, payload);
  }
  updateCourse(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, payload);
  }
  publishCourse(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/publish`, {});
  }
  archiveCourse(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/archive`, {});
  }
  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
  unpublishCourse(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/unpublish`, {});
  }
  uploadThumbnail(courseId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.API}/${courseId}/thumbnail`, formData);
  }
  getAdminBatches(params: any): Observable<any> {
    let httpParams = new HttpParams();

    Object.keys(params || {}).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(this.ADMIN_BATCH_API, { params: httpParams });
  }

  createBatch(payload: any): Observable<any> {
    return this.http.post(this.ADMIN_BATCH_API, payload);
  }

  updateBatch(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.ADMIN_BATCH_API}/${id}`, payload);
  }

  deleteBatch(id: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_BATCH_API}/${id}`);
  }

  getAllBatchesLite(): Observable<any> {
    return this.http.get(`${this.ADMIN_BATCH_API}/all-lite`);
  }

  getBatchCommunication(id: number): Observable<any> {
    return this.http.get(`${this.ADMIN_BATCH_API}/${id}/communication`);
  }

  updateBatchCommunication(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.ADMIN_BATCH_API}/${id}/communication`, payload);
  }

  shareBatchUpdate(batchId: number, payload: any): Observable<any> {
    return this.http.post(`${this.ADMIN_MANAGER_API}/batches/${batchId}/updates`, payload);
  }

  getAdminCurriculum(batchId: number): Observable<any> {
    return this.http.get(`${this.ADMIN_MANAGER_API}/batches/${batchId}/curriculum`);
  }

  saveAdminCurriculum(batchId: number, payload: any): Observable<any> {
    return this.http.put(`${this.ADMIN_MANAGER_API}/batches/${batchId}/curriculum`, payload);
  }

  getTrainers(): Observable<any> {
    return this.http.get(this.USER_API, {
      params: new HttpParams().set('role', 'TRAINER'),
    });
  }

  getPendingCurriculums(): Observable<any> {
    return this.http.get(`${this.ADMIN_MANAGER_API}/curriculums/pending`);
  }

  publishCurriculum(id: number): Observable<any> {
    return this.http.post(`${this.ADMIN_MANAGER_API}/curriculums/${id}/publish`, {});
  }
}
