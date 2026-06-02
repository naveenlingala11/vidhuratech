import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentInterviewQuestionService {
  private readonly API = `${environment.apiUrl}/api/student/interview-questions`;

  constructor(private http: HttpClient) {}

  list(filters: any = {}) {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params = params.set(key, String(value).trim());
      }
    });

    return this.http.get<any>(this.API, { params });
  }
}
