import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminDashboardService } from '../../dashboard/service/admin-dashboard';

interface DashboardStats {
  leads: number;
  revenue: number;
  jobs: number;
  certificates: number;

  // 🔥 NEW ROLE-BASED
  totalUsers: number;
  totalStudents: number;
  trainers: number;
  admins: number;
  mentors: number;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {

  darkMode = false;

  stats = signal<DashboardStats>({
    leads: 0,
    revenue: 0,
    jobs: 0,
    certificates: 0,
    totalUsers: 0,
    totalStudents: 0,
    trainers: 0,
    admins: 0,
    mentors: 0
  });

  extraStats = signal({
    companies: 0,
    deletedLeads: 0,
    todayFollowups: 0,
    conversionRate: 0
  });

  loading = signal(false);

  recentActivities = signal<string[]>([]);

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
    private router: Router,
    private http: HttpClient,
    private dashboardService: AdminDashboardService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();

    this.refreshInterval = setInterval(() => {
      this.loadDashboardData(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  // ================= MAIN =================
  loadDashboardData(showLoader: boolean = true) {
    if (showLoader) this.loading.set(true);

    this.loadLeadStats();
    this.loadRevenueStats();
    this.loadJobStats();
    this.loadCertificateStats();
    this.loadCompanyStats();
    this.loadBinStats();
    this.loadRoleStats();
    this.loadRecentActivities();

    setTimeout(() => {
      this.loading.set(false);
    }, 800);
  }

  // ================= ROLE BASED =================
  loadRoleStats() {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.stats.update(s => ({
          ...s,
          totalUsers: res?.totalUsers || 0,
          totalStudents: res?.totalStudents || 0,
          trainers: res?.trainers || 0,
          admins: res?.admins || 0,
          mentors: res?.mentors || 0
        }));
      }
    });
  }

  // ================= EXISTING =================
  loadLeadStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`)
      .subscribe(res => {

        this.stats.update(s => ({
          ...s,
          leads: res.total || 0
        }));

        this.extraStats.update(e => ({
          ...e,
          conversionRate: res.total > 0
            ? Math.round((res.joined / res.total) * 100)
            : 0,
          todayFollowups: res.todayFollowups || 0
        }));
      });
  }

  loadRevenueStats(): void {
    this.http.get<any>(`${environment.apiUrl}/invoices/analytics/summary`)
      .subscribe(res => {
        this.animateCounter('revenue', res.totalRevenue || 0);
      });
  }

  loadJobStats() {
    this.http.get<any>(`${environment.apiUrl}/jobs?page=0&size=100`)
      .subscribe(res => {
        this.stats.update(s => ({
          ...s,
          jobs: res?.content?.length || 0
        }));
      });
  }

  loadCertificateStats() {
    this.http.get<any[]>(`${environment.apiUrl}/certificates`)
      .subscribe(res => {
        this.stats.update(s => ({
          ...s,
          certificates: res.length || 0
        }));
      });
  }

  loadCompanyStats() {
    this.http.get<any>(`${environment.apiUrl}/admin/companies?page=0&size=1`)
      .subscribe(res => {
        this.extraStats.update(e => ({
          ...e,
          companies: res.totalElements || 0
        }));
      });
  }

  loadBinStats() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/bin?page=0&size=1`)
      .subscribe(res => {
        this.extraStats.update(e => ({
          ...e,
          deletedLeads: res.totalElements || 0
        }));
      });
  }

  loadRecentActivities() {
    this.recentActivities.set([
      'New Lead Added',
      'Invoice Payment Received',
      'Certificate Generated',
      'Job Posted Successfully',
      'Company Added To Portal'
    ]);
  }

  // ================= ANIMATION (RESTORED) =================
  animateCounter(key: keyof DashboardStats, target: number) {
    let current = this.stats()[key];
    const step = (target - current) / 40;

    const interval = setInterval(() => {

      current += step;

      const value = Math.floor(current);

      setTimeout(() => {
        this.stats.update(s => ({
          ...s,
          [key]: value
        }));
      });

      if (
        (step > 0 && current >= target) ||
        (step < 0 && current <= target)
      ) {
        clearInterval(interval);

        setTimeout(() => {
          this.stats.update(s => ({
            ...s,
            [key]: target
          }));
        });
      }

    }, 20);
  }
  // ================= UI =================
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