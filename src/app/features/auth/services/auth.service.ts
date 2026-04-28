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
    private tokenService: TokenService
  ) {
    this.authState = new BehaviorSubject<boolean>(
      this.tokenService.isLoggedIn()
    );
  }

  private authHeaders() {
    const token = this.tokenService.getToken();

    if (!token) {
      return null;
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  register(data: any) {
    return this.http.post<any>(`${this.API}/register`, data).pipe(
      tap(res => this.saveAuthUser(res))
    );
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => this.saveAuthUser(res))
    );
  }

  getProfile() {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => ({ status: 401, message: 'No token found' }));
    }

    return this.http.get<any>(`${this.API}/me`, options).pipe(
      tap(user => this.tokenService.setUser(user))
    );
  }

  updateProfile(data: any) {
    const options = this.authHeaders();

    if (!options) {
      return throwError(() => ({ status: 401, message: 'No token found' }));
    }

    return this.http.put<any>(`${this.API}/me`, data, options).pipe(
      tap(user => this.tokenService.setUser(user))
    );
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
      firstLogin: res.firstLogin
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
    return this.http.post<any>(`${this.API}/register/verify`, null, {
      params: { email, otp }
    }).pipe(
      tap(res => this.saveAuthUser(res))
    );
  }
}
