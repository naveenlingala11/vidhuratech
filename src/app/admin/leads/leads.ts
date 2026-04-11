import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  searchText = '';
  selectedStatus = '';
  selectedCity = '';

  fromDate = '';
  toDate = '';
  cities: string[] = [];

  page = 0;
  size = 10;
  totalPages = 0;

  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    joined: 0,
  };

  leadSortBy = 'date';
  leadSortDirection = 'desc';

  todayDate = new Date().toISOString().split('T')[0];

  selectedMessageLead: any = null;
  showMessagePopup = false;

  selectedLeadToDelete: any = null;
  showDeletePopup = false;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadLeads();
  }

  // ================= LOAD =================
  loadLeads() {
    fetch(`${environment.apiUrl}/api/leads?search=${this.searchText}&page=${this.page}&size=${this.size}&sortBy=${this.mapLeadSortField()}&direction=${this.leadSortDirection}`)
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
          Message: item.message,
          Status: item.status,
          tempStatus: item.status,
          isChanged: false,
          FollowUp: item.followUpDate,
          tempFollowUp: item.followUpDate,
          isFollowUpChanged: false,
        }));

        this.totalPages = data.totalPages;
        this.filteredLeads = [...this.leads];

        this.cities = [...new Set(this.leads.map(l => l.City).filter(Boolean))];

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

  // ================= FILTER =================
  applyFilter() {

    let data = [...this.leads];

    data = data.filter((lead) => {
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

    if (this.leadSortBy === 'name') {
      data.sort((a, b) =>
        this.leadSortDirection === 'asc'
          ? a.Name.localeCompare(b.Name)
          : b.Name.localeCompare(a.Name)
      );
    } else {
      data.sort((a, b) =>
        this.leadSortDirection === 'asc'
          ? new Date(a.Date).getTime() - new Date(b.Date).getTime()
          : new Date(b.Date).getTime() - new Date(a.Date).getTime()
      );
    }

    this.filteredLeads = data;
  }

  mapLeadSortField() {
    return this.leadSortBy === 'name' ? 'name' : 'createdAt';
  }

  // ================= STATUS =================
  onStatusChange(lead: any) {
    lead.isChanged = true;
  }

  saveStatus(lead: any) {
    fetch(`${environment.apiUrl}/api/leads/status?phone=${lead.Phone}&status=${lead.tempStatus}`, {
      method: 'POST'
    }).then(() => {
      lead.Status = lead.tempStatus;
      lead.isChanged = false;
    });
  }

  cancelStatus(lead: any) {
    lead.tempStatus = lead.Status;
    lead.isChanged = false;
  }

  // ================= FOLLOWUP =================
  onFollowUpChange(lead: any) {
    lead.isFollowUpChanged = true;
  }

  saveFollowUp(lead: any) {
    fetch(`${environment.apiUrl}/api/leads/followup?phone=${lead.Phone}&date=${lead.tempFollowUp}`, {
      method: 'POST'
    }).then(() => {
      lead.FollowUp = lead.tempFollowUp;
      lead.isFollowUpChanged = false;
    });
  }

  cancelFollowUp(lead: any) {
    lead.tempFollowUp = lead.FollowUp;
    lead.isFollowUpChanged = false;
  }

  // ================= STATS =================
  calculateStats() {
    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter(l => l.Status === 'New').length;
    this.stats.contacted = this.leads.filter(l => l.Status === 'Contacted').length;
    this.stats.joined = this.leads.filter(l => l.Status === 'Joined').length;
  }

  // ================= DELETE =================
  openDeletePopup(lead: any) {
    this.selectedLeadToDelete = lead;
    this.showDeletePopup = true;
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
    this.selectedLeadToDelete = null;
  }

  confirmDelete() {
    fetch(`${environment.apiUrl}/api/leads/${this.selectedLeadToDelete.id}`, {
      method: 'DELETE'
    }).then(() => {
      this.loadLeads();
      this.closeDeletePopup();
    });
  }

  // ================= MESSAGE =================
  openMessagePopup(lead: any) {
    this.selectedMessageLead = lead;
    this.showMessagePopup = true;
  }

  closeMessagePopup() {
    this.showMessagePopup = false;
  }

  // ================= WHATSAPP =================
  openWhatsAppLead(lead: any) {
    window.open(this.getWhatsappLink(lead), '_blank');
  }

  getWhatsappLink(lead: any) {
    return `https://api.whatsapp.com/send?phone=91${lead.Phone}`;
  }

  // ================= CSV =================
  exportCSV() {
    const headers = ['NAME', 'PHONE', 'COURSE', 'STATUS', 'CITY', 'REMARKS'];

    const rows = this.leads.map(l =>
      [l.Name, l.Phone, l.Course, l.Status, l.City, l.Message].join(',')
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
  }

  getTodayFollowups() {
    return this.leads.filter(l => l.FollowUp === this.todayDate).length;
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: any) {
    const hasChanges = this.leads.some(l => l.isChanged);
    if (hasChanges) event.returnValue = true;
  }
}