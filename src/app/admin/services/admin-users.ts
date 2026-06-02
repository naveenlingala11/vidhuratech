import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private API = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: any) {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.API}/advanced`, { params: httpParams });
  }

  getPeople360(keyword = '') {
    let params = new HttpParams();

    if (keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http.get(`${this.API}/people-360`, { params });
  }

  getPersonHistory(key: string) {
    return this.http.get(`${this.API}/people-360/${encodeURIComponent(key)}/history`);
  }

  getUserStats() {
    return this.http.get(`${this.API}/stats`);
  }

  updateUser(id: number, payload: any) {
    return this.http.put(`${this.API}/${id}`, payload);
  }

  updateStatus(id: number, active: boolean) {
    return this.http.patch(`${this.API}/${id}/status`, { active });
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }

  restoreUser(id: number) {
    return this.http.patch(`${this.API}/${id}/restore`, {});
  }
}
