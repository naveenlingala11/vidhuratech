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
type ViewMode = 'table' | 'pipeline' | 'cards';
type ToastType = 'success' | 'error';

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

interface PipelineColumn {
  status: LeadStatus;
  label: string;
  leads: LeadRow[];
  value: number;
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
  groupedLeadsList: any[] = [];
  drawerInquiries: LeadRow[] = [];

  loading = false;
  binLoading = false;
  actionBusy = false;
  bulkBusy = false;
  addLeadSaving = false;
  showQuickCapture = false;
  showAdvancedFilters = false;
  showHistory = false;
  expandedDuplicateEmails: { [email: string]: boolean } = {};

  error = '';
  binError = '';

  activeView: LeadView = 'active';
  viewMode: ViewMode = 'table';

  searchText = '';
  selectedStatus = '';
  selectedCity = '';
  selectedCourse = '';
  selectedSource = '';
  selectedTemperature = '';
  fromDate = '';
  toDate = '';

  cities: string[] = [];
  courseOptions: string[] = [];
  sourceOptions: string[] = [];

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  binPage = 0;
  binSize = 10;
  binTotalPages = 0;
  binTotalElements = 0;

  leadSortBy = 'createdAt';
  leadSortDirection: SortDirection = 'desc';
  selectedSortIndex = 0;

  readonly statuses: LeadStatus[] = ['New', 'Contacted', 'Joined'];
  readonly pageSizeOptions = [10, 25, 50, 100];
  readonly todayDate = new Date().toISOString().split('T')[0];

  readonly sortOptions = [
    { label: 'Newest First', field: 'createdAt', direction: 'desc' as SortDirection },
    { label: 'Oldest First', field: 'createdAt', direction: 'asc' as SortDirection },
    { label: 'Name A-Z', field: 'name', direction: 'asc' as SortDirection },
    { label: 'Name Z-A', field: 'name', direction: 'desc' as SortDirection },
  ];

  readonly sources = [
    'Website',
    'Call',
    'Walk-in',
    'Reference',
    'WhatsApp',
    'PUBLIC_PRACTICE_START',
    'PUBLIC_MOCK_TEST',
    'PUBLIC_CODING_CHALLENGE',
    'Other',
  ];

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
    overdueFollowups: 0,
    pendingEdits: 0,
    hot: 0,
    warm: 0,
    cold: 0,
  };

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

  addLeadForm = {
    name: '',
    phone: '',
    email: '',
    course: '',
    city: '',
    message: '',
    source: 'Call',
  };

  formErrors = { name: '', phone: '', email: '' };
  formFeedback = '';
  formFeedbackType: ToastType | '' = '';

  private searchTimer?: ReturnType<typeof setTimeout>;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLeads();
    this.loadBin();
    this.loadAnalytics();
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages || 1;
    const current = this.page + 1;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get binPageNumbers(): number[] {
    const total = this.binTotalPages || 1;
    const current = this.binPage + 1;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get pipelineColumns(): PipelineColumn[] {
    return this.statuses.map((status) => {
      const leads = this.filteredLeads.filter((lead) => lead.Status === status);
      return {
        status,
        label: status,
        leads,
        value: leads.reduce((sum, lead) => sum + (lead.ExpectedAmount || 0), 0),
      };
    });
  }

  get topSources(): { source: string; count: number }[] {
    const map = new Map<string, number>();
    this.leads.forEach((lead) =>
      map.set(lead.Source || 'Website', (map.get(lead.Source || 'Website') || 0) + 1),
    );
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  get premiumSummary(): string {
    if (!this.filteredLeads.length) return 'No matching leads right now.';
    const hot = this.filteredLeads.filter((lead) => this.getLeadTemperature(lead) === 'Hot').length;
    const overdue = this.filteredLeads.filter(
      (lead) => lead.FollowUp && lead.FollowUp < this.todayDate,
    ).length;
    return `${hot} hot leads, ${overdue} overdue follow-ups, ${this.filteredLeads.length} visible records.`;
  }

  generateGroupedLeads(): void {
    const result: any[] = [];
    const emailGroups = new Map<string, LeadRow[]>();
    
    // Group active leads by email
    this.filteredLeads.forEach(lead => {
      const email = lead.Email?.trim().toLowerCase() || '';
      if (email) {
        if (!emailGroups.has(email)) {
          emailGroups.set(email, []);
        }
        emailGroups.get(email)!.push(lead);
      }
    });
    
    const processedEmails = new Set<string>();
    
    this.filteredLeads.forEach(lead => {
      const email = lead.Email?.trim().toLowerCase() || '';
      if (!email) {
        // Leads without emails are added as independent master rows
        result.push({
          lead,
          isMaster: true,
          isChild: false,
          hasDuplicates: false,
          duplicateCount: 1,
          isExpanded: false,
          masterEmail: ''
        });
      } else {
        if (processedEmails.has(email)) return;
        
        const groupLeads = emailGroups.get(email) || [];
        if (groupLeads.length <= 1) {
          result.push({
            lead,
            isMaster: true,
            isChild: false,
            hasDuplicates: false,
            duplicateCount: 1,
            isExpanded: false,
            masterEmail: email
          });
        } else {
          // Master row for the duplicate group (show the first lead)
          const isExpanded = !!this.expandedDuplicateEmails[email];
          result.push({
            lead: groupLeads[0],
            isMaster: true,
            isChild: false,
            hasDuplicates: true,
            duplicateCount: groupLeads.length,
            isExpanded,
            masterEmail: email
          });
          
          // If expanded, add the other child rows
          if (isExpanded) {
            for (let i = 1; i < groupLeads.length; i++) {
              result.push({
                lead: groupLeads[i],
                isMaster: false,
                isChild: true,
                hasDuplicates: false,
                duplicateCount: groupLeads.length,
                isExpanded: false,
                masterEmail: email
              });
            }
          }
        }
        processedEmails.add(email);
      }
    });
    
    this.groupedLeadsList = result;
  }

  toggleEmailGroup(email: string, event: Event): void {
    event.stopPropagation();
    this.expandedDuplicateEmails[email] = !this.expandedDuplicateEmails[email];
    this.generateGroupedLeads();
  }

  getInquiriesForLead(lead: LeadRow | null): LeadRow[] {
    if (!lead) return [];
    if (!lead.Email && !lead.Phone) return [lead];
    // Find all leads with the same phone or email
    return this.leads.filter(l => 
      (lead.Email && l.Email && l.Email.toLowerCase() === lead.Email.toLowerCase()) ||
      (lead.Phone && l.Phone && l.Phone === lead.Phone)
    );
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  loadLeads(): void {
    this.loading = true;
    this.error = '';

    const params = new HttpParams()
      .set('search', this.searchText.trim())
      .set('page', this.page)
      .set('size', this.size)
      .set('sortBy', this.leadSortBy)
      .set('direction', this.leadSortDirection);

    this.http
      .get<any>(`${environment.apiUrl}/api/leads`, { params })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.leads = (data?.content || []).map((item: any) => this.mapLead(item));
          this.totalPages = data?.totalPages || 0;
          this.totalElements = data?.totalElements || 0;
          this.refreshFilterOptions();
          this.applyLocalFilters();
          this.selectedIds.clear();
        },
        error: (err) => {
          this.error =
            err.status === 403
              ? 'Access denied. Please login as Admin or Super Admin.'
              : 'Unable to load leads.';
        },
      });
  }

  loadAnalytics(): void {
    this.http.get<any>(`${environment.apiUrl}/api/leads/analytics`).subscribe({
      next: (res) => {
        const total = res.total || 0;
        const joined = res.joined || 0;
        this.stats = {
          total,
          new: res.new || 0,
          contacted: res.contacted || 0,
          joined,
          conversionRate: total ? Math.round((joined / total) * 100) : 0,
        };
      },
      error: () => {},
    });
  }

  loadBin(): void {
    this.binLoading = true;
    this.binError = '';

    const params = new HttpParams().set('page', this.binPage).set('size', this.binSize);

    this.http
      .get<any>(`${environment.apiUrl}/api/leads/bin`, { params })
      .pipe(finalize(() => (this.binLoading = false)))
      .subscribe({
        next: (data) => {
          this.binLeads = (data?.content || []).map((item: any) => this.mapLead(item));
          this.binTotalPages = data?.totalPages || 0;
          this.binTotalElements = data?.totalElements || 0;
        },
        error: () => {
          this.binError = 'Unable to load bin.';
        },
      });
  }

  switchView(view: LeadView): void {
    this.activeView = view;
    this.closeLeadDrawer();
    this.closeMessagePopup();
    this.closeDeletePopup();
    view === 'bin' ? this.loadBin() : this.refreshLeads();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  applySortByIndex(index: string | number): void {
    const selectedIndex = Number(index);
    const option = this.sortOptions[selectedIndex];
    if (!option) return;

    this.selectedSortIndex = selectedIndex;
    this.leadSortBy = option.field;
    this.leadSortDirection = option.direction;
    this.page = 0;
    this.loadLeads();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applyFilter(), 350);
  }

  applyFilter(): void {
    clearTimeout(this.searchTimer);
    this.page = 0;
    this.loadLeads();
  }

  applyLocalFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredLeads = this.leads.filter((lead) => {
      const leadDate = lead.Date ? lead.Date.split('T')[0] : '';
      const searchable = [
        lead.Name,
        lead.Phone,
        lead.Email,
        lead.Course,
        lead.City,
        lead.Source,
        lead.Message,
        lead.Status,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (!this.selectedStatus || lead.Status === this.selectedStatus) &&
        (!this.selectedCity || lead.City === this.selectedCity) &&
        (!this.selectedCourse || lead.Course === this.selectedCourse) &&
        (!this.selectedSource || lead.Source === this.selectedSource) &&
        (!this.selectedTemperature || this.getLeadTemperature(lead) === this.selectedTemperature) &&
        (!this.fromDate || leadDate >= this.fromDate) &&
        (!this.toDate || leadDate <= this.toDate)
      );
    });

    this.syncSelectionWithFilteredRows();
    this.calculatePageStats();
    this.generateGroupedLeads();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedCity = '';
    this.selectedCourse = '';
    this.selectedSource = '';
    this.selectedTemperature = '';
    this.fromDate = '';
    this.toDate = '';
    this.page = 0;
    this.loadLeads();
  }

  saveManualLead(): void {
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
      city: this.addLeadForm.city.trim(),
      message: this.addLeadForm.message.trim(),
      source: this.addLeadForm.source || 'Call',
    };

    this.addLeadSaving = true;

    this.http
      .post(`${environment.apiUrl}/api/leads/save`, payload)
      .pipe(finalize(() => (this.addLeadSaving = false)))
      .subscribe({
        next: () => {
          this.showToast('Lead saved successfully.');
          this.formFeedback = 'Lead saved successfully.';
          this.formFeedbackType = 'success';
          this.resetManualLeadForm();
          this.page = 0;
          this.refreshLeads();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error || 'Failed to add lead.';
          this.formFeedback = msg;
          this.formFeedbackType = 'error';
          this.showToast(msg, 'error');
        },
      });
  }

  resetManualLeadForm(): void {
    this.addLeadForm = {
      name: '',
      phone: '',
      email: '',
      course: '',
      city: '',
      message: '',
      source: 'Call',
    };
    this.clearAddLeadMessages();
  }

  onAddLeadPhoneBlur(): void {
    this.addLeadForm.phone = this.cleanPhone(this.addLeadForm.phone);
  }

  saveStatus(lead: LeadRow): void {
    const params = new HttpParams().set('phone', lead.Phone).set('status', lead.tempStatus);

    this.http.post(`${environment.apiUrl}/api/leads/status`, null, { params }).subscribe({
      next: () => {
        lead.Status = lead.tempStatus;
        lead.isChanged = false;
        this.applyLocalFilters();
        this.loadAnalytics();
        this.showToast('Status updated.');
      },
      error: () => this.showToast('Failed to update status.', 'error'),
    });
  }

  onStatusChange(lead: LeadRow): void {
    lead.isChanged = lead.tempStatus !== lead.Status;
    this.calculatePageStats();
  }

  cancelStatus(lead: LeadRow): void {
    lead.tempStatus = lead.Status;
    lead.isChanged = false;
    this.calculatePageStats();
  }

  saveFollowUp(lead: LeadRow): void {
    if (!lead.tempFollowUp) {
      this.showToast('Choose a follow-up date first.', 'error');
      return;
    }

    const params = new HttpParams().set('phone', lead.Phone).set('date', lead.tempFollowUp);

    this.http.post(`${environment.apiUrl}/api/leads/followup`, null, { params }).subscribe({
      next: () => {
        lead.FollowUp = lead.tempFollowUp;
        lead.isFollowUpChanged = false;
        this.calculatePageStats();
        this.showToast('Follow-up updated.');
      },
      error: () => this.showToast('Failed to update follow-up.', 'error'),
    });
  }

  onFollowUpChange(lead: LeadRow): void {
    lead.isFollowUpChanged = lead.tempFollowUp !== lead.FollowUp;
    this.calculatePageStats();
  }

  markFollowUpToday(lead: LeadRow): void {
    lead.tempFollowUp = this.todayDate;
    this.onFollowUpChange(lead);
    this.saveFollowUp(lead);
  }

  cancelFollowUp(lead: LeadRow): void {
    lead.tempFollowUp = lead.FollowUp;
    lead.isFollowUpChanged = false;
    this.calculatePageStats();
  }

  bulkUpdateStatus(): void {
    const selected = this.leads.filter((lead) => this.selectedIds.has(lead.id));
    if (!selected.length) return;

    this.bulkBusy = true;

    const requests = selected.map((lead) => {
      const params = new HttpParams().set('phone', lead.Phone).set('status', this.bulkStatus);
      return this.http.post(`${environment.apiUrl}/api/leads/status`, null, { params });
    });

    forkJoin(requests)
      .pipe(finalize(() => (this.bulkBusy = false)))
      .subscribe({
        next: () => {
          this.showToast(`${selected.length} lead(s) updated.`);
          this.selectedIds.clear();
          this.refreshLeads();
        },
        error: () => this.showToast('Bulk status update failed.', 'error'),
      });
  }

  bulkDelete(): void {
    const ids = [...this.selectedIds];
    if (!ids.length) return;

    this.bulkBusy = true;

    forkJoin(ids.map((id) => this.http.delete(`${environment.apiUrl}/api/leads/${id}`)))
      .pipe(finalize(() => (this.bulkBusy = false)))
      .subscribe({
        next: () => {
          this.showToast(`${ids.length} lead(s) moved to bin.`);
          this.selectedIds.clear();
          this.refreshLeads();
        },
        error: () => this.showToast('Bulk delete failed.', 'error'),
      });
  }

  openDeletePopup(lead: LeadRow): void {
    this.selectedLeadToDelete = lead;
    this.showDeletePopup = true;
  }

  closeDeletePopup(): void {
    this.showDeletePopup = false;
    this.selectedLeadToDelete = null;
  }

  confirmDelete(): void {
    if (!this.selectedLeadToDelete) return;

    this.actionBusy = true;

    this.http
      .delete(`${environment.apiUrl}/api/leads/${this.selectedLeadToDelete.id}`)
      .pipe(finalize(() => (this.actionBusy = false)))
      .subscribe({
        next: () => {
          this.showToast('Lead moved to bin.');
          this.closeDeletePopup();
          this.refreshLeads();
        },
        error: () => this.showToast('Failed to delete lead.', 'error'),
      });
  }

  restoreLead(lead: LeadRow): void {
    this.actionBusy = true;

    this.http
      .put(`${environment.apiUrl}/api/leads/restore/${lead.id}`, null)
      .pipe(finalize(() => (this.actionBusy = false)))
      .subscribe({
        next: () => {
          this.showToast('Lead restored.');
          this.loadBin();
          this.loadAnalytics();
        },
        error: () => this.showToast('Failed to restore lead.', 'error'),
      });
  }

  deletePermanent(lead: LeadRow): void {
    if (!window.confirm(`Permanently delete ${lead.Name || lead.Phone}?`)) return;

    this.actionBusy = true;

    this.http
      .delete(`${environment.apiUrl}/api/leads/permanent/${lead.id}`)
      .pipe(finalize(() => (this.actionBusy = false)))
      .subscribe({
        next: () => {
          this.showToast('Lead permanently deleted.');
          this.loadBin();
          this.loadAnalytics();
        },
        error: () => this.showToast('Failed to permanently delete lead.', 'error'),
      });
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.page = pageNumber - 1;
    this.loadLeads();
  }

  goToBinPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.binTotalPages) return;
    this.binPage = pageNumber - 1;
    this.loadBin();
  }

  nextPage(): void {
    this.goToPage(this.page + 2);
  }

  prevPage(): void {
    this.goToPage(this.page);
  }

  nextBinPage(): void {
    this.goToBinPage(this.binPage + 2);
  }

  prevBinPage(): void {
    this.goToBinPage(this.binPage);
  }

  toggleLeadSelection(lead: LeadRow, checked: boolean): void {
    if (!lead.id) return;
    checked ? this.selectedIds.add(lead.id) : this.selectedIds.delete(lead.id);
  }

  toggleSelectAll(checked: boolean): void {
    this.filteredLeads.forEach((lead) => this.toggleLeadSelection(lead, checked));
  }

  isLeadSelected(lead: LeadRow): boolean {
    return this.selectedIds.has(lead.id);
  }

  areAllVisibleSelected(): boolean {
    return (
      this.filteredLeads.length > 0 &&
      this.filteredLeads.every((lead) => this.selectedIds.has(lead.id))
    );
  }

  openMessagePopup(lead: LeadRow): void {
    this.selectedMessageLead = lead;
    this.showMessagePopup = true;
  }

  closeMessagePopup(): void {
    this.showMessagePopup = false;
    this.selectedMessageLead = null;
  }

  openLeadDrawer(lead: LeadRow): void {
    this.selectedLead = lead;
    this.drawerInquiries = this.getInquiriesForLead(lead);
    this.showLeadDrawer = true;
    this.showHistory = false;
  }

  closeLeadDrawer(): void {
    this.showLeadDrawer = false;
    this.selectedLead = null;
    this.drawerInquiries = [];
    this.showHistory = false;
  }

  openWhatsAppLead(lead: LeadRow): void {
    window.open(this.getWhatsappLink(lead), '_blank');
  }

  callLead(lead: LeadRow): void {
    const phone = this.cleanPhone(lead.Phone);
    window.open(`tel:${phone}`, '_self');
  }

  async copyPhone(lead: LeadRow): Promise<void> {
    try {
      await navigator.clipboard.writeText(lead.Phone);
      this.showToast('Phone copied.');
    } catch {
      this.showToast('Copy failed.', 'error');
    }
  }

  getWhatsappLink(lead: LeadRow): string {
    const phone = this.cleanPhone(lead.Phone);
    const normalized = phone.length === 10 ? `91${phone}` : phone;
    
    const name = lead.Name ? lead.Name.trim() : 'there';
    const course = lead.Course ? lead.Course.trim() : 'our training program';
    const source = lead.Source ? lead.Source.trim() : 'our website';
    
    const message = `Hello *${name}*! 👋\n\n` +
      `Thank you for contacting *Vidhura Tech*! 🚀 We received your inquiry regarding the *${course}* track (Source: ${source}). 📚\n\n` +
      `To help you get started immediately, here are details on our courses and coding practice subscriptions:\n\n` +
      `📘 *1. Comprehensive Course Tracks:*\n` +
      `• Industry-aligned curriculum & modules\n` +
      `• Live interactive classes with expert trainers\n` +
      `• Real-world projects & case studies\n\n` +
      `💻 *2. Coding Practice & Mock Test Subscriptions:*\n` +
      `• Unlimited access to our coding playgrounds & mock tests\n` +
      `• Automated evaluation dashboard with instant feedback\n` +
      `• Flexible subscription pricing plans (Individual Mock Tests / Practice Packages)\n\n` +
      `📥 *What would you like to receive?*\n` +
      `👉 Reply with *1* to get the *Detailed Course Syllabus & Batch Timings*\n` +
      `👉 Reply with *2* to get the *Practice Portal Trial & Subscription Pricing Plans*\n` +
      `👉 Reply with *3* to chat directly with a *Support Representative*\n\n` +
      `We look forward to helping you master your skills! 🌟\n\n` +
      `Best regards,\n` +
      `*Support & Admissions Team*\n` +
      `*Vidhura Tech* 🏛️`;
      
    return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(message)}`;
  }

  exportCSV(): void {
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
      'MESSAGE',
    ];

    const rows = this.filteredLeads.map((lead) =>
      [
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
        lead.Message,
      ]
        .map((value) => this.escapeCsv(value))
        .join(','),
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `VT_Leads_${this.todayDate}.csv`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  refreshLeads(): void {
    if (this.activeView === 'bin') {
      this.loadBin();
      return;
    }

    this.loadLeads();
    this.loadAnalytics();
  }

  getInitials(lead: LeadRow | null): string {
    if (!lead) return 'LD';
    const source = lead.Name || lead.Phone || 'Lead';
    return (
      source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'LD'
    );
  }

  getStatusClass(status: string): string {
    if (status === 'New') return 'status-new';
    if (status === 'Contacted') return 'status-contacted';
    if (status === 'Joined') return 'status-joined';
    return '';
  }

  getFollowUpClass(lead: LeadRow): string {
    if (!lead.FollowUp) return 'follow-neutral';
    if (lead.FollowUp < this.todayDate) return 'follow-overdue';
    if (lead.FollowUp === this.todayDate) return 'follow-today';
    return 'follow-upcoming';
  }

  getLeadTemperature(lead: LeadRow | null): 'Hot' | 'Warm' | 'Cold' {
    if (!lead) return 'Cold';
    if (lead.Status === 'Joined') return 'Hot';
    if (lead.FollowUp && lead.FollowUp <= this.todayDate) return 'Hot';
    if (lead.Source?.includes('PUBLIC_')) return 'Warm';
    if (lead.Message?.length > 30) return 'Warm';
    return 'Cold';
  }

  getLeadScore(lead: LeadRow | null): number {
    if (!lead) return 0;
    let score = 35;

    if (lead.Name) score += 8;
    if (lead.Phone) score += 12;
    if (lead.Email) score += 8;
    if (lead.Course) score += 12;
    if (lead.City) score += 6;
    if (lead.Message) score += 8;
    if (lead.Source?.includes('PUBLIC_')) score += 8;
    if (lead.FollowUp && lead.FollowUp <= this.todayDate) score += 12;
    if (lead.Status === 'Contacted') score += 8;
    if (lead.Status === 'Joined') score = 100;

    return Math.min(score, 100);
  }

  getTemperatureClass(lead: LeadRow | null): string {
    return `temp-${this.getLeadTemperature(lead).toLowerCase()}`;
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: any): void {
    const hasChanges = this.leads.some((lead) => lead.isChanged || lead.isFollowUpChanged);
    if (hasChanges) event.returnValue = true;
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

  private refreshFilterOptions(): void {
    this.cities = [...new Set(this.leads.map((lead) => lead.City).filter(Boolean))].sort();
    this.courseOptions = [...new Set(this.leads.map((lead) => lead.Course).filter(Boolean))].sort();
    this.sourceOptions = [...new Set(this.leads.map((lead) => lead.Source).filter(Boolean))].sort();
  }

  private calculatePageStats(): void {
    this.pageStats.showing = this.filteredLeads.length;
    this.pageStats.todayFollowups = this.filteredLeads.filter(
      (lead) => lead.FollowUp === this.todayDate,
    ).length;
    this.pageStats.overdueFollowups = this.filteredLeads.filter(
      (lead) => lead.FollowUp && lead.FollowUp < this.todayDate,
    ).length;
    this.pageStats.pendingEdits = this.leads.filter(
      (lead) => lead.isChanged || lead.isFollowUpChanged,
    ).length;
    this.pageStats.hot = this.filteredLeads.filter(
      (lead) => this.getLeadTemperature(lead) === 'Hot',
    ).length;
    this.pageStats.warm = this.filteredLeads.filter(
      (lead) => this.getLeadTemperature(lead) === 'Warm',
    ).length;
    this.pageStats.cold = this.filteredLeads.filter(
      (lead) => this.getLeadTemperature(lead) === 'Cold',
    ).length;
  }

  private syncSelectionWithFilteredRows(): void {
    const visibleIds = new Set(this.filteredLeads.map((lead) => lead.id));
    [...this.selectedIds].forEach((id) => {
      if (!visibleIds.has(id)) this.selectedIds.delete(id);
    });
  }

  private cleanPhone(phone: string): string {
    return String(phone || '').replace(/\D/g, '');
  }

  private clearAddLeadMessages(): void {
    this.formErrors = { name: '', phone: '', email: '' };
    this.formFeedback = '';
    this.formFeedbackType = '';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private escapeCsv(value: any): string {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  private showToast(message: string, type: ToastType = 'success'): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = setTimeout(() => (this.toastMessage = ''), 2800);
  }
}
