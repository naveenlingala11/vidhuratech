import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-breadcrumb.html',
  styleUrls: ['./dashboard-breadcrumb.css']
})
export class DashboardBreadcrumb {

  breadcrumbs: { label: string, url: string }[] = [];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        const segments = this.router.url
          .split('/')
          .filter(s => s && isNaN(Number(s))); // remove IDs

        let path = '';

        this.breadcrumbs = segments.map(segment => {
          path += '/' + segment;

          return {
            label: this.formatLabel(segment),
            url: path
          };
        });

      });
  }

  formatLabel(value: string): string {
    return value
      .replace('-', ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}