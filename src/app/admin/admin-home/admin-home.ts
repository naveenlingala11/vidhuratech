import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  leads: number;
  revenue: number;
  jobs: number;
  certificates: number;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHomeComponent implements OnInit {

  darkMode = false;
  loading = false;

  stats: DashboardStats = {
    leads: 0,
    revenue: 0,
    jobs: 0,
    certificates: 0
  };

  extraStats = {
    companies: 0,
    deletedLeads: 0,
    todayFollowups: 0,
    conversionRate: 0
  };

  recentActivities: string[] = [];

  modules = [
    { title: 'Leads', icon: '📋', route: '/admin/leads' },
    { title: 'Bin', icon: '🗑️', route: '/admin/bin' },
    { title: 'Jobs', icon: '💼', route: '/admin/jobs' },
    { title: 'Companies', icon: '🏢', route: '/admin/companies' },
    { title: 'Certificates', icon: '🎓', route: '/admin/certificates' },
    { title: 'Interview Prep', icon: '🧠', route: '/admin/questions' },
    { title: 'Invoices', icon: '🧾', route: '/admin/invoice' },
    { title: 'Analytics', icon: '📊', route: '/invoice-analytics' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  refreshInterval: any;

  ngOnInit(): void {
    this.loadDashboardData();

    this.refreshInterval = setInterval(() => {
      this.loadDashboardData(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  loadDashboardData(showLoader: boolean = true): void {
    if (showLoader) this.loading = true;

    this.loadLeadStats();
    this.loadRevenueStats();
    this.loadJobStats();
    this.loadCertificateStats();
    this.loadCompanyStats();
    this.loadBinStats();
    this.loadRecentActivities();

    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  loadLeadStats(): void {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`)
      .subscribe(res => {
        this.animateCounter('leads', res.total || 0);

        this.extraStats.conversionRate =
          res.total > 0
            ? Math.round((res.joined / res.total) * 100)
            : 0;
        this.extraStats.todayFollowups = res.todayFollowups || 0;

      });
  }

  loadRevenueStats(): void {
    this.http.get<any>(`${environment.apiUrl}/invoices/analytics/summary`)
      .subscribe(res => {
        this.animateCounter('revenue', res.totalRevenue || 0);
      });
  }

  loadJobStats(): void {
    this.http.get<any[]>(`${environment.apiUrl}/jobs/all`)
      .subscribe(res => {
        this.animateCounter('jobs', res.length || 0);
      });
  }

  loadCertificateStats(): void {
    this.http.get<any[]>(`${environment.apiUrl}/certificates/all`)
      .subscribe(res => {
        this.animateCounter('certificates', res.length || 0);
      });
  }

  loadCompanyStats(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/companies?page=0&size=1`)
      .subscribe(res => {
        this.extraStats.companies = res.totalElements || 0;
      });
  }

  loadBinStats(): void {
    this.http.get<any>(`${environment.apiUrl}/api/leads/bin?page=0&size=1`)
      .subscribe(res => {
        this.extraStats.deletedLeads = res.totalElements || 0;
      });
  }

  loadRecentActivities(): void {
    this.recentActivities = [
      'New Lead Added',
      'Invoice Payment Received',
      'Certificate Generated',
      'Job Posted Successfully',
      'Company Added To Portal'
    ];
  }

  animateCounter(
    key: keyof DashboardStats,
    target: number
  ): void {
    const duration = 800;
    const steps = 40;

    const start = this.stats[key];
    const increment = (target - start) / steps;

    let current = start;

    const interval = setInterval(() => {
      current += increment;

      if (
        (increment >= 0 && current >= target) ||
        (increment < 0 && current <= target)
      ) {
        this.stats[key] = target;
        clearInterval(interval);
      } else {
        this.stats[key] = Math.floor(current);
      }

    }, duration / steps);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  get activeModules(): number {
    return this.modules.length;
  }
  get revenueGrowth(): number {
    return 18.6;
  }
}