import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit, OnDestroy {

  loading = true;
  darkMode = false;

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
    { title: 'Leads', icon: '📋', route: '/admin/leads' },
    { title: 'Bin', icon: '🗑️', route: '/admin/bin' },
    { title: 'Jobs', icon: '💼', route: '/admin/jobs' },
    { title: 'Companies', icon: '🏢', route: '/admin/companies' },
    { title: 'Certificates', icon: '🎓', route: '/admin/certificates' },
    { title: 'Interview Prep', icon: '🧠', route: '/admin/questions' },
    { title: 'Invoices', icon: '🧾', route: '/admin/invoice' },
    { title: 'Analytics', icon: '📊', route: '/invoice-analytics' }
  ];

  refreshInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();

    this.refreshInterval = setInterval(() => {
      this.loadDashboard(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  // ================= MAIN =================
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
    }, 800);
  }

  // ================= ROLE =================
  loadRoleStats() {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.stats.totalUsers = res.totalUsers || 0;
        this.stats.totalStudents = res.totalStudents || 0;
        this.stats.trainers = res.trainers || 0;
        this.stats.admins = res.admins || 0;
        this.stats.mentors = res.mentors || 0;
      },
      error: () => {}
    });
  }

  // ================= EXISTING =================
  loadLeadStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`)
      .subscribe({
        next: (res) => {
          this.animateCounter('leads', res.total || 0);

          this.extraStats.conversionRate =
            res.total > 0 ? Math.round((res.joined / res.total) * 100) : 0;

          this.extraStats.todayFollowups = res.todayFollowups || 0;
        },
        error: () => {}
      });
  }

  loadRevenueStats() {
    this.http.get<any>(`${environment.apiUrl}/invoices/analytics/summary`)
      .subscribe({
        next: (res) => {
          this.animateCounter('revenue', res.totalRevenue || 0);
        },
        error: () => {}
      });
  }

  loadJobStats() {
    this.http.get<any>(`${environment.apiUrl}/jobs?page=0&size=100`)
      .subscribe({
        next: (res) => {
          const count = res?.content?.length || 0;
          this.animateCounter('jobs', count);
        },
        error: () => {}
      });
  }

  loadCertificateStats() {
    this.http.get<any[]>(`${environment.apiUrl}/certificates`)
      .subscribe({
        next: (res) => {
          this.animateCounter('certificates', res.length || 0);
        },
        error: () => {}
      });
  }

  loadCompanyStats() {
    this.http.get<any>(`${environment.apiUrl}/admin/companies?page=0&size=1`)
      .subscribe({
        next: (res) => {
          this.extraStats.companies = res.totalElements || 0;
        },
        error: () => {}
      });
  }

  loadBinStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/bin?page=0&size=1`)
      .subscribe({
        next: (res) => {
          this.extraStats.deletedLeads = res.totalElements || 0;
        },
        error: () => {}
      });
  }

  loadRecentActivities() {
    this.recentActivities = [
      'New Lead Added',
      'Invoice Payment Received',
      'Certificate Generated',
      'Job Posted Successfully',
      'Company Added To Portal'
    ];
  }

  // ================= ANIMATION =================
  animateCounter(key: keyof DashboardStats, target: number) {
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

  // ================= UI =================
  navigate(route: string) {
    this.router.navigate([route]);
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
  }

  refreshDashboard() {
    this.loadDashboard();
  }

  get activeModules() {
    return this.modules.length;
  }

  get revenueGrowth() {
    return 18.6;
  }
}