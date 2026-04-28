import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicCourseService {

  private API = `${environment.apiUrl}/api/public/courses`;

  constructor(private http: HttpClient) { }

  getCourses(isPreview = false) {
    return this.http.get<any>(`${this.API}?preview=${isPreview}`);
  }
}