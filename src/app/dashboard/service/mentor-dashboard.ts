import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MentorDashboardService {
  private API = `${environment.apiUrl}/api/mentor/profile/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.API);
  }

  saveAvailability(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/mentor/profile/availability`, data);
  }

  scheduleSession(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/mentor/profile/sessions`, data);
  }

  submitFeedback(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/mentor/profile/feedback`, data);
  }

  getBookingRequests(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/mentor/profile/booking-requests`);
  }

  acceptBookingRequest(id: number, note: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/mentor/profile/booking-requests/${id}/accept`, { note });
  }

  rejectBookingRequest(id: number, note: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/mentor/profile/booking-requests/${id}/reject`, { note });
  }
}