import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminDashboardService {

  private API = `${environment.apiUrl}/api/dashboard/super-admin`;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(this.API);
  }
}