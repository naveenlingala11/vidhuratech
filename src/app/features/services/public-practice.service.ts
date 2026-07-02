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

  runChallengeCustom(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/run-custom`, payload);
  }

  reviewChallenge(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/review`, payload);
  }

  getChallengeAiHints(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/ai-hints`, payload);
  }

  saveLead(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lead`, payload);
  }

  registerAccess(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/access/register`, payload);
  }

  getChallengeLeaderboard(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/challenges/${id}/leaderboard`);
  }

  getDailyLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard/daily`);
  }

  getWeeklyLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard/weekly`);
  }

  getMonthlyLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard/monthly`);
  }

  getOverallLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard/overall`);
  }

  getContestAnnouncements(): Observable<any> {
    return this.http.get(`${this.baseUrl}/announcements`);
  }

  registerAuthenticatedAccess(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/access/session`, payload);
  }

  getChallengeDiscussions(id: number, payload: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/discussions`, payload);
  }

  postChallengeDiscussion(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/challenges/${id}/discussions/post`, payload);
  }

  toggleChallengeDiscussionLike(id: number, discussionId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/challenges/${id}/discussions/${discussionId}/like`,
      payload,
    );
  }

  reportChallengeDiscussion(id: number, discussionId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/challenges/${id}/discussions/${discussionId}/report`,
      payload,
    );
  }

  blockChallengeDiscussionAuthor(id: number, discussionId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/challenges/${id}/discussions/${discussionId}/block`,
      payload,
    );
  }

  getChallengeBestSubmissions(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/challenges/${id}/best-submissions`);
  }

  getMyPlanAccess(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/public/plans/my-access`);
  }
}
