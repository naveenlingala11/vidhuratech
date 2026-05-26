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
