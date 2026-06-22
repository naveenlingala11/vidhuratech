import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminModule {
  title: string;
  route: string;
  icon: string;
  category: 'Users' | 'LMS' | 'Operations' | 'Careers' | 'Finance';
  description: string;
}

@Component({
  selector: 'app-admin-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-actions.component.html',
  styleUrls: ['./admin-actions.component.css']
})
export class AdminActionsComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedCategory = 'All';
  loading = false;

  // Seeder Tool State
  showSeederModal = false;
  seederCount = 10000;
  seederClean = true;
  seedingLoading = false;
  seederResult: any = null;
  seederError = '';
  seederElapsedSeconds = 0;
  seederCountProgress = 0;
  private timerId: any = null;
  private pollId: any = null;

  categories = ['All', 'Users', 'LMS', 'Operations', 'Careers', 'Finance'];

  stats = [
    { title: 'Total Enrollment', value: '1,428', change: '+12.5%', icon: 'bi-people', trend: 'up', color: 'blue' },
    { title: 'Monthly Revenue', value: '₹18.4L', change: '+8.2%', icon: 'bi-currency-rupee', trend: 'up', color: 'emerald' },
    { title: 'Active Jobs', value: '24', change: '0 posted today', icon: 'bi-briefcase', trend: 'up', color: 'violet' },
    { title: 'Active Batches', value: '18', change: 'active cohorts', icon: 'bi-journal-bookmark', trend: 'neutral', color: 'amber' }
  ];

  modules: AdminModule[] = [
    // User Management
    { title: 'Admissions Panel', route: '/dashboard/admin/admissions', icon: 'bi-mortarboard', category: 'Users', description: 'Review student registrations and manage enrollment pipeline.' },
    { title: 'Create Employee', route: '/dashboard/admin/create-user', icon: 'bi-person-plus', category: 'Users', description: 'Provision accounts and roles for trainers and coordinators.' },
    { title: 'Users Directory', route: '/dashboard/admin/users', icon: 'bi-people', category: 'Users', description: 'Search, audit, and suspend active student or staff profiles.' },

    // LMS & Batches
    { title: 'Batches Manager', route: '/dashboard/admin/batches', icon: 'bi-journal-bookmark', category: 'LMS', description: 'Create scheduling cohorts, track progress, and assign trainers.' },
    { title: 'Batch Communication', route: '/dashboard/admin/batch-communication', icon: 'bi-broadcast', category: 'LMS', description: 'Broadcast announcements and coordinate live lectures.' },
    { title: 'Courses Database', route: '/dashboard/lms/courses', icon: 'bi-book', category: 'LMS', description: 'Browse and edit existing syllabi, assignments, and lectures.' },
    { title: 'Create LMS Course', route: '/dashboard/lms/courses/create', icon: 'bi-file-earmark-plus', category: 'LMS', description: 'Build a new learning module with milestones and tasks.' },
    { title: 'Bulk Course Upload', route: '/dashboard/admin/course-bulk', icon: 'bi-box-seam', category: 'LMS', description: 'Import bundles of lectures or syllabus files via Excel.' },

    // CRM & Operations
    { title: 'Leads Pipeline', route: '/dashboard/admin/leads', icon: 'bi-funnel', category: 'Operations', description: 'Monitor inquiries, assign agents, and check conversion rates.' },
    { title: 'Bin / Recycle Center', route: '/admin/bin', icon: 'bi-trash3', category: 'Operations', description: 'Restore deleted leads, users, or system components.' },
    { title: 'Questions Database', route: '/admin/questions', icon: 'bi-patch-question', category: 'Operations', description: 'Manage test bank for mock assessments and challenges.' },
    { title: 'Job Seeder Tool', route: 'seeder', icon: 'bi-database-fill-gear', category: 'Operations', description: 'Seed mock jobs database for testing. Configure count and database wipe options.' },

    // Careers & Placements
    { title: 'Jobs Manager', route: '/dashboard/admin/jobs', icon: 'bi-briefcase', category: 'Careers', description: 'Add or modify active recruitment roles, requirements, and salaries.' },
    { title: 'Companies Directory', route: '/dashboard/admin/companies', icon: 'bi-building', category: 'Careers', description: 'Manage corporate hiring partners and placement coordinators.' },
    { title: 'Certificates Verifier', route: '/dashboard/admin/certificates', icon: 'bi-patch-check', category: 'Careers', description: 'Issue, view, and verify unique credentials for academy graduates.' },

    // Finance & Auditing
    { title: 'Invoice Registry', route: '/dashboard/admin/invoice', icon: 'bi-receipt', category: 'Finance', description: 'Generate student bills, audit bank transfers, and track payments.' },
    { title: 'Revenue Analytics', route: '/dashboard/admin/invoice-analytics', icon: 'bi-graph-up-arrow', category: 'Finance', description: 'Explore monthly income, collections, and regional revenue reports.' }
  ];

  auditLogs = [
    { action: 'Audit Engine Online', details: 'Listening for system events and transactions', time: 'Just now', icon: 'bi-shield-check', color: 'blue' }
  ];

  systemHealth = [
    { name: 'Core API Gateway', status: 'Checking...', icon: 'bi-hdd-network', color: 'blue' },
    { name: 'Database Clusters', status: 'Checking...', icon: 'bi-database-fill', color: 'blue' },
    { name: 'Background Workers', status: 'Active (3 tasks)', icon: 'bi-cpu-fill', color: 'blue' },
    { name: 'SMTP Mail Server', status: 'Operational', icon: 'bi-envelope-check-fill', color: 'emerald' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
    this.checkSystemLatency();
  }

  loadData() {
    this.loading = true;
    this.cd.detectChanges();

    forkJoin({
      leads: this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`).pipe(catchError(() => of(null))),
      invoices: this.http.get<any>(`${environment.apiUrl}/invoices/analytics/summary`).pipe(catchError(() => of(null))),
      admin: this.http.get<any>(`${environment.apiUrl}/admin/analytics`).pipe(catchError(() => of(null))),
      recentInvoices: this.http.get<any>(`${environment.apiUrl}/invoices/paged?page=0&size=4`).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res) => {
        // Map dynamic stats if present
        if (res.leads) {
          this.stats[0].value = res.leads.total.toString();
          this.stats[0].change = `+${res.leads.new || 0} new leads`;
        }

        if (res.invoices) {
          const revenue = res.invoices.paidRevenue || 0;
          this.stats[1].value = '₹' + (revenue / 100000).toFixed(1) + 'L';
          this.stats[1].change = `${res.invoices.totalInvoices || 0} invoices`;
        }

        if (res.admin) {
          this.stats[2].value = (res.admin.totalJobs || 0).toString();
          this.stats[2].change = `+${res.admin.today || 0} posted today`;
        }

        this.http.get<any[]>(`${environment.apiUrl}/api/lms/batches`).pipe(catchError(() => of([]))).subscribe(batches => {
          const activeBatchesCount = (batches || []).length;
          if (activeBatchesCount > 0) {
            this.stats[3].value = activeBatchesCount.toString();
            this.stats[3].change = 'active cohorts';
          }
        });

        // Map recent invoices to audit log
        if (res.recentInvoices && res.recentInvoices.content && res.recentInvoices.content.length > 0) {
          this.auditLogs = res.recentInvoices.content.map((inv: any) => ({
            action: inv.status === 'PAID' ? 'Payment Received' : 'Invoice Generated',
            details: `${inv.studentName} - ₹${inv.amount.toLocaleString()} for ${inv.courseName || 'Academy Course'}`,
            time: this.getPostedAgo(inv.issuedAt),
            icon: inv.status === 'PAID' ? 'bi-check-circle-fill' : 'bi-clock-history',
            color: inv.status === 'PAID' ? 'emerald' : 'rose'
          }));
        } else {
          // Default logs if no invoice logs
          this.auditLogs = [
            { action: 'Audit Engine Sync', details: 'Real-time logging listener connected', time: '1m ago', icon: 'bi-shield-check', color: 'blue' },
            { action: 'Database Health Check', details: 'No anomaly detected in registry logs', time: '10m ago', icon: 'bi-database-check', color: 'emerald' }
          ];
        }

        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  checkSystemLatency() {
    const startTime = Date.now();
    this.http.get(`${environment.apiUrl}/api/leads/analytics`).subscribe({
      next: () => {
        const latency = Date.now() - startTime;
        this.systemHealth[1].status = `Healthy (${latency}ms)`;
        this.systemHealth[1].color = 'emerald';
        this.systemHealth[0].status = 'Operational';
        this.systemHealth[0].color = 'emerald';
        this.cd.detectChanges();
      },
      error: () => {
        this.systemHealth[1].status = 'Offline';
        this.systemHealth[1].color = 'rose';
        this.systemHealth[0].status = 'Disconnected';
        this.systemHealth[0].color = 'rose';
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.cleanupTimers();
  }

  // Seeder Tool Actions
  openSeederModal() {
    this.showSeederModal = true;
    this.seederResult = null;
    this.seederError = '';
    this.seederElapsedSeconds = 0;
    this.seederCountProgress = 0;
  }

  closeSeederModal() {
    if (!this.seedingLoading) {
      this.showSeederModal = false;
    }
  }

  triggerSeeding() {
    this.seedingLoading = true;
    this.seederResult = null;
    this.seederError = '';
    this.seederElapsedSeconds = 0;
    this.seederCountProgress = 0;
    this.cd.detectChanges();

    // Start running timer
    this.timerId = setInterval(() => {
      this.seederElapsedSeconds++;
      this.cd.detectChanges();
    }, 1000);

    // Start progress polling
    this.pollId = setInterval(() => {
      this.http.get<any>(`${environment.apiUrl}/jobs/seed/progress`).subscribe({
        next: (res) => {
          if (res) {
            this.seederCountProgress = res.currentProgress || 0;
            this.cd.detectChanges();
          }
        },
        error: () => {}
      });
    }, 800);

    this.http.get<any>(`${environment.apiUrl}/jobs/seed`, {
      params: {
        count: this.seederCount.toString(),
        clean: this.seederClean.toString()
      }
    }).subscribe({
      next: (res) => {
        this.seedingLoading = false;
        this.seederResult = res;
        this.cleanupTimers();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.seedingLoading = false;
        this.seederError = err.error?.message || err.message || 'Unknown server error occurred during seeding.';
        this.cleanupTimers();
        this.cd.detectChanges();
      }
    });
  }

  cleanupTimers() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  formatElapsedTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  navigate(route: string) {
    if (route === 'seeder') {
      this.openSeederModal();
    } else {
      this.router.navigate([route]);
    }
  }

  get filteredModules() {
    return this.modules.filter(m => {
      const matchesCategory = this.selectedCategory === 'All' || m.category === this.selectedCategory;
      const matchesSearch = m.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            m.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getPostedAgo(postedAt: string): string {
    if (!postedAt) return 'Recently';
    const safe = postedAt.split('.')[0];
    const diff = Date.now() - new Date(safe).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
