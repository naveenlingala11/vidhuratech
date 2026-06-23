import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

export interface MockSession {
  id: number;
  student: string;
  email: string;
  batch: string;
  batchId: number;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: string;
  meetingLink: string;
  trainerRemarks: string;
  sessionSummary: string;
  sessionChat: string;
  createdAt: string;
  updatedAt?: string;
  expirationDate?: string;
  maxDurationMinutes?: number;
  actualDurationMinutes?: number;
  isEnded?: boolean;
  participantCount?: number;
  meetingLogs?: string;
  trainerEmail?: string;
  trainerName?: string;
  hostRole?: string;
  isPublic?: boolean;
}

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sessions.component.html',
  styleUrls: ['./admin-sessions.component.css']
})
export class AdminSessionsComponent implements OnInit {
  sessions: MockSession[] = [];
  loading = false;
  saving = false;

  // Search & Filter State
  searchQuery = '';
  statusFilter = 'All';
  statuses = ['All', 'LIVE', 'REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

  // Tab Switcher State
  activeTab: 'professional' | 'public' = 'professional';

  // Modals state
  selectedSession: MockSession | null = null;
  showDetailsModal = false;
  deleteSessionTarget: MockSession | null = null;
  showCreateModal = false;

  // New Public Session Form State
  newSession = {
    topic: '',
    hostName: 'Guest Host',
    hostEmail: '',
    candidateName: 'Guest Candidate',
    candidateEmail: '',
    maxDurationMinutes: 60,
    expirationDate: ''
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.http.get<any>(`${environment.apiUrl}/api/trainer/mock-interviews`).subscribe({
      next: (res: any) => {
        this.sessions = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load session audits.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredSessions(): MockSession[] {
    return this.sessions.filter(s => {
      const studentName = s.student ? s.student.toLowerCase() : '';
      const studentEmail = s.email ? s.email.toLowerCase() : '';
      const topicName = s.topic ? s.topic.toLowerCase() : '';

      const matchesSearch =
        studentName.includes(this.searchQuery.toLowerCase()) ||
        studentEmail.includes(this.searchQuery.toLowerCase()) ||
        topicName.includes(this.searchQuery.toLowerCase()) ||
        String(s.id).includes(this.searchQuery);

      let matchesStatus = false;
      if (this.statusFilter === 'All') {
        matchesStatus = true;
      } else if (this.statusFilter === 'LIVE') {
        matchesStatus = !s.isEnded && s.status === 'SCHEDULED';
      } else {
        matchesStatus = s.status === this.statusFilter;
      }

      // Tab categorization:
      // Mock Interviews = has a real batch assignment OR is a Mentor Roster session
      // Quick Sessions = everything else (no batch, public links, guest sessions)
      const isMentorRoster = s.batch === 'Mentor Roster';
      const hasRealBatch = s.batchId && s.batch && s.batch !== 'Batch';
      const isQuickSession = !hasRealBatch && !isMentorRoster;
      const matchesTab = this.activeTab === 'professional' ? !isQuickSession : isQuickSession;

      return matchesSearch && matchesStatus && matchesTab;
    });
  }

  viewDetails(session: MockSession): void {
    this.selectedSession = { ...session };
    this.showDetailsModal = true;
    this.cdr.detectChanges();
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSession = null;
    this.cdr.detectChanges();
  }

  saveSummary(): void {
    if (!this.selectedSession) return;
    this.saving = true;
    this.cdr.detectChanges();

    const payload = {
      student: this.selectedSession.student,
      email: this.selectedSession.email,
      trainerName: this.selectedSession.trainerName,
      trainerEmail: this.selectedSession.trainerEmail,
      topic: this.selectedSession.topic,
      batch: this.selectedSession.batch,
      status: this.selectedSession.status,
      expirationDate: this.selectedSession.expirationDate,
      maxDurationMinutes: this.selectedSession.maxDurationMinutes,
      actualDurationMinutes: this.selectedSession.actualDurationMinutes,
      participantCount: this.selectedSession.participantCount,
      isEnded: this.selectedSession.isEnded,
      sessionSummary: this.selectedSession.sessionSummary,
      meetingLink: this.selectedSession.meetingLink,
      trainerRemarks: this.selectedSession.trainerRemarks
    };

    this.http.patch(`${environment.apiUrl}/api/trainer/mock-interviews/${this.selectedSession.id}`, payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.toastr.success('Session parameters updated successfully!');

        // Update local state list
        const index = this.sessions.findIndex(s => s.id === this.selectedSession?.id);
        if (index !== -1 && res.data) {
          this.sessions[index] = res.data;
        }

        this.closeDetailsModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error('Failed to save session parameters.');
        this.cdr.detectChanges();
      }
    });
  }

  formatDateTimeForInput(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  confirmDelete(session: MockSession): void {
    this.deleteSessionTarget = session;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.deleteSessionTarget = null;
    this.cdr.detectChanges();
  }

  executeDelete(): void {
    if (!this.deleteSessionTarget) return;
    this.saving = true;
    this.cdr.detectChanges();

    this.http.delete(`${environment.apiUrl}/api/trainer/mock-interviews/${this.deleteSessionTarget.id}`).subscribe({
      next: () => {
        this.toastr.success('Session audit logs purged successfully.');
        this.sessions = this.sessions.filter(s => s.id !== this.deleteSessionTarget?.id);
        this.deleteSessionTarget = null;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error('Access Denied: Only administrators can purge sessions.');
        this.cdr.detectChanges();
      }
    });
  }

  exportChatTranscript(session: MockSession): void {
    if (!session.sessionChat || session.sessionChat.trim().length === 0) {
      this.toastr.warning('No chat history to export.');
      return;
    }

    const title = `VidhuraTech_Chat_Transcript_Room_${session.id}.txt`;
    const header = `========================================================\n` +
      `VIDHURATECH MOCK ASSESSMENT CHAT TRANSCRIPT\n` +
      `Session ID: ${session.id}\n` +
      `Student: ${session.student} (${session.email})\n` +
      `Topic: ${session.topic}\n` +
      `Date: ${session.preferredDate} ${session.preferredTime}\n` +
      `========================================================\n\n`;

    const content = header + session.sessionChat;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    a.click();
    URL.revokeObjectURL(url);
  }

  openCreateModal(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const pad = (num: number) => String(num).padStart(2, '0');
    const defaultExp = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}T12:00`;

    this.newSession = {
      topic: '',
      hostName: 'Guest Host',
      hostEmail: '',
      candidateName: 'Guest Candidate',
      candidateEmail: '',
      maxDurationMinutes: 60,
      expirationDate: defaultExp
    };
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.cdr.detectChanges();
  }

  // Chat Preview Modal State
  showChatPreviewModal = false;
  chatPreviewSession: MockSession | null = null;

  openChatPreview(session: MockSession): void {
    this.chatPreviewSession = session;
    this.showChatPreviewModal = true;
    this.cdr.detectChanges();
  }

  closeChatPreview(): void {
    this.showChatPreviewModal = false;
    this.chatPreviewSession = null;
    this.cdr.detectChanges();
  }

  createPublicSession(): void {
    if (!this.newSession.topic.trim()) {
      this.toastr.warning('Session topic is required.');
      return;
    }
    if (!this.newSession.hostName.trim()) {
      this.toastr.warning('Host name is required.');
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    this.http.post(`${environment.apiUrl}/api/public/mock-interviews/create`, this.newSession).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.toastr.success('Public session created successfully!');
        if (res?.data) {
          this.sessions.unshift(res.data);
        }
        this.showCreateModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error('Failed to create public session.');
        this.cdr.detectChanges();
      }
    });
  }
}
