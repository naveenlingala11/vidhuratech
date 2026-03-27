import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  activeTab: 'leads' | 'jobs' | 'companies' = 'leads';

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

  apiUrl =
    'https://script.google.com/macros/s/AKfycbxmpbxdH5rj-z3fT29aAh-TrGVNneDej7MsUfz3O54HIJtrIW2dW0IGw4gact_0q7U/exec';

  constructor(
    private cd: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.loadLeads();
    this.loadCategories();
    this.loadCompanies();
    this.loadAnalytics();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  // ================= LEADS =================
  loadLeads() {
    fetch(this.apiUrl)
      .then((res) => res.json())
      .then((data) => {
        this.leads = data
          .map((item: any) => ({
            Date: item.Date,
            Name: item.Name,
            Phone: String(item.Phone),
            Email: item.Email,
            Course: item.Course,
            Batch: item.Batch,
            City: item.City,
            Status: 'New',
            FollowUp: '',
            tempStatus: 'New',
            isChanged: false,
          }))
          .reverse();

        this.filteredLeads = [...this.leads];
        this.cities = [...new Set(this.leads.map((l) => l.City))];

        this.calculateStats();
        this.cd.detectChanges();
      });
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

  calculateStats() {
    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter((l) => l.Status === 'New').length;
    this.stats.contacted = this.leads.filter((l) => l.Status === 'Contacted').length;
    this.stats.joined = this.leads.filter((l) => l.Status === 'Joined').length;
  }

  updateLead(lead: any) {
    const formData = new FormData();

    formData.append('action', 'update');
    formData.append('phone', lead.Phone);
    formData.append('status', lead.tempStatus || lead.Status);
    formData.append('followUp', lead.FollowUp || '');

    fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    });
  }

  refreshLeads() {
    this.loadLeads();
  }

  onStatusChange(lead: any) {
    lead.tempStatus = lead.Status;
    lead.isChanged = true;
  }

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
