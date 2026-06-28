import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.authState = new BehaviorSubject<boolean>(this.tokenService.isLoggedIn());
    this.initActivityTracker();
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
      profileImageUrl: res.profileImageUrl || '',
    });
    this.authState.next(true);
    this.updateActivity();
  }

  logout() {
    this.tokenService.clearAll();
    this.authState.next(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('vt_last_active');
    }
  }

  private initActivityTracker() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.updateActivity();

    const events = ['mousemove', 'click', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.updateActivity());
    });

    setInterval(() => {
      if (this.isLoggedIn()) {
        const lastActive = Number(localStorage.getItem('vt_last_active') || '0');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (now - lastActive > oneHour) {
          this.logout();
          this.router.navigate(['/login']);
          alert('Session expired due to inactivity. Please login again.');
        }
      }
    }, 10000);
  }

  private updateActivity() {
    if (isPlatformBrowser(this.platformId) && this.isLoggedIn()) {
      localStorage.setItem('vt_last_active', Date.now().toString());
    }
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
