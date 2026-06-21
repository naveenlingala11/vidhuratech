import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentMentorService {
  private API = `${environment.apiUrl}/api/student/mentors`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API}/dashboard`);
  }

  createBookingRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/booking-requests`, data);
  }

  getMyBookingRequests(): Observable<any> {
    return this.http.get<any>(`${this.API}/booking-requests`);
  }
}
