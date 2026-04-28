import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AdminDashboardService } from '../service/admin-dashboard';

interface DashboardStats {
  leads: number;
  revenue: number;
  jobs: number;
  certificates: number;
  totalUsers: number;
  totalStudents: number;
  trainers: number;
  admins: number;
  mentors: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit, OnDestroy {
  loading = true;
  darkMode = false;
  moduleSearch = '';

  stats: DashboardStats = {
    leads: 0,
    revenue: 0,
    jobs: 0,
    certificates: 0,
    totalUsers: 0,
    totalStudents: 0,
    trainers: 0,
    admins: 0,
    mentors: 0
  };

  extraStats = {
    companies: 0,
    deletedLeads: 0,
    todayFollowups: 0,
    conversionRate: 0
  };

  recentActivities: string[] = [];

  modules = [
    { title: 'Leads', code: 'LD', route: '/admin/leads', desc: 'Manage enquiries, follow-ups, and conversions', accent: 'teal' },
    { title: 'Lead Bin', code: 'BN', route: '/admin/bin', desc: 'Review and restore deleted lead records', accent: 'rose' },
    { title: 'Jobs', code: 'JB', route: '/admin/jobs', desc: 'Publish and manage job openings', accent: 'blue' },
    { title: 'Companies', code: 'CO', route: '/admin/companies', desc: 'Maintain hiring company directory', accent: 'gold' },
    { title: 'Certificates', code: 'CR', route: '/admin/certificates', desc: 'Generate and manage certificates', accent: 'violet' },
    { title: 'Interview Prep', code: 'IP', route: '/admin/questions', desc: 'Manage question bank and preparation content', accent: 'cyan' },
    { title: 'Invoices', code: 'IV', route: '/admin/invoice', desc: 'Create invoices and payment records', accent: 'green' },
    { title: 'Analytics', code: 'AN', route: '/invoice-analytics', desc: 'Track revenue, trends, and reports', accent: 'orange' }
  ];

  refreshInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dashboardService: AdminDashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();

    this.refreshInterval = setInterval(() => {
      this.loadDashboard(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  loadDashboard(showLoader: boolean = true) {
    if (showLoader) this.loading = true;

    this.loadLeadStats();
    this.loadRevenueStats();
    this.loadJobStats();
    this.loadCertificateStats();
    this.loadCompanyStats();
    this.loadBinStats();
    this.loadRoleStats();
    this.loadRecentActivities();

    setTimeout(() => {
      this.loading = false;
    }, 700);
  }

  loadRoleStats() {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.stats.totalUsers = res.totalUsers || 0;
        this.stats.totalStudents = res.totalStudents || 0;
        this.stats.trainers = res.trainers || 0;
        this.stats.admins = res.admins || 0;
        this.stats.mentors = res.mentors || 0;
      },
      error: () => { }
    });
  }

  loadLeadStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`).subscribe({
      next: (res) => {
        this.stats.leads = res.total || 0;
        this.cdr.detectChanges();
        this.extraStats.conversionRate =
          res.total > 0 ? Math.round((res.joined / res.total) * 100) : 0;
        this.extraStats.todayFollowups = res.todayFollowups || 0;
      },
      error: () => { }
    });
  }

  loadRevenueStats() {
    this.http.get<any>(`${environment.apiUrl}/invoices/analytics/summary`).subscribe({
      next: (res) => {
        this.stats.revenue = res.totalRevenue || 0;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  loadJobStats() {
    this.http.get<any>(`${environment.apiUrl}/jobs?page=0&size=100`).subscribe({
      next: (res) => {
        this.stats.jobs = res?.content?.length || 0;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  loadCertificateStats() {
    this.http.get<any[]>(`${environment.apiUrl}/certificates`).subscribe({
      next: (res) => {
        this.stats.certificates = res.length || 0;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  loadCompanyStats() {
    this.http.get<any>(`${environment.apiUrl}/admin/companies?page=0&size=1`).subscribe({
      next: (res) => {
        this.extraStats.companies = res.totalElements || 0;
      },
      error: () => { }
    });
  }

  loadBinStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/bin?page=0&size=1`).subscribe({
      next: (res) => {
        this.extraStats.deletedLeads = res.totalElements || 0;
      },
      error: () => { }
    });
  }

  loadRecentActivities() {
    this.recentActivities = [
      'New lead enquiry captured',
      'Invoice payment updated',
      'Certificate generated successfully',
      'New job opening published',
      'Company profile added'
    ];
  }

  animateCounter(key: keyof DashboardStats, target: number) {
    const duration = 700;
    const steps = 35;
    const start = this.stats[key];
    const increment = (target - start) / steps;
    let current = start;

    const interval = setInterval(() => {
      current += increment;

      if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
        this.stats[key] = target;
        clearInterval(interval);
      } else {
        this.stats[key] = Math.floor(current);
      }
    }, duration / steps);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
  }

  refreshDashboard() {
    this.loadDashboard();
  }

  get filteredModules() {
    const search = this.moduleSearch.trim().toLowerCase();

    if (!search) {
      return this.modules;
    }

    return this.modules.filter((module) =>
      module.title.toLowerCase().includes(search) ||
      module.desc.toLowerCase().includes(search)
    );
  }

  get activeModules() {
    return this.modules.length;
  }

  get revenueGrowth() {
    return 18.6;
  }

  get revenueDisplay() {
    return new Intl.NumberFormat('en-IN').format(this.stats.revenue);
  }

  get todayDate() {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  get conversionWidth() {
    return Math.min(this.extraStats.conversionRate, 100);
  }

  get studentRatio() {
    return this.stats.totalUsers
      ? Math.round((this.stats.totalStudents / this.stats.totalUsers) * 100)
      : 0;
  }

  get mentorRatio() {
    return this.stats.totalUsers
      ? Math.round((this.stats.mentors / this.stats.totalUsers) * 100)
      : 0;
  }
}
