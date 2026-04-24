import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class UsersService {

  private API = `${environment.apiUrl}/api/super-admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: any) {
    return this.http.get<any>(this.API, { params });
  }

  createUser(data: any) {
    return this.http.post(this.API, data);
  }

  toggleStatus(id: number) {
    return this.http.patch(`${this.API}/${id}/toggle`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
