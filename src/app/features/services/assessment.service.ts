import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IAssessment, IAssessmentResult } from '../assessments/models/assessment.model';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  createAssessment(payload: IAssessment): Observable<any> {
    return this.http.post(`${this.baseUrl}/trainer/assessments`, payload);
  }

  bulkUploadAssessments(payload: IAssessment): Observable<any> {
    return this.http.post(`${this.baseUrl}/trainer/assessments/bulk`, payload);
  }

  getTrainerAssessments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainer/assessments`);
  }

  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/trainer/assessments/${id}`);
  }

  getAssessmentResults(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainer/assessments/${id}/attempts`);
  }

  getAssessmentResultsDetailed(
    assessmentId: number,
    attemptId: number,
  ): Observable<IAssessmentResult> {
    return this.http.get<IAssessmentResult>(
      `${this.baseUrl}/trainer/assessments/${assessmentId}/attempts/${attemptId}`,
    );
  }

  getStudentAssessments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/student/assessments`);
  }

  getAssessmentById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/student/assessments/${id}`);
  }

  submitAssessment(assessmentId: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/student/assessments/${assessmentId}/submit`, payload);
  }

  getAssessmentAttemptResults(
    assessmentId: number,
    attemptId: number,
  ): Observable<IAssessmentResult> {
    return this.http.get<IAssessmentResult>(
      `${this.baseUrl}/student/assessments/${assessmentId}/attempts/${attemptId}`,
    );
  }

  getTrainerAssessmentDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainer/assessments/${id}`);
  }
}
