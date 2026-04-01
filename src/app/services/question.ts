import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private API = `${environment.apiUrl}/api/questions`;

  constructor(private http: HttpClient) {}

  getQuestions(
    company: string,
    role: string,
    search: string = '',
    page: number = 0,
    type?: string,
    difficulty?: string,
    topic?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('company', company)
      .set('role', role)
      .set('page', page);

    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (difficulty) params = params.set('difficulty', difficulty);
    if (topic) params = params.set('topic', topic);

    return this.http.get(this.API, { params });
  }
}