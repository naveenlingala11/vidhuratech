import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardThemeService {

  private key = 'dashboard_theme';

  constructor() {
    this.loadTheme();
  }

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';

    localStorage.setItem(this.key, next);
    this.applyTheme(next);
  }

  getTheme(): string {
    return localStorage.getItem(this.key) || 'light';
  }

  loadTheme() {
    this.applyTheme(this.getTheme());
  }

  private applyTheme(theme: string) {
    document.body.setAttribute('data-theme', theme);
  }
}