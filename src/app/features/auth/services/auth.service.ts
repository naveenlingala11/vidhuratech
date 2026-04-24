import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private API = `${environment.apiUrl}/api/auth`;
  authState!: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.authState = new BehaviorSubject<boolean>(
      this.tokenService.isLoggedIn()
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.API}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => {
        this.tokenService.setToken(res.token);

        this.tokenService.setUser({
          name: res.name,
          role: res.role,
        });

        this.authState.next(true);
      })
    );
  }

  logout() {
    this.tokenService.clearAll();
    this.authState.next(false);
  }

  isLoggedIn() {
    return this.tokenService.isLoggedIn();
  }

  getUser() {
    return this.tokenService.getUser();
  }

  initRegister(data: any) {
    return this.http.post(`${this.API}/register/init`, data);
  }

  verifyRegister(email: string, otp: string) {
    return this.http.post(`${this.API}/register/verify`, null, {
      params: { email, otp }
    });
  }

}