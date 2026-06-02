import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminPublicPracticeService {
  private readonly baseUrl = `${environment.apiUrl}/api/admin/public-practice`;

  constructor(private http: HttpClient) {}

  getCandidates() {
    return this.http.get(`${this.baseUrl}/candidates`);
  }

  publishAssessment(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/assessments/${id}/publish`, payload);
  }

  unpublishAssessment(id: number) {
    return this.http.put(`${this.baseUrl}/assessments/${id}/unpublish`, {});
  }

  publishChallenge(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/challenges/${id}/publish`, payload);
  }

  unpublishChallenge(id: number) {
    return this.http.put(`${this.baseUrl}/challenges/${id}/unpublish`, {});
  }

  getAttempts() {
    return this.http.get(`${this.baseUrl}/attempts`);
  }

  getAssessmentAttempts(id: number) {
    return this.http.get(`${this.baseUrl}/assessments/${id}/attempts`);
  }

  getChallengeAttempts(id: number) {
    return this.http.get(`${this.baseUrl}/challenges/${id}/attempts`);
  }

  getAccessPolicies() {
    return this.http.get(`${this.baseUrl}/access-policies`);
  }

  publishInterviewQuestion(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/interview-questions/${id}/publish`, payload);
  }

  unpublishInterviewQuestion(id: number) {
    return this.http.put(`${this.baseUrl}/interview-questions/${id}/unpublish`, {});
  }

  bulkPublish(payload: any) {
    return this.http.put(`${this.baseUrl}/bulk/publish`, payload);
  }

  bulkUnpublish(payload: any) {
    return this.http.put(`${this.baseUrl}/bulk/unpublish`, payload);
  }
}
