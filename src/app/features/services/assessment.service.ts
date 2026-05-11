import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  // TRAINER

  createAssessment(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/trainer/assessments`,
      payload
    );
  }

  getTrainerAssessments(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/trainer/assessments`
    );
  }

  getAssessmentResults(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/trainer/assessments/${id}/attempts`
    );
  }

  // STUDENT

  getStudentAssessments(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/student/assessments`
    );
  }

  getAssessmentById(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/student/assessments/${id}`
    );
  }

  submitAssessment(
    assessmentId: number,
    payload: any
  ): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/student/assessments/${assessmentId}/submit`,
      payload
    );
  }
}