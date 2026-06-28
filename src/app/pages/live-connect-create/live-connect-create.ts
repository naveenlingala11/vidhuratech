import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { StudentWorkflowService } from '../../dashboard/student-pages/service/student-workflow';
import { ToastrService } from 'ngx-toastr';
import { UserPlanBadgeService, UserPlanTier } from '../../services/user-plan-badge.service';

@Component({
  selector: 'app-live-connect-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-connect-create.html',
  styleUrl: './live-connect-create.css'
})
export class LiveConnectCreateComponent implements OnInit, OnDestroy {
  // Plan Settings
  userPlan: UserPlanTier = 'FREE';
  private planSub: any = null;

  // Form Bindings
  sessionTitle = '';
  sessionNotes = '';
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

  // WebRTC Hardware Preflight Checker Properties
  mediaStream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  audioVolume = 0;
  isTestingMedia = false;
  mediaError = '';
  private animationFrameId: number | null = null;

  // Presets
  activePreset: 'CODING' | 'DESIGN' | 'SYNC' | null = null;

  // Commas-Separated Email Attendee Chip List Properties
  attendeeEmails: string[] = [];
  emailInputText = '';
  emailError = '';

  // Dynamic Email Invitation Preview
  showInvitePreview = true;

  get hasVideoTrack(): boolean {
    return this.mediaStream ? this.mediaStream.getVideoTracks().length > 0 : false;
  }

  // Network Latency Tracker Properties
  networkLatency = 28;
  networkJitter = 2;
  packetLoss = 0.0;
  connectionQuality: 'Excellent' | 'Good' | 'Poor' = 'Excellent';
  isTestingNetwork = false;
  networkProgress = 0;
  private latencyIntervalId: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private studentService: StudentWorkflowService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private planService: UserPlanBadgeService
  ) { }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load user plan and subscribe to badge updates
    this.planService.load();
    this.planSub = this.planService.badge$.subscribe(badge => {
      this.userPlan = badge ? badge.tier : 'FREE';
      this.cdr.detectChanges();
    });

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

    // Default: Apply Coding Interview Preset if logged in, otherwise Guest Sync
    if (this.isLoggedIn) {
      this.applyPreset('CODING');
    } else {
      this.applyPreset('SYNC');
    }

    this.initializeLatencyCheck();
  }

  ngOnDestroy(): void {
    if (this.planSub) {
      this.planSub.unsubscribe();
    }
    this.stopMediaStreams();
    this.stopLatencyFluctuation();
  }

  setRole(role: 'STUDENT' | 'MENTOR' | 'TRAINER' | 'GUEST'): void {
    this.hostRole = role;
    this.activePreset = null; // Clear active preset if user manual overrides
  }

  setDuration(duration: number): void {
    this.sessionDuration = duration;
    this.activePreset = null; // Clear active preset if user manual overrides
  }

  get hasPremiumAccess(): boolean {
    if (!this.isLoggedIn) return false;
    
    // Check user plan tier
    if (this.userPlan === 'PRO' || this.userPlan === 'ELITE') {
      return true;
    }
    
    // Admin, Trainer, Mentor, HR, Manager roles bypass pricing tiers
    const role = String(this.currentUser?.role || '').trim().toUpperCase();
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'HR', 'MANAGER', 'TRAINER', 'MENTOR'];
    if (adminRoles.includes(role)) {
      return true;
    }
    
    return false;
  }

  selectPremiumDuration(): void {
    if (!this.hasPremiumAccess) {
      this.toastr.warning('Premium Unlimited is exclusive to PRO and ELITE plans. Please upgrade to unlock unlimited sessions!', 'Upgrade Plan');
      this.router.navigate(['/pricing-plans']);
      return;
    }
    this.setDuration(0);
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

  // Presets Handler
  applyPreset(type: 'CODING' | 'DESIGN' | 'SYNC'): void {
    this.activePreset = type;
    if (type === 'CODING') {
      this.sessionTitle = 'Technical Coding Interview';
      if (!this.isLoggedIn) {
        this.hostRole = 'STUDENT';
      } else {
        this.hostRole = String(this.currentUser?.role || 'STUDENT').toUpperCase() as any;
      }
      this.sessionDuration = this.isLoggedIn ? 45 : 10;
      this.scratchpadLanguage = 'python';
      this.initialCam = true;
      this.initialMic = true;
    } else if (type === 'DESIGN') {
      this.sessionTitle = 'System Design Review';
      this.hostRole = 'MENTOR';
      this.sessionDuration = this.isLoggedIn ? 45 : 10;
      this.scratchpadLanguage = 'javascript';
      this.initialCam = true;
      this.initialMic = true;
    } else if (type === 'SYNC') {
      this.sessionTitle = 'Quick Sync-up session';
      this.hostRole = 'GUEST';
      this.sessionDuration = 10;
      this.scratchpadLanguage = 'typescript';
      this.initialCam = false;
      this.initialMic = true;
    }
  }

  // WebRTC Hardware Preflight Checker Methods
  async startMediaTest(): Promise<void> {
    this.mediaError = '';
    this.isTestingMedia = true;
    this.stopMediaStreams();
    this.cdr.detectChanges();

    try {
      let stream: MediaStream;
      try {
        // Always try to test both video and audio for preflight
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true
        });
      } catch (err) {
        console.warn('Failed to get both video and audio, trying audio only', err);
        // Fallback to audio only if camera is blocked/unavailable
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
      }

      this.mediaStream = stream;
      this.cdr.detectChanges();

      // Hook up video preview element
      setTimeout(() => {
        const videoEl = document.getElementById('preflightVideo') as HTMLVideoElement;
        if (videoEl && stream.getVideoTracks().length > 0) {
          videoEl.srcObject = stream;
        }
        this.cdr.detectChanges();
      }, 100);

      // Audio analysis for volume meter
      if (stream.getAudioTracks().length > 0) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioContext = new AudioCtxClass();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);
          this.runAudioVolumeLoop();
        }
      }
    } catch (e: any) {
      console.error('Media Access Denied:', e);
      this.mediaError = 'Permission denied or devices occupied. Please check browser settings.';
      this.isTestingMedia = false;
      this.stopMediaStreams();
      this.cdr.detectChanges();
    }
  }

  private runAudioVolumeLoop(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const checkVolume = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Map volume to 0-100 scale
      this.audioVolume = Math.min(100, Math.round((average / 128) * 100));

      this.animationFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  stopMediaStreams(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.audioVolume = 0;
    this.isTestingMedia = false;
    this.cdr.detectChanges();
  }

  // Email Chips Handler
  addAttendee(event: any): void {
    const input = event.target;
    const value = (input.value || '').trim().replace(/,$/, ''); // Strip trailing comma if typed

    // Check if empty
    if (!value) return;

    // Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      if (!this.attendeeEmails.includes(value)) {
        this.attendeeEmails.push(value);
      }
      this.emailInputText = '';
      this.emailError = '';
    } else {
      this.emailError = 'Please enter a valid email address';
    }
  }

  removeAttendee(index: number): void {
    this.attendeeEmails.splice(index, 1);
  }

  createSession(): void {
    // Basic validations
    if (!this.sessionTitle.trim()) {
      this.toastr.error('Please enter a session title', 'Validation Error');
      return;
    }
    if (!this.hostName.trim()) {
      this.toastr.error('Please enter host display name', 'Validation Error');
      return;
    }
    if (!this.privacyChecked) {
      this.toastr.error('Please accept the P2P WebRTC terms', 'Validation Error');
      return;
    }

    // Verify Premium access for unlimited sessions
    if (this.sessionDuration === 0 && !this.hasPremiumAccess) {
      this.toastr.error('A PRO or ELITE plan is required for unlimited duration sessions.', 'Upgrade Required');
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

    this.stopMediaStreams(); // Ensure preflight streams are released before entering room

    // Combine chips list
    this.invitedEmails = this.attendeeEmails.join(',');

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
      timezone: this.timezone,
      notes: this.sessionNotes.trim()
    };

    this.studentService.createPublicSession(payload).subscribe({
      next: (res: any) => {
        const dbId = res?.data?.id;
        if (dbId) {
          // Set host flag in localStorage so the current browser is marked as the meeting host
          localStorage.setItem('is_host_of_session_' + dbId, 'true');

          const roomName = `VT_session_${dbId}`;
          const meetingLink = `${window.location.origin}/meeting/${roomName}`;

          // Update meetingLink in the database
          this.studentService.updatePublicSession(dbId, { meetingLink: meetingLink }).subscribe({
            next: () => {
              console.log('Session meetingLink successfully saved to database:', meetingLink);
            },
            error: (err) => {
              console.error('Failed to update meetingLink:', err);
            }
          });

          if (this.invitedEmails.trim()) {
            this.toastr.success('Your session has been successfully created and email invitations sent!', 'Meeting Launched');
          } else {
            this.toastr.success('Your session has been successfully created!', 'Meeting Launched');
          }

          // Navigate to call room
          this.router.navigate(['/meeting', roomName]);
        } else {
          console.error('Failed to resolve database ID from session creation response.');
          // Fallback
          const randomId = Math.floor(100000 + Math.random() * 900000);
          const roomName = `VT_session_${randomId}`;
          this.router.navigate(['/meeting', roomName]);
        }
      },
      error: (err) => {
        console.error('Failed to create database session entry:', err);
        // Fallback to random ID in case server is down
        const randomId = Math.floor(100000 + Math.random() * 900000);
        const roomName = `VT_session_${randomId}`;
        this.router.navigate(['/meeting', roomName]);
      }
    });
  }

  goBack(): void {
    this.stopMediaStreams();
    this.stopLatencyFluctuation();
    this.router.navigate(['/live-connect']);
  }

  async pingNetwork(): Promise<number> {
    const startTime = performance.now();
    try {
      // Fetch local same-origin root using HEAD to measure RTT latency without CORS issues
      await fetch('/', { method: 'HEAD', cache: 'no-store' });
      return Math.round(performance.now() - startTime);
    } catch (e) {
      return -1; // Offline or network failure
    }
  }

  async initializeLatencyCheck(): Promise<void> {
    const lat = await this.pingNetwork();
    if (lat !== -1) {
      this.networkLatency = lat;
      this.networkJitter = 1;
      this.packetLoss = 0.0;
      this.updateConnectionQuality();
      this.cdr.detectChanges();
    } else {
      this.networkLatency = 999;
      this.packetLoss = 100.0;
      this.updateConnectionQuality();
      this.cdr.detectChanges();
    }
    this.startLatencyFluctuation();
  }

  startLatencyFluctuation(): void {
    this.stopLatencyFluctuation();
    this.latencyIntervalId = setInterval(async () => {
      if (this.isTestingNetwork) return;

      const lat = await this.pingNetwork();
      if (lat === -1) {
        this.packetLoss = 100.0;
        this.networkLatency = 999;
      } else {
        this.packetLoss = 0.0;
        const prevLatency = this.networkLatency;
        this.networkLatency = lat;
        this.networkJitter = Math.abs(lat - prevLatency);
      }

      this.updateConnectionQuality();
      this.cdr.detectChanges();
    }, 6000); // Probe every 6 seconds for genuine background monitoring
  }

  stopLatencyFluctuation(): void {
    if (this.latencyIntervalId) {
      clearInterval(this.latencyIntervalId);
      this.latencyIntervalId = null;
    }
  }

  private updateConnectionQuality(): void {
    if (this.networkLatency < 45 && this.packetLoss === 0) {
      this.connectionQuality = 'Excellent';
    } else if (this.networkLatency < 90 && this.packetLoss < 2.0) {
      this.connectionQuality = 'Good';
    } else {
      this.connectionQuality = 'Poor';
    }
  }

  async runNetworkDiagnostics(): Promise<void> {
    if (this.isTestingNetwork) return;

    this.isTestingNetwork = true;
    this.networkProgress = 0;
    this.cdr.detectChanges();

    const pingsCount = 8;
    const latencies: number[] = [];
    let failedPings = 0;

    for (let i = 0; i < pingsCount; i++) {
      this.networkProgress = Math.round(((i + 1) / pingsCount) * 100);
      this.cdr.detectChanges();

      const lat = await this.pingNetwork();
      if (lat === -1) {
        failedPings++;
      } else {
        latencies.push(lat);
        this.networkLatency = lat;
        this.networkJitter = this.calculateJitter(latencies);
      }
      this.cdr.detectChanges();

      // Short delay between pings
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    this.isTestingNetwork = false;
    this.networkProgress = 100;

    if (latencies.length > 0) {
      const sum = latencies.reduce((a, b) => a + b, 0);
      this.networkLatency = Math.round(sum / latencies.length);
      this.networkJitter = this.calculateJitter(latencies);
      this.packetLoss = parseFloat(((failedPings / pingsCount) * 100).toFixed(1));
    } else {
      this.networkLatency = 999;
      this.networkJitter = 0;
      this.packetLoss = 100.0;
    }

    this.updateConnectionQuality();
    this.cdr.detectChanges();
    this.startLatencyFluctuation(); // Resume regular background probing
  }

  private calculateJitter(latencies: number[]): number {
    if (latencies.length < 2) return 0;
    let sumDiff = 0;
    for (let i = 1; i < latencies.length; i++) {
      sumDiff += Math.abs(latencies[i] - latencies[i - 1]);
    }
    return Math.round(sumDiff / (latencies.length - 1));
  }
}
