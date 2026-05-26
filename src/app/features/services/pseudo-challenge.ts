import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type CodeLanguage =
  | 'JAVA'
  | 'PYTHON'
  | 'C'
  | 'CPP'
  | 'CSHARP'
  | 'FSHARP'
  | 'PHP'
  | 'RUBY'
  | 'HASKELL'
  | 'GO'
  | 'RUST'
  | 'TYPESCRIPT';

export interface CodeSubmitPayload {
  language: CodeLanguage;
  sourceCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class PseudoChallengeService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  createTrainerChallenge(payload: any) {
    return this.http.post(`${this.baseUrl}/trainer/pseudo-challenges`, payload);
  }

  getTrainerChallenges() {
    return this.http.get(`${this.baseUrl}/trainer/pseudo-challenges`);
  }

  getTrainerChallengeDetails(id: number) {
    return this.http.get(`${this.baseUrl}/trainer/pseudo-challenges/${id}`);
  }

  getTrainerAttempts(id: number) {
    return this.http.get(`${this.baseUrl}/trainer/pseudo-challenges/${id}/attempts`);
  }

  getTrainerSubmissions() {
    return this.http.get(`${this.baseUrl}/trainer/pseudo-challenges/submissions`);
  }

  deleteTrainerChallenge(id: number) {
    return this.http.delete(`${this.baseUrl}/trainer/pseudo-challenges/${id}`);
  }

  getStudentChallenges() {
    return this.http.get(`${this.baseUrl}/student/pseudo-challenges`);
  }

  getStudentChallenge(id: number) {
    return this.http.get(`${this.baseUrl}/student/pseudo-challenges/${id}`);
  }

  submitStudentChallenge(id: number, payload: CodeSubmitPayload) {
    return this.http.post(`${this.baseUrl}/student/pseudo-challenges/${id}/submit`, payload);
  }

  updateTrainerChallenge(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/trainer/pseudo-challenges/${id}`, payload);
  }

  runStudentChallenge(id: number, payload: CodeSubmitPayload) {
    return this.http.post(`${this.baseUrl}/student/pseudo-challenges/${id}/run`, payload);
  }

  saveStudentChallenge(id: number, payload: CodeSubmitPayload) {
    return this.http.post(`${this.baseUrl}/student/pseudo-challenges/${id}/save`, payload);
  }

  createBulkTrainerChallenges(payload: any[]) {
    return this.http.post(`${this.baseUrl}/trainer/pseudo-challenges/bulk`, payload);
  }
}
