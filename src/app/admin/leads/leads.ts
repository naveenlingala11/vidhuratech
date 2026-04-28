import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.html',
  styleUrl: './leads.css',
})
export class LeadsComponent implements OnInit {
  leads: any[] = [];
  filteredLeads: any[] = [];

  loading = false;
  error = '';

  searchText = '';
  selectedStatus = '';
  selectedCity = '';

  fromDate = '';
  toDate = '';
  cities: string[] = [];

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    joined: 0,
  };

  leadSortBy = 'date';
  leadSortDirection: 'asc' | 'desc' = 'desc';

  todayDate = new Date().toISOString().split('T')[0];

  selectedMessageLead: any = null;
  showMessagePopup = false;

  selectedLeadToDelete: any = null;
  showDeletePopup = false;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadLeads();
    this.loadAnalytics();
  }

  loadLeads() {
    this.loading = true;
    this.error = '';

    const params = new HttpParams()
      .set('search', this.searchText || '')
      .set('page', this.page)
      .set('size', this.size)
      .set('sortBy', this.mapLeadSortField())
      .set('direction', this.leadSortDirection);

    this.http.get<any>(`${environment.apiUrl}/api/leads`, { params })
      .subscribe({
        next: (data) => {
          const content = data?.content || [];

          this.leads = content.map((item: any) => ({
            id: item.id,
            Date: item.createdAt,
            Name: item.name || '',
            Phone: item.phone || '',
            Email: item.email || '',
            Course: item.course || '',
            Batch: item.batch || '',
            City: item.city || '',
            Message: item.message || '',
            Status: item.status || 'New',
            tempStatus: item.status || 'New',
            isChanged: false,
            FollowUp: item.followUpDate || '',
            tempFollowUp: item.followUpDate || '',
            isFollowUpChanged: false,
          }));

          this.totalPages = data?.totalPages || 0;
          this.totalElements = data?.totalElements || 0;

          this.filteredLeads = [...this.leads];
          this.cities = [...new Set(this.leads.map(l => l.City).filter(Boolean))];

          this.calculatePageStats();
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Leads API failed:', err);
          this.loading = false;

          if (err.status === 403) {
            this.error = 'Access denied. Please login as Admin or Super Admin.';
          } else {
            this.error = 'Unable to load leads.';
          }
        }
      });
  }

  loadAnalytics() {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`)
      .subscribe({
        next: (res) => {
          this.stats.total = res.total || 0;
          this.stats.new = res.new || 0;
          this.stats.contacted = res.contacted || 0;
          this.stats.joined = res.joined || 0;
        },
        error: () => { }
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

  applyFilter() {
    this.page = 0;
    this.loadLeads();
  }

  applyLocalFilters() {
    let data = [...this.leads];

    data = data.filter((lead) => {
      const search = this.searchText.toLowerCase();

      const matchSearch =
        !search ||
        lead.Name.toLowerCase().includes(search) ||
        lead.Phone.includes(this.searchText);

      const matchStatus = this.selectedStatus ? lead.Status === this.selectedStatus : true;
      const matchCity = this.selectedCity ? lead.City === this.selectedCity : true;

      const leadDate = lead.Date ? lead.Date.split('T')[0] : '';

      const matchDate =
        (!this.fromDate || leadDate >= this.fromDate) &&
        (!this.toDate || leadDate <= this.toDate);

      return matchSearch && matchStatus && matchCity && matchDate;
    });

    this.filteredLeads = data;
  }

  mapLeadSortField() {
    return this.leadSortBy === 'name' ? 'name' : 'createdAt';
  }

  onStatusChange(lead: any) {
    lead.isChanged = lead.tempStatus !== lead.Status;
  }

  saveStatus(lead: any) {
    const params = new HttpParams()
      .set('phone', lead.Phone)
      .set('status', lead.tempStatus);

    this.http.post(`${environment.apiUrl}/api/leads/status`, null, { params })
      .subscribe({
        next: () => {
          lead.Status = lead.tempStatus;
          lead.isChanged = false;
          this.loadAnalytics();
        },
        error: () => alert('Failed to update status')
      });
  }

  cancelStatus(lead: any) {
    lead.tempStatus = lead.Status;
    lead.isChanged = false;
  }

  onFollowUpChange(lead: any) {
    lead.isFollowUpChanged = lead.tempFollowUp !== lead.FollowUp;
  }

  saveFollowUp(lead: any) {
    const params = new HttpParams()
      .set('phone', lead.Phone)
      .set('date', lead.tempFollowUp);

    this.http.post(`${environment.apiUrl}/api/leads/followup`, null, { params })
      .subscribe({
        next: () => {
          lead.FollowUp = lead.tempFollowUp;
          lead.isFollowUpChanged = false;
        },
        error: () => alert('Failed to update follow-up')
      });
  }

  cancelFollowUp(lead: any) {
    lead.tempFollowUp = lead.FollowUp;
    lead.isFollowUpChanged = false;
  }

  calculatePageStats() {
    this.stats.new = this.leads.filter(l => l.Status === 'New').length;
    this.stats.contacted = this.leads.filter(l => l.Status === 'Contacted').length;
    this.stats.joined = this.leads.filter(l => l.Status === 'Joined').length;
  }

  openDeletePopup(lead: any) {
    this.selectedLeadToDelete = lead;
    this.showDeletePopup = true;
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
    this.selectedLeadToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedLeadToDelete) return;

    this.http.delete(`${environment.apiUrl}/api/leads/${this.selectedLeadToDelete.id}`)
      .subscribe({
        next: () => {
          this.loadLeads();
          this.loadAnalytics();
          this.closeDeletePopup();
        },
        error: () => alert('Failed to delete lead')
      });
  }

  openMessagePopup(lead: any) {
    this.selectedMessageLead = lead;
    this.showMessagePopup = true;
  }

  closeMessagePopup() {
    this.showMessagePopup = false;
    this.selectedMessageLead = null;
  }

  openWhatsAppLead(lead: any) {
    window.open(this.getWhatsappLink(lead), '_blank');
  }

  getWhatsappLink(lead: any) {
    return `https://api.whatsapp.com/send?phone=91${lead.Phone}`;
  }

  exportCSV() {
    const headers = ['NAME', 'PHONE', 'EMAIL', 'COURSE', 'STATUS', 'CITY', 'MESSAGE'];

    const rows = this.filteredLeads.map(l =>
      [
        l.Name,
        l.Phone,
        l.Email,
        l.Course,
        l.Status,
        l.City,
        `"${String(l.Message || '').replace(/"/g, '""')}"`
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VT_Leads.csv`;
    link.click();
  }

  refreshLeads() {
    this.loadLeads();
    this.loadAnalytics();
  }

  getTodayFollowups() {
    return this.leads.filter(l => l.FollowUp === this.todayDate).length;
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: any) {
    const hasChanges = this.leads.some(l => l.isChanged || l.isFollowUpChanged);
    if (hasChanges) event.returnValue = true;
  }
}
