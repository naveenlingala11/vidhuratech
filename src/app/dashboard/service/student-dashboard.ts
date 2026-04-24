import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentDashboardService {

  private API = `${environment.apiUrl}/api/student/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData() {
    return this.http.get(this.API);
  }
}