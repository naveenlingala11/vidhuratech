import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

type LeadStatus = 'New' | 'Contacted' | 'Joined';
type SortDirection = 'asc' | 'desc';
type LeadView = 'active' | 'bin';
type ToastType = 'success' | 'error';
type FormFeedbackType = 'success' | 'error' | '';

interface LeadRow {
  id: number;
  Date: string;
  Name: string;
  Phone: string;
  Email: string;
  Course: string;
  Batch: string;
  City: string;
  Message: string;
  Status: LeadStatus;
  tempStatus: LeadStatus;
  isChanged: boolean;
  FollowUp: string;
  tempFollowUp: string;
  isFollowUpChanged: boolean;
  Source: string;
  ExpectedAmount: number | null;
  DeletedAt?: string;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.html',
  styleUrl: './leads.css',
})
export class LeadsComponent implements OnInit {
  leads: LeadRow[] = [];
  filteredLeads: LeadRow[] = [];
  binLeads: LeadRow[] = [];

  loading = false;
  binLoading = false;
  actionBusy = false;
  bulkBusy = false;
  error = '';
  binError = '';

  activeView: LeadView = 'active';
  courseOptions: string[] = [];

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

  binPage = 0;
  binSize = 10;
  binTotalPages = 0;
  binTotalElements = 0;

  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    joined: 0,
    conversionRate: 0,
  };

  pageStats = {
    showing: 0,
    todayFollowups: 0,
    pendingEdits: 0,
  };

  leadSortBy = 'date';
  leadSortDirection: SortDirection = 'desc';
  readonly sortOptions = [
    { label: 'Newest', field: 'date', direction: 'desc' as SortDirection },
    { label: 'Oldest', field: 'date', direction: 'asc' as SortDirection },
    { label: 'Name A-Z', field: 'name', direction: 'asc' as SortDirection },
    { label: 'Name Z-A', field: 'name', direction: 'desc' as SortDirection },
  ];
  selectedSortIndex = 0;

  readonly statuses: LeadStatus[] = ['New', 'Contacted', 'Joined'];
  readonly pageSizeOptions = [10, 25, 50];
  readonly todayDate = new Date().toISOString().split('T')[0];

  selectedIds = new Set<number>();
  bulkStatus: LeadStatus = 'Contacted';

  selectedMessageLead: LeadRow | null = null;
  showMessagePopup = false;

  selectedLeadToDelete: LeadRow | null = null;
  showDeletePopup = false;

  selectedLead: LeadRow | null = null;
  showLeadDrawer = false;

  toastMessage = '';
  toastType: ToastType = 'success';
  addLeadSaving = false;
  addLeadForm = {
    name: '',
    phone: '',
    email: '',
    course: '',
    message: '',
    source: 'Call',
  };
  addLeadSources = ['Call', 'Walk-in', 'Reference', 'WhatsApp', 'Other'];
  formErrors = {
    name: '',
    phone: '',
    email: '',
  };
  formFeedback = '';
  formFeedbackType: FormFeedbackType = '';

  private searchTimer?: ReturnType<typeof setTimeout>;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadLeads();
    this.loadBin();
    this.loadAnalytics();
  }

  loadLeads() {
    this.loading = true;
    this.error = '';

    const params = new HttpParams()
      .set('search', this.searchText.trim())
      .set('page', this.page)
      .set('size', this.size)
      .set('sortBy', this.mapLeadSortField())
      .set('direction', this.leadSortDirection);

    this.http.get<any>(`${environment.apiUrl}/api/leads`, { params })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (data) => {
          this.leads = (data?.content || []).map((item: any) => this.mapLead(item));
          this.totalPages = data?.totalPages || 0;
          this.totalElements = data?.totalElements || 0;

          this.refreshCityOptions();
          this.applyLocalFilters();
          this.selectedIds.clear();
          this.refreshCourseOptions();
        },
        error: (err) => {
          console.error('Leads API failed:', err);

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
          const total = res.total || 0;
          const joined = res.joined || 0;

          this.stats.total = total;
          this.stats.new = res.new || 0;
          this.stats.contacted = res.contacted || 0;
          this.stats.joined = joined;
          this.stats.conversionRate = total ? Math.round((joined / total) * 100) : 0;
        },
        error: () => { }
      });
  }

  loadBin() {
    this.binLoading = true;
    this.binError = '';

    const params = new HttpParams()
      .set('page', this.binPage)
      .set('size', this.binSize);

    this.http.get<any>(`${environment.apiUrl}/api/leads/bin`, { params })
      .pipe(finalize(() => {
        this.binLoading = false;
      }))
      .subscribe({
        next: (data) => {
          this.binLeads = (data?.content || []).map((item: any) => this.mapLead(item));
          this.binTotalPages = data?.totalPages || 0;
          this.binTotalElements = data?.totalElements || 0;
        },
        error: () => {
          this.binError = 'Unable to load bin.';
        }
      });
  }

  switchView(view: LeadView) {
    this.activeView = view;
    this.closeLeadDrawer();
    this.closeMessagePopup();
    this.closeDeletePopup();

    if (view === 'bin') {
      this.loadBin();
      return;
    }

    this.loadLeads();
    this.loadAnalytics();
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

  nextBinPage() {
    if (this.binPage < this.binTotalPages - 1) {
      this.binPage++;
      this.loadBin();
    }
  }

  prevBinPage() {
    if (this.binPage > 0) {
      this.binPage--;
      this.loadBin();
    }
  }

  onSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applyFilter(), 350);
  }

  applyFilter() {
    window.clearTimeout(this.searchTimer);
    this.page = 0;
    this.loadLeads();
  }

  applyLocalFilters() {
    const search = this.searchText.trim().toLowerCase();

    this.filteredLeads = this.leads.filter((lead) => {
      const matchSearch =
        !search ||
        lead.Name.toLowerCase().includes(search) ||
        lead.Phone.includes(this.searchText.trim());

      const matchStatus = this.selectedStatus ? lead.Status === this.selectedStatus : true;
      const matchCity = this.selectedCity ? lead.City === this.selectedCity : true;
      const leadDate = lead.Date ? lead.Date.split('T')[0] : '';

      const matchDate =
        (!this.fromDate || leadDate >= this.fromDate) &&
        (!this.toDate || leadDate <= this.toDate);

      return matchSearch && matchStatus && matchCity && matchDate;
    });

    this.syncSelectionWithFilteredRows();
    this.calculatePageStats();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedCity = '';
    this.fromDate = '';
    this.toDate = '';
    this.page = 0;
    this.loadLeads();
  }

  saveManualLead() {
    this.clearAddLeadMessages();

    const name = this.addLeadForm.name.trim();
    const phone = this.cleanPhone(this.addLeadForm.phone);
    const email = this.addLeadForm.email.trim();

    if (!name || !phone) {
      if (!name) this.formErrors.name = 'Name is required.';
      if (!phone) this.formErrors.phone = 'Phone is required.';
      this.formFeedback = 'Please fill required fields.';
      this.formFeedbackType = 'error';
      return;
    }

    if (phone.length < 10) {
      this.formErrors.phone = 'Enter valid phone number.';
      this.formFeedback = 'Phone number is invalid.';
      this.formFeedbackType = 'error';
      return;
    }

    if (email && !this.isValidEmail(email)) {
      this.formErrors.email = 'Enter valid email address.';
      this.formFeedback = 'Email format is invalid.';
      this.formFeedbackType = 'error';
      return;
    }

    const payload = {
      name,
      phone,
      email,
      course: this.addLeadForm.course.trim(),
      message: this.addLeadForm.message.trim(),
      source: this.addLeadForm.source || 'Call',
    };

    this.addLeadSaving = true;
    this.http.post(`${environment.apiUrl}/api/leads/save`, payload)
      .pipe(finalize(() => this.addLeadSaving = false))
      .subscribe({
        next: () => {
          this.showToast('Lead saved successfully.');
          this.formFeedback = 'Lead saved successfully.';
          this.formFeedbackType = 'success';
          this.resetManualLeadForm();
          this.page = 0;
          this.loadLeads();
          this.loadAnalytics();
        },
        error: (err) => {
          const msg = err?.error || 'Failed to add lead. Try again.';
          this.formFeedback = msg;
          this.formFeedbackType = 'error';
          this.showToast(msg, 'error');
        },
      });
  }

  onAddLeadPhoneBlur() {
    const phone = this.cleanPhone(this.addLeadForm.phone);
    this.addLeadForm.phone = phone;
  }

  resetManualLeadForm() {
    this.addLeadForm = {
      name: '',
      phone: '',
      email: '',
      course: '',
      message: '',
      source: 'Call',
    };
    this.clearAddLeadMessages();
  }

  applySort(option: { field: string; direction: SortDirection }) {
    this.leadSortBy = option.field;
    this.leadSortDirection = option.direction;
    this.syncSelectedSortIndex();
    this.page = 0;
    this.loadLeads();
  }

  applySortByIndex(index: string | number) {
    const selectedIndex = Number(index);
    const option = this.sortOptions[selectedIndex];

    if (!option) {
      return;
    }

    this.selectedSortIndex = selectedIndex;
    this.applySort(option);
  }

  toggleSort(field: 'date' | 'name') {
    if (this.leadSortBy === field) {
      this.leadSortDirection = this.leadSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.leadSortBy = field;
      this.leadSortDirection = field === 'date' ? 'desc' : 'asc';
    }

    this.page = 0;
    this.syncSelectedSortIndex();
    this.loadLeads();
  }

  mapLeadSortField() {
    return this.leadSortBy === 'name' ? 'name' : 'createdAt';
  }

  getSortLabel(field: 'date' | 'name') {
    if (this.leadSortBy !== field) {
      return '';
    }

    return this.leadSortDirection === 'asc' ? 'Asc' : 'Desc';
  }

  onStatusChange(lead: LeadRow) {
    lead.isChanged = lead.tempStatus !== lead.Status;
    this.calculatePageStats();
  }

  saveStatus(lead: LeadRow) {
    const params = new HttpParams()
      .set('phone', lead.Phone)
      .set('status', lead.tempStatus);

    this.http.post(`${environment.apiUrl}/api/leads/status`, null, { params })
      .subscribe({
        next: () => {
          lead.Status = lead.tempStatus;
          lead.isChanged = false;
          this.loadAnalytics();
          this.applyLocalFilters();
          this.showToast('Status updated.');
        },
        error: () => this.showToast('Failed to update status.', 'error')
      });
  }

  cancelStatus(lead: LeadRow) {
    lead.tempStatus = lead.Status;
    lead.isChanged = false;
    this.calculatePageStats();
  }

  onFollowUpChange(lead: LeadRow) {
    lead.isFollowUpChanged = lead.tempFollowUp !== lead.FollowUp;
    this.calculatePageStats();
  }

  saveFollowUp(lead: LeadRow) {
    if (!lead.tempFollowUp) {
      this.showToast('Choose a follow-up date first.', 'error');
      return;
    }

    const params = new HttpParams()
      .set('phone', lead.Phone)
      .set('date', lead.tempFollowUp);

    this.http.post(`${environment.apiUrl}/api/leads/followup`, null, { params })
      .subscribe({
        next: () => {
          lead.FollowUp = lead.tempFollowUp;
          lead.isFollowUpChanged = false;
          this.calculatePageStats();
          this.showToast('Follow-up updated.');
        },
        error: () => this.showToast('Failed to update follow-up.', 'error')
      });
  }

  markFollowUpToday(lead: LeadRow) {
    lead.tempFollowUp = this.todayDate;
    this.onFollowUpChange(lead);
    this.saveFollowUp(lead);
  }

  cancelFollowUp(lead: LeadRow) {
    lead.tempFollowUp = lead.FollowUp;
    lead.isFollowUpChanged = false;
    this.calculatePageStats();
  }

  openDeletePopup(lead: LeadRow) {
    this.selectedLeadToDelete = lead;
    this.showDeletePopup = true;
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
    this.selectedLeadToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedLeadToDelete) {
      return;
    }

    this.actionBusy = true;
    this.http.delete(`${environment.apiUrl}/api/leads/${this.selectedLeadToDelete.id}`)
      .pipe(finalize(() => this.actionBusy = false))
      .subscribe({
        next: () => {
          this.showToast('Lead moved to bin.');
          this.closeDeletePopup();
          this.loadLeads();
          this.loadAnalytics();
        },
        error: () => this.showToast('Failed to delete lead.', 'error')
      });
  }

  restoreLead(lead: LeadRow) {
    this.actionBusy = true;

    this.http.put(`${environment.apiUrl}/api/leads/restore/${lead.id}`, null)
      .pipe(finalize(() => this.actionBusy = false))
      .subscribe({
        next: () => {
          this.showToast('Lead restored.');
          this.loadBin();
          this.loadAnalytics();
        },
        error: () => this.showToast('Failed to restore lead.', 'error')
      });
  }

  deletePermanent(lead: LeadRow) {
    const confirmed = window.confirm(`Permanently delete ${lead.Name || lead.Phone}?`);

    if (!confirmed) {
      return;
    }

    this.actionBusy = true;

    this.http.delete(`${environment.apiUrl}/api/leads/permanent/${lead.id}`)
      .pipe(finalize(() => this.actionBusy = false))
      .subscribe({
        next: () => {
          this.showToast('Lead permanently deleted.');
          this.loadBin();
          this.loadAnalytics();
        },
        error: () => this.showToast('Failed to permanently delete lead.', 'error')
      });
  }

  openMessagePopup(lead: LeadRow) {
    this.selectedMessageLead = lead;
    this.showMessagePopup = true;
  }

  closeMessagePopup() {
    this.showMessagePopup = false;
    this.selectedMessageLead = null;
  }

  openLeadDrawer(lead: LeadRow) {
    this.selectedLead = lead;
    this.showLeadDrawer = true;
  }

  closeLeadDrawer() {
    this.showLeadDrawer = false;
    this.selectedLead = null;
  }

  openWhatsAppLead(lead: LeadRow) {
    window.open(this.getWhatsappLink(lead), '_blank');
  }

  callLead(lead: LeadRow) {
    const phone = this.cleanPhone(lead.Phone);
    window.open(`tel:${phone}`, '_self');
  }

  async copyPhone(lead: LeadRow) {
    try {
      await navigator.clipboard.writeText(lead.Phone);
      this.showToast('Phone copied.');
    } catch {
      this.showToast('Copy failed.', 'error');
    }
  }

  getWhatsappLink(lead: LeadRow) {
    const phone = this.cleanPhone(lead.Phone);
    const normalized = phone.length === 10 ? `91${phone}` : phone;

    return `https://api.whatsapp.com/send?phone=${normalized}`;
  }

  exportCSV() {
    const headers = [
      'DATE',
      'NAME',
      'PHONE',
      'EMAIL',
      'COURSE',
      'BATCH',
      'STATUS',
      'CITY',
      'FOLLOW_UP',
      'SOURCE',
      'EXPECTED_AMOUNT',
      'MESSAGE'
    ];

    const rows = this.filteredLeads.map((lead) => [
      lead.Date,
      lead.Name,
      lead.Phone,
      lead.Email,
      lead.Course,
      lead.Batch,
      lead.Status,
      lead.City,
      lead.FollowUp,
      lead.Source,
      lead.ExpectedAmount ?? '',
      lead.Message
    ].map(value => this.escapeCsv(value)).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `VT_Leads_${this.todayDate}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  refreshLeads() {
    if (this.activeView === 'bin') {
      this.loadBin();
      return;
    }

    this.loadLeads();
    this.loadAnalytics();
  }

  getTodayFollowups() {
    return this.filteredLeads.filter(lead => lead.FollowUp === this.todayDate).length;
  }

  getInitials(lead: LeadRow | null) {
    if (!lead) {
      return 'LD';
    }

    const source = lead.Name || lead.Phone || 'Lead';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'LD';
  }

  getStatusClass(status: string) {
    return {
      'status-new': status === 'New',
      'status-contacted': status === 'Contacted',
      'status-joined': status === 'Joined',
    };
  }

  getFollowUpClass(lead: LeadRow) {
    if (!lead.FollowUp) {
      return 'follow-neutral';
    }

    if (lead.FollowUp < this.todayDate) {
      return 'follow-overdue';
    }

    if (lead.FollowUp === this.todayDate) {
      return 'follow-today';
    }

    return 'follow-upcoming';
  }

  toggleLeadSelection(lead: LeadRow, checked: boolean) {
    if (!lead.id) {
      return;
    }

    if (checked) {
      this.selectedIds.add(lead.id);
    } else {
      this.selectedIds.delete(lead.id);
    }
  }

  toggleSelectAll(checked: boolean) {
    this.filteredLeads.forEach((lead) => this.toggleLeadSelection(lead, checked));
  }

  isLeadSelected(lead: LeadRow) {
    return this.selectedIds.has(lead.id);
  }

  areAllVisibleSelected() {
    return this.filteredLeads.length > 0 &&
      this.filteredLeads.every(lead => this.selectedIds.has(lead.id));
  }

  get selectedCount() {
    return this.selectedIds.size;
  }

  bulkUpdateStatus() {
    const selected = this.leads.filter(lead => this.selectedIds.has(lead.id));

    if (!selected.length) {
      return;
    }

    this.bulkBusy = true;
    const requests = selected.map((lead) => {
      const params = new HttpParams()
        .set('phone', lead.Phone)
        .set('status', this.bulkStatus);

      return this.http.post(`${environment.apiUrl}/api/leads/status`, null, { params });
    });

    forkJoin(requests)
      .pipe(finalize(() => this.bulkBusy = false))
      .subscribe({
        next: () => {
          this.showToast(`${selected.length} lead(s) updated.`);
          this.selectedIds.clear();
          this.loadLeads();
          this.loadAnalytics();
        },
        error: () => this.showToast('Bulk status update failed.', 'error')
      });
  }

  bulkDelete() {
    const ids = [...this.selectedIds];

    if (!ids.length) {
      return;
    }

    this.bulkBusy = true;
    const requests = ids.map(id => this.http.delete(`${environment.apiUrl}/api/leads/${id}`));

    forkJoin(requests)
      .pipe(finalize(() => this.bulkBusy = false))
      .subscribe({
        next: () => {
          this.showToast(`${ids.length} lead(s) moved to bin.`);
          this.selectedIds.clear();
          this.loadLeads();
          this.loadAnalytics();
        },
        error: () => this.showToast('Bulk delete failed.', 'error')
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: any) {
    const hasChanges = this.leads.some(lead => lead.isChanged || lead.isFollowUpChanged);

    if (hasChanges) {
      event.returnValue = true;
    }
  }

  private refreshCourseOptions() {
    this.courseOptions = [...new Set(this.leads.map(lead => lead.Course).filter(Boolean))].sort();
  }

  private mapLead(item: any): LeadRow {
    const status = (item.status || 'New') as LeadStatus;

    return {
      id: item.id,
      Date: item.createdAt || '',
      Name: item.name || '',
      Phone: item.phone || '',
      Email: item.email || '',
      Course: item.course || '',
      Batch: item.batch || '',
      City: item.city || '',
      Message: item.message || '',
      Status: status,
      tempStatus: status,
      isChanged: false,
      FollowUp: item.followUpDate || '',
      tempFollowUp: item.followUpDate || '',
      isFollowUpChanged: false,
      Source: item.source || 'Website',
      ExpectedAmount: item.expectedAmount ?? null,
      DeletedAt: item.deletedAt || '',
    };
  }

  private refreshCityOptions() {
    this.cities = [...new Set(this.leads.map(lead => lead.City).filter(Boolean))].sort();
  }

  private calculatePageStats() {
    this.pageStats.showing = this.filteredLeads.length;
    this.pageStats.todayFollowups = this.filteredLeads.filter(lead => lead.FollowUp === this.todayDate).length;
    this.pageStats.pendingEdits = this.leads.filter(lead => lead.isChanged || lead.isFollowUpChanged).length;
  }

  private syncSelectionWithFilteredRows() {
    const visibleIds = new Set(this.filteredLeads.map(lead => lead.id));

    [...this.selectedIds].forEach((id) => {
      if (!visibleIds.has(id)) {
        this.selectedIds.delete(id);
      }
    });
  }

  private syncSelectedSortIndex() {
    const index = this.sortOptions.findIndex((option) =>
      option.field === this.leadSortBy && option.direction === this.leadSortDirection
    );

    this.selectedSortIndex = index >= 0 ? index : 0;
  }

  private cleanPhone(phone: string) {
    return String(phone || '').replace(/\D/g, '');
  }

  private clearAddLeadMessages() {
    this.formErrors = {
      name: '',
      phone: '',
      email: '',
    };
    this.formFeedback = '';
    this.formFeedbackType = '';
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private escapeCsv(value: any) {
    const text = String(value ?? '');

    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  private showToast(message: string, type: ToastType = 'success') {
    clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 2800);
  }
}
