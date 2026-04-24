import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private API = `${environment.apiUrl}/api/lms/courses`;

  constructor(private http: HttpClient) { }

  getCourses(params: any): Observable<any> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
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
}