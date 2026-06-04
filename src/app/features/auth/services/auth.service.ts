import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API = `${environment.apiUrl}/api/auth`;
  authState: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {
    this.authState = new BehaviorSubject<boolean>(this.tokenService.isLoggedIn());
  }

  private authHeaders() {
    const token = this.tokenService.getToken();

    if (!token) {
      return null;
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  register(data: any) {
    return this.http
      .post<any>(`${this.API}/register`, data)
      .pipe(tap((res) => this.saveAuthUser(res)));
  }

  login(data: any) {
    return this.http
      .post<any>(`${this.API}/login`, data)
      .pipe(tap((res) => this.saveAuthUser(res)));
  }

  getProfile() {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => new Error('No auth token found'));
    }

    return this.http
      .get<any>(`${this.API}/me`, options)
      .pipe(tap((user) => this.tokenService.setUser(user)));
  }

  updateProfile(data: any) {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => new Error('No auth token found'));
    }

    return this.http
      .put<any>(`${this.API}/me`, data, options)
      .pipe(tap((user) => this.tokenService.setUser(user)));
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => new Error('No auth token found'));
    }

    return this.http.put<any>(`${this.API}/change-password`, data, options);
  }

  verifyPassword(data: { currentPassword: string }) {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => new Error('No auth token found'));
    }

    return this.http.post<any>(`${this.API}/verify-password`, data, options);
  }

  private saveAuthUser(res: any) {
    this.tokenService.setToken(res.token);
    this.tokenService.setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      phone: res.phone,
      role: res.role,
      active: res.active,
      firstLogin: res.firstLogin,
      notificationsEnabled: res.notificationsEnabled,
    });
    this.authState.next(true);
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
    return this.http
      .post<any>(`${this.API}/register/verify`, null, {
        params: { email, otp },
      })
      .pipe(tap((res) => this.saveAuthUser(res)));
  }

  completeLoginFromResponse(res: any): void {
    this.saveAuthUser(res);
  }

  googleLogin(idToken: string) {
    return this.http
      .post<any>(`${this.API}/oauth/google`, { idToken })
      .pipe(tap((res) => this.saveAuthUser(res)));
  }

  githubLogin(code: string, redirectUri: string) {
    return this.http
      .post<any>(`${this.API}/oauth/github`, { code, redirectUri })
      .pipe(tap((res) => this.saveAuthUser(res)));
  }

  sendPhoneOtp(phone: string) {
    return this.http.post<any>(`${this.API}/phone/send-otp`, { phone });
  }

  verifyPhoneOtp(phone: string, otp: string) {
    return this.http
      .post<any>(`${this.API}/phone/verify-otp`, { phone, otp })
      .pipe(tap((res) => this.saveAuthUser(res)));
  }
}
