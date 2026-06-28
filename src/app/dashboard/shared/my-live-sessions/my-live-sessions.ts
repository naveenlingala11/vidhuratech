import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { StudentWorkflowService } from '../../student-pages/service/student-workflow';
import { ToastrService } from 'ngx-toastr';

type SessionFilter = 'ALL' | 'UPCOMING' | 'PAST';

@Component({
  selector: 'app-my-live-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-live-sessions.html',
  styleUrls: ['./my-live-sessions.css']
})
export class MyLiveSessionsComponent implements OnInit {
  loading = true;
  submitting = false;
  searchText = '';
  selectedFilter: SessionFilter = 'ALL';
  currentUser: any = null;
  sessions: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // View URL modal bindings
  showUrlModal = false;
  selectedSessionForUrl: any = null;
  copiedText = '';

  // Edit modal bindings
  showEditModal = false;
  editingSession: any = null;
  editForm = {
    topic: '',
    notes: '',
    preferredDate: '',
    preferredTime: '',
    maxDurationMinutes: 45,
    recurringType: 'ONCE',
    invitedEmails: '',
    candidateName: '',
    candidateEmail: ''
  };

  // Create modal bindings
  showCreateModal = false;
  createForm = {
    topic: '',
    notes: '',
    preferredDate: '',
    preferredTime: '',
    maxDurationMinutes: 45,
    recurringType: 'ONCE',
    invitedEmails: '',
    candidateName: '',
    candidateEmail: '',
    timezone: 'Asia/Kolkata'
  };

  constructor(
    private authService: AuthService,
    private workflowService: StudentWorkflowService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.currentUser = this.authService.getUser();
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.workflowService.getMyLiveSessions().subscribe({
      next: (res: any) => {
        this.sessions = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load live sessions:', err);
        this.toastr.error('Unable to retrieve your live sessions history', 'Error');
        this.loading = false;
      }
    });
  }

  get filteredSessions(): any[] {
    const term = this.searchText.trim().toLowerCase();
    const now = new Date();
    // Zero out hours/minutes for date-only comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.sessions.filter(session => {
      // Determine past vs upcoming
      let isPast = session.isEnded || session.status === 'COMPLETED';
      if (session.preferredDate) {
        const prefDate = new Date(session.preferredDate);
        if (!isNaN(prefDate.getTime()) && prefDate < today) {
          isPast = true;
        }
      }

      const matchesFilter =
        this.selectedFilter === 'ALL' ||
        (this.selectedFilter === 'UPCOMING' && !isPast) ||
        (this.selectedFilter === 'PAST' && isPast);

      const searchable = [
        session.topic,
        session.notes,
        session.hostName,
        session.hostEmail,
        session.candidateName,
        session.candidateEmail,
        session.status,
        session.meetingLink
      ].join(' ').toLowerCase();

      return matchesFilter && (!term || searchable.includes(term));
    });
  }

  isHost(session: any): boolean {
    if (!this.currentUser || !this.currentUser.email) return false;
    const userEmail = this.currentUser.email.toLowerCase();
    const hostEmail = (session.hostEmail || '').toLowerCase();
    const trainerEmail = (session.trainerEmail || '').toLowerCase();
    return userEmail === hostEmail || userEmail === trainerEmail;
  }

  joinSession(session: any): void {
    const dbId = session.id;
    if (!dbId) return;

    if (this.isHost(session)) {
      localStorage.setItem('is_host_of_session_' + dbId, 'true');
    }

    const roomName = `VT_session_${dbId}`;
    this.router.navigate(['/meeting', roomName]);
  }

  openEditModal(session: any): void {
    this.editingSession = session;
    this.editForm = {
      topic: session.topic || '',
      notes: session.notes || '',
      preferredDate: session.preferredDate || '',
      preferredTime: session.preferredTime ? session.preferredTime.substring(0, 5) : '',
      maxDurationMinutes: session.maxDurationMinutes || 45,
      recurringType: session.recurringType || 'ONCE',
      invitedEmails: session.invitedEmails || '',
      candidateName: session.candidateName || '',
      candidateEmail: session.candidateEmail || ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSession = null;
  }

  saveSessionChanges(): void {
    if (!this.editForm.topic.trim()) {
      this.toastr.error('Session title/topic is required', 'Validation Error');
      return;
    }
    if (!this.editForm.preferredDate) {
      this.toastr.error('Preferred date is required', 'Validation Error');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(this.editForm.preferredDate);
    if (!isNaN(chosenDate.getTime()) && chosenDate < today) {
      this.toastr.error('Preferred date cannot be in the past', 'Validation Error');
      return;
    }

    if (!this.editForm.preferredTime) {
      this.toastr.error('Preferred time is required', 'Validation Error');
      return;
    }

    if (!this.editForm.maxDurationMinutes || this.editForm.maxDurationMinutes <= 0) {
      this.toastr.error('Duration must be a positive number of minutes', 'Validation Error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.editForm.candidateEmail.trim() && !emailRegex.test(this.editForm.candidateEmail.trim())) {
      this.toastr.error('Invalid candidate email format', 'Validation Error');
      return;
    }

    if (this.editForm.invitedEmails.trim()) {
      const guestEmails = this.editForm.invitedEmails.split(',');
      for (const email of guestEmails) {
        const trimmed = email.trim();
        if (trimmed && !emailRegex.test(trimmed)) {
          this.toastr.error(`Invalid guest email format: ${trimmed}`, 'Validation Error');
          return;
        }
      }
    }

    this.submitting = true;
    const payload = {
      ...this.editForm,
      topic: this.editForm.topic.trim(),
      notes: this.editForm.notes.trim(),
      invitedEmails: this.editForm.invitedEmails.trim(),
      candidateName: this.editForm.candidateName.trim(),
      candidateEmail: this.editForm.candidateEmail.trim()
    };

    this.workflowService.editPublicSession(this.editingSession.id, payload).subscribe({
      next: () => {
        this.toastr.success('Session updated successfully', 'Success');
        this.closeEditModal();
        this.loadSessions();
        this.submitting = false;
      },
      error: (err: any) => {
        console.error('Failed to edit session:', err);
        this.toastr.error(err?.error?.message || 'Failed to save changes. Make sure you are the host.', 'Error');
        this.submitting = false;
      }
    });
  }

  deleteSession(session: any): void {
    if (!confirm(`Are you sure you want to cancel/delete the session: "${session.topic}"?`)) {
      return;
    }

    this.workflowService.deletePublicSession(session.id).subscribe({
      next: () => {
        this.toastr.success('Session deleted successfully', 'Success');
        this.loadSessions();
      },
      error: (err: any) => {
        console.error('Failed to delete session:', err);
        this.toastr.error(err?.error?.message || 'Failed to delete session. Make sure you are the host.', 'Error');
      }
    });
  }

  getUpcomingCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.sessions.filter(session => {
      let isPast = session.isEnded || session.status === 'COMPLETED';
      if (session.preferredDate) {
        const prefDate = new Date(session.preferredDate);
        if (!isNaN(prefDate.getTime()) && prefDate < today) {
          isPast = true;
        }
      }
      return !isPast;
    }).length;
  }

  getPastCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.sessions.filter(session => {
      let isPast = session.isEnded || session.status === 'COMPLETED';
      if (session.preferredDate) {
        const prefDate = new Date(session.preferredDate);
        if (!isNaN(prefDate.getTime()) && prefDate < today) {
          isPast = true;
        }
      }
      return isPast;
    }).length;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Not Scheduled';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    // Format "14:30:00" to "2:30 PM"
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minute} ${ampm}`;
  }

  navigateToCreate(): void {
    this.openCreateModal();
  }

  openCreateModal(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.createForm = {
      topic: '',
      notes: '',
      preferredDate: todayStr,
      preferredTime: '12:00',
      maxDurationMinutes: 45,
      recurringType: 'ONCE',
      invitedEmails: '',
      candidateName: '',
      candidateEmail: '',
      timezone: 'Asia/Kolkata'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  saveNewSession(): void {
    if (!this.createForm.topic.trim()) {
      this.toastr.error('Session title/topic is required', 'Validation Error');
      return;
    }
    if (!this.createForm.preferredDate) {
      this.toastr.error('Preferred date is required', 'Validation Error');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(this.createForm.preferredDate);
    if (!isNaN(chosenDate.getTime()) && chosenDate < today) {
      this.toastr.error('Preferred date cannot be in the past', 'Validation Error');
      return;
    }

    if (!this.createForm.preferredTime) {
      this.toastr.error('Preferred time is required', 'Validation Error');
      return;
    }

    if (!this.createForm.maxDurationMinutes || this.createForm.maxDurationMinutes <= 0) {
      this.toastr.error('Duration must be a positive number of minutes', 'Validation Error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.createForm.candidateEmail.trim() && !emailRegex.test(this.createForm.candidateEmail.trim())) {
      this.toastr.error('Invalid candidate email format', 'Validation Error');
      return;
    }

    if (this.createForm.invitedEmails.trim()) {
      const guestEmails = this.createForm.invitedEmails.split(',');
      for (const email of guestEmails) {
        const trimmed = email.trim();
        if (trimmed && !emailRegex.test(trimmed)) {
          this.toastr.error(`Invalid guest email format: ${trimmed}`, 'Validation Error');
          return;
        }
      }
    }

    this.submitting = true;
    const hostRole = this.currentUser?.role || 'STUDENT';
    const hostEmail = this.currentUser?.email || '';
    const hostName = (this.currentUser?.firstName ? (this.currentUser.firstName + ' ' + (this.currentUser.lastName || '')) : this.currentUser?.name) || 'Guest Host';

    const payload = {
      topic: this.createForm.topic.trim(),
      notes: this.createForm.notes.trim(),
      hostEmail: hostEmail.trim(),
      hostName: hostName.trim(),
      hostRole: hostRole,
      candidateName: this.createForm.candidateName.trim(),
      candidateEmail: this.createForm.candidateEmail.trim(),
      maxDurationMinutes: this.createForm.maxDurationMinutes,
      preferredDate: this.createForm.preferredDate,
      preferredTime: this.createForm.preferredTime,
      recurringType: this.createForm.recurringType,
      invitedEmails: this.createForm.invitedEmails.trim(),
      timezone: this.createForm.timezone
    };

    this.workflowService.createPublicSession(payload).subscribe({
      next: (res: any) => {
        const dbId = res?.data?.id;
        if (dbId) {
          localStorage.setItem('is_host_of_session_' + dbId, 'true');
          const roomName = `VT_session_${dbId}`;
          const meetingLink = `${window.location.origin}/meeting/${roomName}`;

          this.workflowService.updatePublicSession(dbId, { meetingLink: meetingLink }).subscribe({
            next: () => {
              this.toastr.success('Session scheduled successfully!', 'Success');
              this.closeCreateModal();
              this.loadSessions();
              this.submitting = false;
            },
            error: (err: any) => {
              console.error('Failed to update meetingLink:', err);
              this.toastr.success('Session scheduled, but failed to save join link', 'Warning');
              this.closeCreateModal();
              this.loadSessions();
              this.submitting = false;
            }
          });
        } else {
          this.toastr.error('Failed to retrieve meeting ID', 'Error');
          this.submitting = false;
        }
      },
      error: (err: any) => {
        console.error('Failed to create session:', err);
        this.toastr.error(err?.error?.message || 'Failed to create session', 'Error');
        this.submitting = false;
      }
    });
  }

  expandedSessionId: number | null = null;

  toggleSessionExpand(id: number): void {
    if (this.expandedSessionId === id) {
      this.expandedSessionId = null;
    } else {
      this.expandedSessionId = id;
    }
  }

  get paginatedSessions(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredSessions.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSessions.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPagesArray(): number[] {
    const total = this.totalPages;
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewMeetingUrl(session: any): void {
    this.selectedSessionForUrl = session;
    this.showUrlModal = true;
    this.copiedText = '';
  }

  closeUrlModal(): void {
    this.showUrlModal = false;
    this.selectedSessionForUrl = null;
  }

  getMeetingLink(session: any): string {
    if (!session) return '';
    return session.meetingLink || `${window.location.origin}/meeting/VT_session_${session.id}`;
  }

  getMeetingId(session: any): string {
    if (!session) return '';
    return `VT_session_${session.id}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success('Copied to clipboard!', 'Success');
      this.copiedText = 'Copied!';
      setTimeout(() => this.copiedText = '', 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      this.toastr.error('Failed to copy automatically. Please copy manually.', 'Error');
    });
  }
}
