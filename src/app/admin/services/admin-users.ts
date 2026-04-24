import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private API = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: any) {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] != null) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(this.API, { params: httpParams });
  }
}