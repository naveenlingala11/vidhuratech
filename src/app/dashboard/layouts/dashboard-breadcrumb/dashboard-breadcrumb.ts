import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
@Component({
  selector: 'app-dashboard-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-breadcrumb.html',
  styleUrls: ['./dashboard-breadcrumb.css']
})
export class DashboardBreadcrumb {
  breadcrumbs: { label: string, url: string }[] = [];
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter( event => event instanceof NavigationEnd ))
      .subscribe(() => { this.buildBreadcrumbs(); 
      });
  }
  buildBreadcrumbs() {
    const role = this.authService.getUser()?.role?.toLowerCase();
    /* REMOVE IDS */
    const segments = this.router.url
      .split('/')
      .filter(s => s && isNaN(Number(s))
    );
    /* REMOVE dashboard + role */
    const filtered = segments.filter(
      s => s !== 'dashboard' && s !== role
    );
    /* START */
    this.breadcrumbs = [
      {
        label: 'Dashboard',
        url: `/dashboard/${role}`
      }
    ];
    let path = `/dashboard/${role}`;
    filtered.forEach(segment => {
      path += `/${segment}`;
      this.breadcrumbs.push({
        label: this.formatLabel(segment),
        url: path
      });
    });
  }
  formatLabel(value: string): string {
    return value
      .replace(/-/g, ' ') 
      .replace(
        /\b\w/g,
        c => c.toUpperCase()
      );
  }
}