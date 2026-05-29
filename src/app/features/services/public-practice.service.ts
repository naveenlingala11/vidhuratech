import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PublicPracticeService {
  private readonly baseUrl = `${environment.apiUrl}/api/public/practice`;

  constructor(private http: HttpClient) {}

  getLibrary(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getLibraryByCompany(company: string): Observable<any> {
    return this.http.get(`${this.baseUrl}?company=${encodeURIComponent(company)}`);
  }

  getAssessment(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/assessments/${id}`);
  }

  submitAssessment(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/assessments/${id}/submit`, payload);
  }

  getChallenge(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/challenges/${id}`);
  }

  runChallenge(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/run`, payload);
  }

  saveLead(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lead`, payload);
  }

  registerAccess(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/access/register`, payload);
  }
}
