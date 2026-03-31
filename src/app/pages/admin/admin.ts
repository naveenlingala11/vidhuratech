import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  activeTab: 'leads' | 'jobs' | 'companies' | 'bin' = 'leads';

  leads: any[] = [];
  filteredLeads: any[] = [];

  searchText = '';
  selectedStatus = '';

  isScraping = false;
  completed = false;
  statusInterval: any;

  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    joined: 0,
  };

  // 🔥 PAGINATION
  companyPage = 0;
  companySize = 10;
  totalCompanies = 0;
  page = 0;
  size = 10;
  totalPages = 0;

  binTotal = 0;
  binReady = false;
  isCollapsed = false;
  showProfile = false;

  newLeadsCount = 0;
  previousTotal = 0;

  isLoggedIn = false;

  loginData = {
    username: '',
    password: ''
  };

  errorMsg = '';
  idleTimer: any;
  timeout = 2 * 60 * 1000; // 2 minutes
  isProcessing = false;
  processMessage = '';
  progress = 0;
  showSuccess = false;

  constructor(
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) { }

  // ================= INIT =================
  ngOnInit() {
    const saved = localStorage.getItem('adminLogin');

    setTimeout(() => {
      this.isLoggedIn = saved === 'true';

      if (this.isLoggedIn) {
        this.loadLeads();
        this.loadCategories();
        this.loadCompanies();
        this.loadAnalytics();
        this.loadBin();
        this.startLeadPolling();
        this.startIdleTimer();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cd.detectChanges();
    });
  }

  login() {
    if (
      this.loginData.username === 'admin' &&
      this.loginData.password === 'admin123'
    ) {
      this.isProcessing = true;
      this.processMessage = 'Logging in...';
      this.progress = 30;

      setTimeout(() => {
        this.progress = 70;
      }, 300);

      setTimeout(() => {
        this.progress = 100;
        this.showSuccess = true;
      }, 600);

      setTimeout(() => {
        this.isLoggedIn = true;
        localStorage.setItem('adminLogin', 'true');

        this.isProcessing = false;
        this.showSuccess = false;
        this.errorMsg = '';

        // 🔥 LOAD DATA AFTER UI FREE
        setTimeout(() => {
          this.loadLeads();
          this.loadCategories();
          this.loadCompanies();
          this.loadAnalytics();
          this.loadBin();
          this.startLeadPolling();
          this.startIdleTimer();
        }, 100);

      }, 1000);

    } else {
      this.errorMsg = 'Invalid credentials ❌';
    }
  }

  logout(force = false) {
    if (!force && !confirm('Logout?')) return;

    this.isProcessing = true;
    this.processMessage = 'Logging out...';
    this.progress = 50;

    setTimeout(() => {
      this.progress = 100;
      this.showSuccess = true;
    }, 400);

    setTimeout(() => {
      localStorage.clear();
      location.reload();
    }, 900);
  }

  startIdleTimer() {
    clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      alert('Session expired. Please login again');
      this.logout(true); // ✅ force logout
    }, this.timeout);
  }

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetTimer() {
    if (this.isLoggedIn) {
      this.startIdleTimer();
    }
  }

  openTab(tab: 'leads' | 'jobs' | 'companies' | 'bin') {
    this.activeTab = tab;

    if (tab === 'bin') {
      this.loadBin(); // 🔥 only here
    }

    if (tab === 'leads') {
      this.loadLeads();
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleProfile() {
    setTimeout(() => {
      this.showProfile = !this.showProfile;
    });
  }

  clearNotifications() {
    setTimeout(() => {
      this.newLeadsCount = 0;
    });
  }

  /* 🔔 LIVE NOTIFICATION */
  startLeadPolling() {
    setInterval(() => {
      fetch(`${environment.apiUrl}/api/leads/analytics`)
        .then(res => res.json())
        .then(data => {

          if (this.previousTotal && data.total > this.previousTotal) {
            this.newLeadsCount += (data.total - this.previousTotal);
          }

          this.previousTotal = data.total;

        });
    }, 5000); // every 5 sec
  }

  // ================= LEADS =================
  loadLeads() {
    fetch(`${environment.apiUrl}/api/leads?search=${this.searchText}&page=${this.page}&size=${this.size}`)
      .then(res => res.json())
      .then(data => {

        this.leads = data.content.map((item: any) => ({
          id: item.id,
          Date: item.createdAt,
          Name: item.name,
          Phone: item.phone,
          Email: item.email,
          Course: item.course,
          Batch: item.batch,
          City: item.city,
          Status: item.status,
          tempStatus: item.status,
          isChanged: false,
          FollowUp: item.followUpDate,
          tempFollowUp: item.followUpDate,
          isFollowUpChanged: false,
        }));

        this.totalPages = data.totalPages; // ✅ works now

        this.filteredLeads = [...this.leads];
        this.calculateStats();
        this.cd.detectChanges();
      });
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadLeads();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadLeads();
    }
  }

  onFollowUpChange(lead: any) {
    lead.isFollowUpChanged = true;
  }

  saveFollowUp(lead: any) {

    fetch(`${environment.apiUrl}/api/leads/followup?phone=${lead.Phone}&date=${lead.tempFollowUp}`, {
      method: 'POST'
    })
      .then(() => {
        lead.FollowUp = lead.tempFollowUp;
        lead.isFollowUpChanged = false;
      })
      .catch(() => {
        alert('Failed to save follow-up');
      });

  }

  cancelFollowUp(lead: any) {
    lead.tempFollowUp = lead.FollowUp;
    lead.isFollowUpChanged = false;
  }

  applyFilter() {
    this.filteredLeads = this.leads.filter((lead) => {
      const matchSearch =
        lead.Name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        lead.Phone.includes(this.searchText);

      const matchStatus = this.selectedStatus ? lead.Status === this.selectedStatus : true;

      const matchCity = this.selectedCity ? lead.City === this.selectedCity : true;

      const matchDate =
        (!this.fromDate || lead.Date >= this.fromDate) &&
        (!this.toDate || lead.Date <= this.toDate);

      return matchSearch && matchStatus && matchCity && matchDate;
    });
  }

  saveStatus(lead: any) {
    fetch(`${environment.apiUrl}/api/leads/status?phone=${lead.Phone}&status=${lead.tempStatus}`, {
      method: 'POST'
    })
      .then(() => {
        lead.Status = lead.tempStatus;
        lead.isChanged = false;
      });
  }

  cancelStatus(lead: any) {
    lead.tempStatus = lead.Status;
    lead.isChanged = false;
  }

  calculateStats() {
    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter((l) => l.Status === 'New').length;
    this.stats.contacted = this.leads.filter((l) => l.Status === 'Contacted').length;
    this.stats.joined = this.leads.filter((l) => l.Status === 'Joined').length;
  }

  updateLead(lead: any) {

    fetch(`${environment.apiUrl}/api/leads/status?phone=${lead.Phone}&status=${lead.tempStatus}`, {
      method: 'POST'
    })
      .then(() => {
        // 🔥 update UI immediately
        lead.Status = lead.tempStatus;
        lead.isChanged = false;
      })
      .catch(() => {
        alert('Failed to update status');
      });

    // FOLLOWUP
    if (lead.isFollowUpChanged) {
      fetch(`${environment.apiUrl}/api/leads/followup?phone=${lead.Phone}&date=${lead.tempFollowUp}`, {
        method: 'POST'
      }).then(() => {
        lead.FollowUp = lead.tempFollowUp;
        lead.isFollowUpChanged = false;
      });
    }

  }

  refreshLeads() {
    this.loadLeads();
  }

  onStatusChange(lead: any) {
    lead.isChanged = true; // don't overwrite
  }

  deleteLead(lead: any) {

    if (!lead.id) {
      alert('Invalid lead ID');
      return;
    }

    if (!confirm('Delete this lead?')) return;

    fetch(`${environment.apiUrl}/api/leads/${lead.id}`, {
      method: 'DELETE'
    })
      .then(() => {
        this.loadLeads();
        this.loadBin(); // 🔥 add this

      })
      .catch(() => {
        alert('Delete failed');
      });
  }

  todayDate = new Date().toISOString().split('T')[0];

  exportCSV() {
    const rows = this.leads.map((l) => `${l.Name},${l.Phone},${l.Course},${l.Status},${l.City}`);

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    link.download = 'leads.csv';
    link.click();
  }

  getTodayFollowups() {
    const today = new Date().toISOString().split('T')[0];
    return this.leads.filter((l) => l.FollowUp === today).length;
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: any) {
    const hasChanges = this.leads.some(l => l.isChanged);

    if (hasChanges) {
      event.returnValue = true;
    }
  }

  canDeactivate() {
    return !this.leads.some(l => l.isChanged) || confirm("Save changes?");
  }

  get binCount() {
    return this.binTotal;
  }

  loadBin() {
    this.isBinLoading = true;

    fetch(`${environment.apiUrl}/api/leads/bin?page=0&size=10`)
      .then(res => res.json())
      .then(data => {

        this.binLeads = data.content;
        this.binTotal = data.totalElements;

        this.isBinLoading = false;
        this.binReady = true; // ✅ important
        this.cd.detectChanges();
      });
  }

  restoreLead(lead: any) {
    fetch(`${environment.apiUrl}/api/leads/restore/${lead.id}`, {
      method: 'PUT'
    }).then(() => this.loadBin());
  }

  deletePermanent(lead: any) {

    if (!confirm('Delete permanently?')) return;

    fetch(`${environment.apiUrl}/api/leads/permanent/${lead.id}`, {
      method: 'DELETE'
    }).then(() => this.loadBin());
  }

  openBin() {
    this.activeTab = 'bin';
    this.loadBin(); // 🔥 VERY IMPORTANT
  }

  // ================= JOB =================
  jobForm = {
    title: '',
    company: '',
    location: '',
    experience: '',
    type: '',
    category: '',
    link: '',
  };

  categories: string[] = [];
  showPreview = false;

  selectedCity = '';
  fromDate = '';
  toDate = '';
  cities: string[] = [];

  loadCategories() {
    this.categories = ['IT', 'Non-IT', 'Core', 'Finance', 'HR'];
  }

  previewJob() {
    if (!this.jobForm.title || !this.jobForm.company) {
      alert('Fill required fields');
      return;
    }
    this.showPreview = true;
  }

  confirmPost() {
    this.showPreview = false;
    this.postJob();
  }

  postJob() {
    const payload = {
      title: this.jobForm.title,
      company: this.jobForm.company,
      location: this.jobForm.location,
      experience: this.jobForm.experience || 'N/A',
      jobType: this.jobForm.type,
      category: this.jobForm.category || 'IT',
      applyLink: this.jobForm.link,
      source: 'Admin',
    };

    fetch(`${environment.apiUrl}/jobs/admin/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => {
      alert('Job Posted ✅');

      this.jobForm = {
        title: '',
        company: '',
        location: '',
        experience: '',
        type: '',
        category: '',
        link: '',
      };
    });
  }

  companies: any[] = [];
  analytics: any = {};

  newCompany = {
    company: '',
    type: 'greenhouse',
    url: '',
  };

  searchCompany = '';
  sortBy = 'company';
  direction = 'asc';
  activeFilter: any = '';

  binLeads: any[] = [];
  isBinLoading = false;

  loadCompanies() {
    let url = `${environment.apiUrl}/admin/companies?page=${this.companyPage}&size=${this.companySize}&search=${this.searchCompany}&sortBy=${this.sortBy}&direction=${this.direction}`;

    if (this.activeFilter !== '') {
      url += `&active=${this.activeFilter}`;
    }

    this.http.get<any>(url).subscribe((data) => {
      this.companies = data.content;
      this.totalCompanies = data.totalElements;
      this.cd.detectChanges();
    });
  }

  nextCompanyPage() {
    if ((this.companyPage + 1) * this.companySize < this.totalCompanies) {
      this.companyPage++;
      this.loadCompanies();
    }
  }

  prevCompanyPage() {
    if (this.companyPage > 0) {
      this.companyPage--;
      this.loadCompanies();
    }
  }

  addCompany() {
    fetch(`${environment.apiUrl}/admin/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.newCompany),
    }).then(() => {
      alert('Company Added ✅');

      this.newCompany = {
        company: '',
        type: 'greenhouse',
        url: '',
      };

      this.loadCompanies();
    });
  }

  deleteCompany(id: number) {
    fetch(`${environment.apiUrl}/admin/companies/${id}`, {
      method: 'DELETE',
    }).then(() => this.loadCompanies());
  }

  toggleCompany(c: any) {
    fetch(`${environment.apiUrl}/admin/companies/${c.id}/toggle`, {
      method: 'PUT',
    }).then(() => this.loadCompanies());
  }

  loadAnalytics() {
    this.http.get<any>(`${environment.apiUrl}/admin/analytics`).subscribe((data) => {
      this.analytics = data;
      this.cd.detectChanges(); // 🔥 FIX
    });
  }

  triggerScrape() {
    this.isScraping = true;
    this.completed = false;

    this.http.get<{ message: string }>(`${environment.apiUrl}/jobs/scrape`).subscribe({
      next: () => {
        this.startPolling();
      },
      error: () => {
        // fallback (rare)
        this.startPolling();
      },
    });
  }

  startPolling() {
    this.statusInterval = setInterval(() => {
      this.http
        .get<{ running: boolean }>(`${environment.apiUrl}/admin/scrape/status`)
        .subscribe((res) => {
          this.isScraping = res.running;

          if (!res.running) {
            clearInterval(this.statusInterval);

            this.isScraping = false;
            this.completed = true; // 🔥 NEW

            console.log('✅ Scraping completed');
          }
        });
    }, 3000);
  }
}
