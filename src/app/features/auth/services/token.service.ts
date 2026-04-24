import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private TOKEN_KEY = 'vt_token';
  private USER_KEY = 'vt_user';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem(this.USER_KEY) || '{}');
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  clearAll(): void {
    this.clearToken();
    this.clearUser();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}