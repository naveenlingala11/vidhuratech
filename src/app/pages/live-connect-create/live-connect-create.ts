import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { StudentWorkflowService } from '../../dashboard/student-pages/service/student-workflow';

@Component({
  selector: 'app-live-connect-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-connect-create.html',
  styleUrl: './live-connect-create.css'
})
export class LiveConnectCreateComponent implements OnInit {
  // Form Bindings
  sessionTitle = '';
  hostName = '';
  hostEmail = '';
  hostRole: 'STUDENT' | 'MENTOR' | 'TRAINER' | 'GUEST' = 'STUDENT';
  
  // Target Candidate Details (Optional)
  candidateName = '';
  candidateEmail = '';

  // Meeting Parameters
  sessionDuration = 10; // Default 10 mins (Guest limit)
  initialCam = true;
  initialMic = true;
  scratchpadLanguage = 'typescript';
  privacyChecked = false;

  // Advanced Schedule & Recurrence
  preferredDate = '';
  preferredTime = '';
  recurringType = 'ONCE';
  recurringDays = '';
  invitedEmails = '';
  timezone = 'Asia/Kolkata';

  recurrenceDaysList = [
    { name: 'M', selected: false, value: 'MON' },
    { name: 'T', selected: false, value: 'TUE' },
    { name: 'W', selected: false, value: 'WED' },
    { name: 'T', selected: false, value: 'THU' },
    { name: 'F', selected: false, value: 'FRI' },
    { name: 'S', selected: false, value: 'SAT' },
    { name: 'S', selected: false, value: 'SUN' }
  ];

  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private studentService: StudentWorkflowService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set default date & time
    const now = new Date();
    this.preferredDate = now.toISOString().split('T')[0];
    this.preferredTime = now.toTimeString().split(' ')[0].substring(0, 5);
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    // Check if user is logged in to pre-fill
    const user = this.authService.getUser();
    const hasUser = user && (user.name || user.email || user.role);

    if (hasUser) {
      this.isLoggedIn = true;
      this.currentUser = user;
      this.hostName = user.name || '';
      this.hostEmail = user.email || '';
      this.hostRole = String(user.role || 'STUDENT').toUpperCase() as any;
      this.sessionDuration = 45; // Logged-in free users get 45 mins
    } else {
      this.isLoggedIn = false;
      this.hostRole = 'GUEST';
      this.sessionDuration = 10; // Guests get 10 mins
    }
  }

  setRole(role: 'STUDENT' | 'MENTOR' | 'TRAINER' | 'GUEST'): void {
    this.hostRole = role;
  }

  setDuration(duration: number): void {
    this.sessionDuration = duration;
  }

  toggleRecurrenceDay(day: any): void {
    day.selected = !day.selected;
    this.updateRecurringDaysString();
  }

  updateRecurringDaysString(): void {
    this.recurringDays = this.recurrenceDaysList
      .filter(d => d.selected)
      .map(d => d.value)
      .join(',');
  }

  createSession(): void {
    // Basic validations
    if (!this.sessionTitle.trim()) {
      return;
    }
    if (!this.hostName.trim()) {
      return;
    }
    if (!this.privacyChecked) {
      return;
    }

    // Save temporary details in localStorage so video-meeting component can load them directly
    if (!this.isLoggedIn) {
      localStorage.setItem('vidhuratech_guest_name', this.hostName.trim());
      localStorage.setItem('vidhuratech_guest_role', this.hostRole);
      localStorage.setItem('vidhuratech_guest_email', this.hostEmail.trim());
    } else {
      // Clear legacy guest session properties if logged in
      localStorage.removeItem('vidhuratech_guest_name');
      localStorage.removeItem('vidhuratech_guest_role');
      localStorage.removeItem('vidhuratech_guest_email');
    }

    // Save initial workspace preferences (mic, cam, scratchpad language)
    localStorage.setItem('vidhuratech_session_mic', String(this.initialMic));
    localStorage.setItem('vidhuratech_session_cam', String(this.initialCam));
    localStorage.setItem('vidhuratech_session_language', this.scratchpadLanguage);

    // Call public create API
    const payload = {
      topic: this.sessionTitle.trim(),
      hostEmail: this.hostEmail.trim(),
      hostName: this.hostName.trim(),
      hostRole: this.hostRole,
      candidateName: this.candidateName.trim(),
      candidateEmail: this.candidateEmail.trim(),
      maxDurationMinutes: this.sessionDuration,
      preferredDate: this.preferredDate,
      preferredTime: this.preferredTime,
      recurringType: this.recurringType,
      recurringDays: this.recurringDays,
      invitedEmails: this.invitedEmails.trim(),
      timezone: this.timezone
    };

    this.studentService.createPublicSession(payload).subscribe({
      next: (res: any) => {
        const dbId = res?.data?.id;
        if (dbId) {
          // Set host flag in localStorage so the current browser is marked as the meeting host
          localStorage.setItem('is_host_of_session_' + dbId, 'true');

          const roomName = `VidhuraTech_Mock_Session_${dbId}`;
          // Navigate to call room
          this.router.navigate(['/meeting', roomName]);
        } else {
          console.error('Failed to resolve database ID from session creation response.');
          // Fallback
          const randomId = Math.floor(100000 + Math.random() * 900000);
          const roomName = `VidhuraTech_Mock_Session_${randomId}`;
          this.router.navigate(['/meeting', roomName]);
        }
      },
      error: (err) => {
        console.error('Failed to create database session entry:', err);
        // Fallback to random ID in case server is down
        const randomId = Math.floor(100000 + Math.random() * 900000);
        const roomName = `VidhuraTech_Mock_Session_${randomId}`;
        this.router.navigate(['/meeting', roomName]);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/live-connect']);
  }
}
