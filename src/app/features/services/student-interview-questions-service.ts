import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class StudentInterviewQuestionService {
  private API = `${environment.apiUrl}/api/student/interview-questions`;

  constructor(private http: HttpClient) {}

  list(filters: any = {}) {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<any>(this.API, { params });
  }
}
