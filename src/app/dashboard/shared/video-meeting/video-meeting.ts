import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { MentorDashboardService } from '../../service/mentor-dashboard';
import { TrainerDashboardService } from '../../service/trainer-dashboard';
import { StudentWorkflowService } from '../../student-pages/service/student-workflow';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-video-meeting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-meeting.html',
  styleUrls: ['./video-meeting.css']
})
export class VideoMeetingComponent implements OnInit, AfterViewInit, OnDestroy {
  roomName = '';
  loading = true;
  jitsiAPI: any = null;
  currentUser: any = null;
  userRole = 'STUDENT';
  activeTab: 'scratchpad' | 'rubric' | 'resume' | 'questions' | 'lobby' = 'scratchpad';

  // Guest (unauthenticated) user state
  guestName = '';
  guestNameEntered = false;
  isGuest = false;

  // Pre-join lobby state (Teams/Google Meet style)
  showPrejoinLobby = true;
  prejoinMicEnabled = false;
  prejoinCamEnabled = false;
  previewStream: MediaStream | null = null;
  isInterviewerMode = false;
  mockSessionId: number | null = null;

  // External control toolbar states (Teams-style)
  isMicMuted = true;
  isCamMuted = true;
  isScreenSharing = false;
  isHandRaised = false;
  isTileView = false;

  // Post-meeting feedback and navigation state
  meetingEnded = false;
  feedbackRating = 0;
  feedbackText = '';
  feedbackSubmitted = false;

  // WebRTC Diagnostics and Progress Logs
  connectionStatusSteps = [
    { label: 'Load video conferencing external SDK resources', status: 'pending' },
    { label: 'Initialize secure WebRTC room tunnel', status: 'pending' },
    { label: 'Request webcam and microphone access authorization', status: 'pending' },
    { label: 'Establish video conference server connection', status: 'pending' }
  ];
  activityLogs: Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = [];

  // Screen/Tab Recorder State
  mediaRecorder: any = null;
  recordedChunks: any[] = [];
  isRecording = false;
  recordingDuration = 0;
  recordingTimer: any = null;

  // Connected Attendees & Lobby State
  participants: any[] = [];
  lobbyQueue: any[] = [];
  admittedParticipants: { [key: string]: boolean } = {};

  // Scratchpad
  scratchpadText = `// Write code or paste questions here during the interview...\n\nfunction helloWorld() {\n  console.log("Welcome to VidhuraTech Mock Interview!");\n}`;

  // Evaluation Form
  isSubmittingFeedback = false;
  evaluation = {
    studentName: '',
    progress: 50,
    milestone: 'Complete Coding Mock Interview',
    note: '',
    codingSkills: 4,
    systemDesign: 3,
    communication: 4,
    problemSolving: 4
  };

  // Mock Questions List
  interviewQuestions = [
    {
      category: 'Algorithms & Coding',
      title: '1. Two Sum Problem (Easy/Medium)',
      desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      hints: '• Use a Hash Map to store target complement.\n• Lookups are O(1), leading to an O(N) total solution.'
    },
    {
      category: 'Algorithms & Coding',
      title: '2. Reverse a Linked List (Medium)',
      desc: 'Reverse a singly linked list in-place and return the new head.',
      hints: '• Use three pointers: prev, curr, and next.\n• Traverse the list and redirect curr.next = prev.'
    },
    {
      category: 'System Design',
      title: '3. Design a Rate Limiter',
      desc: 'Design a system that limits the number of requests a user can make to an API within a given window of time.',
      hints: '• Discuss Token Bucket, Leaking Bucket, or Sliding Window Log algorithms.\n• Use Redis for fast in-memory rate state storage.'
    },
    {
      category: 'System Design',
      title: '4. Design a URL Shortener (TinyURL)',
      desc: 'Design a service that takes a long URL and compresses it to a short, unique alphanumeric key.',
      hints: '• Use Base62 encoding on an auto-incrementing ID.\n• Discuss hashing collisions, redirection redirects (301 vs 302), and caching hot URLs.'
    },
    {
      category: 'Behavioral',
      title: '5. Technical Conflict / Teamwork',
      desc: 'Describe a situation where you disagreed with a colleague on a technical decision. How did you resolve it?',
      hints: '• Look for STAR method: Situation, Task, Action, Result.\n• Focus on data-driven discussions rather than personal bias.'
    }
  ];

  // Student Resume Info (Side-by-side reference)
  studentResume = {
    skills: 'Java, Spring Boot, Angular, TypeScript, SQL, Git',
    projects: '• Interactive Code Playground (Angular, WebSockets)\n• E-Commerce Backend Microservices (Spring Boot, Redis)',
    experience: 'Junior Full Stack Intern at VidhuraTech Labs (6 months)',
    education: 'B.Tech in Computer Science & Engineering (2024)'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private mentorService: MentorDashboardService,
    private trainerService: TrainerDashboardService,
    private studentWorkflowService: StudentWorkflowService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rawUser = this.authService.getUser();
    // authService.getUser() returns {} (empty object) when not logged in, so check for actual user data
    const hasValidUser = rawUser && (rawUser.role || rawUser.name || rawUser.email);

    if (hasValidUser) {
      this.currentUser = rawUser;
      this.userRole = String(rawUser.role || 'STUDENT').toUpperCase();
      this.isGuest = false;
      this.guestNameEntered = true; // Already authenticated
    } else {
      // Check if credentials were pre-filled in localStorage from the creator page
      const savedName = localStorage.getItem('vidhuratech_guest_name');
      const savedRole = localStorage.getItem('vidhuratech_guest_role');
      const savedEmail = localStorage.getItem('vidhuratech_guest_email');

      if (savedName) {
        this.currentUser = { name: savedName, email: savedEmail || '' };
        this.guestName = savedName;
        this.userRole = String(savedRole || 'GUEST').toUpperCase();
        this.isGuest = true;
        this.guestNameEntered = true; // Bypasses name gate!
      } else {
        this.currentUser = null;
        this.userRole = 'GUEST';
        this.isGuest = true;
        this.guestNameEntered = false;
      }
    }

    // Read workspace session configurations (mic, cam, scratchpad language) from quick creator page
    const savedMic = localStorage.getItem('vidhuratech_session_mic');
    const savedCam = localStorage.getItem('vidhuratech_session_cam');
    const savedLang = localStorage.getItem('vidhuratech_session_language');

    if (savedMic !== null) {
      this.prejoinMicEnabled = savedMic === 'true';
    }
    if (savedCam !== null) {
      this.prejoinCamEnabled = savedCam === 'true';
    }
    if (savedLang) {
      this.setScratchpadLanguageTemplate(savedLang);
    }

    // Clean up temporary workspace configurations immediately
    localStorage.removeItem('vidhuratech_session_mic');
    localStorage.removeItem('vidhuratech_session_cam');
    localStorage.removeItem('vidhuratech_session_language');
    
    // Automatically enable interviewer mode for non-student roles
    this.isInterviewerMode = ['MENTOR', 'TRAINER', 'ADMIN', 'SUPER_ADMIN', 'HR', 'MANAGER'].includes(this.userRole);

    this.addLog(`System initialized. User: ${this.currentUser?.name || 'Guest (Not Authenticated)'} (${this.userRole})`, 'info');

    // Default student name if student is logged in
    if (!this.isInterviewerMode && this.currentUser) {
      this.evaluation.studentName = this.currentUser?.name || '';
    }

    this.route.params.subscribe(params => {
      this.roomName = params['roomName'] || 'VidhuraTech_Default_Room';
      this.roomName = this.roomName.replace(/[^a-zA-Z0-9_-]/g, '');

      const match = this.roomName.match(/^VidhuraTech_Mock_Session_(\d+)$/);
      if (match) {
        this.mockSessionId = parseInt(match[1], 10);
      }

      this.addLog(`Resolved secure room channel ID: '${this.roomName}'`, 'info');
      this.loadMockDetails();
    });
  }

  setScratchpadLanguageTemplate(lang: string): void {
    const defaultMsg = "Write code or paste questions here during the interview...";
    switch(lang.toLowerCase()) {
      case 'python':
        this.scratchpadText = `# ${defaultMsg}\n\ndef hello_world():\n    print("Welcome to VidhuraTech Mock Interview!")\n`;
        break;
      case 'cpp':
        this.scratchpadText = `// ${defaultMsg}\n#include <iostream>\n\nint main() {\n    std::cout << "Welcome to VidhuraTech Mock Interview!" << std::endl;\n    return 0;\n}\n`;
        break;
      case 'java':
        this.scratchpadText = `// ${defaultMsg}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to VidhuraTech Mock Interview!");\n    }\n}\n`;
        break;
      case 'javascript':
        this.scratchpadText = `// ${defaultMsg}\n\nfunction helloWorld() {\n  console.log("Welcome to VidhuraTech Mock Interview!");\n}\n`;
        break;
      default: // typescript
        this.scratchpadText = `// ${defaultMsg}\n\nfunction helloWorld() {\n  console.log("Welcome to VidhuraTech Mock Interview!");\n}\n`;
        break;
    }
  }

  addLog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.activityLogs.push({ timestamp: time, message, type });
    console.log(`[DiagnosticLog] [${type.toUpperCase()}] ${message}`);
    this.cdr.detectChanges();
  }

  loadMockDetails(): void {
    if (!this.mockSessionId) return;
    // Skip API calls for unauthenticated guests
    if (this.isGuest) return;

    if (['MENTOR', 'TRAINER', 'ADMIN', 'SUPER_ADMIN', 'HR', 'MANAGER'].includes(this.userRole)) {
      this.trainerService.getMockInterviewRequests().subscribe({
        next: (res: any) => {
          const list = res?.data || [];
          const req = list.find((item: any) => item.id === this.mockSessionId);
          if (req) {
            this.evaluation.studentName = req.student || '';
            if (req.trainerRemarks) {
              this.evaluation.note = req.trainerRemarks;
            }
            this.cdr.detectChanges();
          }
        }
      });
    } else {
      this.studentWorkflowService.getMockInterviews().subscribe({
        next: (res: any) => {
          const list = res?.data || [];
          const req = list.find((item: any) => item.id === this.mockSessionId);
          if (req) {
            this.evaluation.studentName = req.student || this.currentUser?.name || '';
            if (req.trainerRemarks) {
              this.evaluation.note = req.trainerRemarks;
            }
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  initLobbyDevices(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    this.addLog('Requesting camera and microphone permissions for pre-join lobby...', 'info');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.previewStream = stream;
        this.prejoinCamEnabled = true;
        this.prejoinMicEnabled = true;
        this.addLog('Camera and microphone permissions granted in lobby.', 'success');
        this.cdr.detectChanges();
        
        // Bind to video element
        setTimeout(() => {
          const videoEl = document.getElementById('prejoin-camera-preview') as HTMLVideoElement;
          if (videoEl) {
            videoEl.srcObject = stream;
          }
        }, 100);
      })
      .catch(err => {
        this.addLog('Lobby device access denied or unavailable: ' + (err?.message || err), 'warning');
        // Fallback: try video only
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            this.previewStream = stream;
            this.prejoinCamEnabled = true;
            this.prejoinMicEnabled = false;
            this.cdr.detectChanges();
            setTimeout(() => {
              const videoEl = document.getElementById('prejoin-camera-preview') as HTMLVideoElement;
              if (videoEl) {
                videoEl.srcObject = stream;
              }
            }, 100);
          })
          .catch(err2 => {
            this.prejoinCamEnabled = false;
            this.prejoinMicEnabled = false;
            this.cdr.detectChanges();
          });
      });
  }

  ngAfterViewInit(): void {
    // Always show the pre-join lobby first — Jitsi is NOT initialized until user clicks 'Join Meeting'
    // For guests who haven't entered their name yet, show the guest name entry screen (handled in HTML)
    this.loading = false;
    this.showPrejoinLobby = true;
    this.cdr.detectChanges();

    if (!this.isGuest) {
      this.initLobbyDevices();
    }
  }

  private bootstrapJitsi(): void {
    this.loading = true;
    this.connectionStatusSteps[0].status = 'process';
    this.addLog('Loading Jitsi conferencing external SDK resources...', 'info');

    this.loadJitsiScript()
      .then(() => {
        this.connectionStatusSteps[0].status = 'success';
        this.addLog('Jitsi conferencing external SDK resources loaded successfully.', 'success');
        this.connectionStatusSteps[1].status = 'process';
        this.initializeJitsi();
      })
      .catch(err => {
        this.connectionStatusSteps[0].status = 'error';
        this.addLog('Failed to retrieve Jitsi external script: ' + (err?.message || err), 'error');
        this.toastr.error('Failed to load video conferencing resources.');
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  joinAsGuest(): void {
    const name = this.guestName.trim();
    if (!name) {
      this.toastr.warning('Please enter your name to join the session.');
      return;
    }
    this.currentUser = { name: name, email: '' };
    this.guestNameEntered = true;
    this.addLog(`Guest user identified: ${name}`, 'success');
    // Don't bootstrap Jitsi yet — show the pre-join lobby first
    this.showPrejoinLobby = true;
    this.cdr.detectChanges();
    this.initLobbyDevices();
  }

  joinFromLobby(): void {
    // Stop camera preview before Jitsi takes over
    this.stopCameraPreview();
    this.showPrejoinLobby = false;
    this.addLog(`Joining meeting with Mic: ${this.prejoinMicEnabled ? 'ON' : 'OFF'}, Camera: ${this.prejoinCamEnabled ? 'ON' : 'OFF'}`, 'info');
    
    // Sync initial meeting mute states
    this.isMicMuted = !this.prejoinMicEnabled;
    this.isCamMuted = !this.prejoinCamEnabled;

    this.cdr.detectChanges();
    this.bootstrapJitsi();
  }

  togglePrejoinCamera(): void {
    this.prejoinCamEnabled = !this.prejoinCamEnabled;
    if (this.prejoinCamEnabled) {
      this.startCameraPreview();
    } else {
      this.stopCameraPreview();
    }
  }

  togglePrejoinMic(): void {
    this.prejoinMicEnabled = !this.prejoinMicEnabled;
    if (this.previewStream) {
      this.previewStream.getAudioTracks().forEach(track => {
        track.enabled = this.prejoinMicEnabled;
      });
    }
    this.cdr.detectChanges();
  }

  private startCameraPreview(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        this.previewStream = stream;
        this.cdr.detectChanges();
        const videoEl = document.getElementById('prejoin-camera-preview') as HTMLVideoElement;
        if (videoEl) {
          videoEl.srcObject = stream;
        }
      })
      .catch(err => {
        this.addLog('Camera access denied or unavailable: ' + (err?.message || err), 'warning');
        this.prejoinCamEnabled = false;
        this.toastr.warning('Unable to access camera. Please check permissions.');
        this.cdr.detectChanges();
      });
  }

  private stopCameraPreview(): void {
    if (this.previewStream) {
      this.previewStream.getTracks().forEach(track => track.stop());
      this.previewStream = null;
    }
  }

  ngOnDestroy(): void {
    this.stopCameraPreview();
    if (this.jitsiAPI) {
      this.jitsiAPI.dispose();
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }

  get isInterviewer(): boolean {
    return this.isInterviewerMode;
  }

  toggleInterviewerMode(): void {
    this.isInterviewerMode = !this.isInterviewerMode;
    this.toastr.success(`Switched workspace view to: ${this.isInterviewerMode ? 'Interviewer' : 'Candidate'}`);
    this.cdr.detectChanges();
  }

  private loadJitsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://meet.element.io/external_api.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  private initializeJitsi(): void {
    const domain = 'meet.element.io';
    this.addLog('Configuring secure WebRTC options for server meet.element.io...', 'info');

    const options = {
      roomName: this.roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: this.currentUser?.name || 'VidhuraTech Guest',
        email: this.currentUser?.email || ''
      },
      configOverwrite: {
        startWithAudioMuted: !this.prejoinMicEnabled,
        startWithVideoMuted: !this.prejoinCamEnabled,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        welcomePageEnabled: false,
        enableClosePage: false,
        // Screen sharing config
        desktopSharingFrameRate: { min: 5, max: 30 },
        // Video quality
        resolution: 720,
        constraints: {
          video: { height: { ideal: 720, max: 1080, min: 180 } }
        }
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#0f172a',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'chat', 'raisehand',
          'participants-pane', 'toggle-camera', 'select-background',
          'settings', 'tileview', 'hangup', 'fullscreen',
          'recording', 'sharedvideo', 'noisesuppression'
        ]
      }
    };

    try {
      this.addLog('Instantiating JitsiMeetExternalAPI iframe...', 'info');
      this.jitsiAPI = new (window as any).JitsiMeetExternalAPI(domain, options);
      
      this.connectionStatusSteps[1].status = 'success';
      this.addLog('Jitsi Meet iframe initialized and loaded successfully.', 'success');
      this.connectionStatusSteps[2].status = 'process';
      this.addLog('Awaiting hardware authorization: Checking camera & microphone access permission...', 'warning');

      this.jitsiAPI.addEventListener('videoConferenceJoined', (event: any) => {
        this.connectionStatusSteps[2].status = 'success';
        this.connectionStatusSteps[3].status = 'success';
        this.loading = false;
        this.addLog(`Securely connected to room: '${this.roomName}' (User ID: ${event?.id || 'Local'})`, 'success');
        this.cdr.detectChanges();
      });

      // Safety timeout: automatically hide loader after 6 seconds to prevent stuck loader
      setTimeout(() => {
        if (this.loading) {
          this.addLog('Safety timeout reached. Transitioning to meeting view.', 'warning');
          this.loading = false;
          this.connectionStatusSteps[2].status = 'success';
          this.connectionStatusSteps[3].status = 'success';
          this.cdr.detectChanges();
        }
      }, 6000);

      this.jitsiAPI.addEventListener('videoConferenceLeft', () => {
        this.addLog('You have disconnected from the video conference.', 'warning');
        this.leaveMeeting();
      });

      // Participant events
      this.jitsiAPI.addEventListener('participantJoined', (event: any) => {
        this.addLog(`New participant joined: ${event.displayName || 'Candidate Member'} (ID: ${event.id})`, 'success');
        this.addParticipantToList(event);
      });

      this.jitsiAPI.addEventListener('participantLeft', (event: any) => {
        this.addLog(`Participant disconnected: ID ${event.id}`, 'warning');
        this.removeParticipantFromList(event);
      });

      // Mute state loggers
      this.jitsiAPI.addEventListener('audioMuteStatusChanged', (event: any) => {
        this.addLog(`Your microphone is now ${event.muted ? 'MUTED' : 'UNMUTED'}.`, 'info');
        this.isMicMuted = event.muted;
        this.cdr.detectChanges();
      });

      this.jitsiAPI.addEventListener('videoMuteStatusChanged', (event: any) => {
        this.addLog(`Your camera feed is now ${event.muted ? 'DISABLED' : 'ENABLED'}.`, 'info');
        this.isCamMuted = event.muted;
        this.cdr.detectChanges();
      });

      this.jitsiAPI.addEventListener('screenSharingStatusChanged', (event: any) => {
        this.addLog(`Screen sharing turned ${event.on ? 'ON' : 'OFF'}.`, 'info');
        this.isScreenSharing = event.on;
        this.cdr.detectChanges();
      });

      this.jitsiAPI.addEventListener('tileViewChanged', (event: any) => {
        this.isTileView = event.enabled;
        this.cdr.detectChanges();
      });

      // Hardware access error handlers
      this.jitsiAPI.addEventListener('cameraError', (err: any) => {
        this.connectionStatusSteps[2].status = 'error';
        this.addLog('Webcam hardware error or permission denied: ' + (err?.message || 'Access Blocked'), 'error');
      });

      this.jitsiAPI.addEventListener('micError', (err: any) => {
        this.connectionStatusSteps[2].status = 'error';
        this.addLog('Microphone hardware error or permission denied: ' + (err?.message || 'Access Blocked'), 'error');
      });

    } catch (e: any) {
      this.connectionStatusSteps[1].status = 'error';
      this.addLog('Failed to instantiate JitsiMeetExternalAPI: ' + e.message, 'error');
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // --- PARTICIPANTS & LOBBY LOGIC ---
  addParticipantToList(event: any): void {
    const p = {
      id: event.id,
      name: event.displayName || 'Candidate Member'
    };

    if (this.isInterviewer) {
      this.toastr.info(`${p.name} joined the lobby queue.`);
      this.lobbyQueue.push(p);
    } else {
      this.participants.push(p);
    }
    this.cdr.detectChanges();
  }

  removeParticipantFromList(event: any): void {
    this.participants = this.participants.filter(p => p.id !== event.id);
    this.lobbyQueue = this.lobbyQueue.filter(p => p.id !== event.id);
    this.toastr.warning('A participant left the session.');
    this.cdr.detectChanges();
  }

  admitParticipant(p: any): void {
    this.lobbyQueue = this.lobbyQueue.filter(x => x.id !== p.id);
    this.participants.push(p);
    this.admittedParticipants[p.id] = true;
    this.toastr.success(`${p.name} admitted to call room!`);
    this.cdr.detectChanges();
  }

  // --- LOCAL SCREEN/AUDIO MEETING RECORDER ---
  startLocalRecording(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      this.toastr.error('Screen capture recording is not supported in this browser.');
      return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        this.recordedChunks = [];
        this.mediaRecorder = new (window as any).MediaRecorder(stream, { mimeType: 'video/webm' });

        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `VidhuraTech_Recording_${this.roomName}_${new Date().toISOString().slice(0, 10)}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          this.toastr.success('Interview recording saved and downloaded locally!');
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordingDuration = 0;
        this.recordingTimer = setInterval(() => {
          this.recordingDuration++;
          this.cdr.detectChanges();
        }, 1000);
        this.toastr.success('Local meeting recorder started.');
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.toastr.error('Screen sharing permissions are required to record the meeting.');
      });
  }

  stopLocalRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
      }
      this.cdr.detectChanges();
    }
  }

  getFormattedDuration(): string {
    const mins = Math.floor(this.recordingDuration / 60).toString().padStart(2, '0');
    const secs = (this.recordingDuration % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // --- INVITE SHARING CONTROLS ---
  getMeetingUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/meeting/${this.roomName}`;
    }
    return '';
  }

  copyInviteLink(): void {
    const inviteText = `Hi, please join my VidhuraTech Mock Interview Room: ${this.getMeetingUrl()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteText).then(() => {
        this.toastr.success('Invite link copied to clipboard!');
      });
    }
  }

  shareOnWhatsApp(): void {
    const inviteText = encodeURIComponent(`Join my VidhuraTech Mock Interview: ${this.getMeetingUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${inviteText}`, '_blank');
  }

  shareByEmail(): void {
    const subject = encodeURIComponent('VidhuraTech Mock Interview Invitation');
    const body = encodeURIComponent(`Hi,\n\nPlease join my VidhuraTech Mock Interview room using this link:\n${this.getMeetingUrl()}\n\nRegards`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }

  selectTab(tab: 'scratchpad' | 'rubric' | 'resume' | 'questions' | 'lobby'): void {
    this.activeTab = tab;
  }

  setRating(metric: 'codingSkills' | 'systemDesign' | 'communication' | 'problemSolving', val: number): void {
    if (!this.isInterviewer) return;
    this.evaluation[metric] = val;
  }

  leaveMeeting(): void {
    // 1. Dispose Jitsi to free up microphone, camera, and websocket connections
    if (this.jitsiAPI) {
      this.jitsiAPI.dispose();
      this.jitsiAPI = null;
    }
    
    // 2. Stop local recording if running
    if (this.isRecording) {
      this.stopLocalRecording();
    }
    
    // 3. Clean up stream preview just in case
    this.stopCameraPreview();
    
    // 4. Set state to show the post-meeting page
    this.meetingEnded = true;
    this.cdr.detectChanges();
  }

  getDashboardPath(): string {
    if (this.isGuest) return '/';
    if (this.userRole === 'MENTOR') return '/dashboard/mentor/sessions';
    if (this.userRole === 'TRAINER') return '/dashboard/trainer/mock-interviews';
    if (['ADMIN', 'SUPER_ADMIN'].includes(this.userRole)) return '/dashboard/admin/actions';
    if (this.userRole === 'HR') return '/dashboard/hr';
    if (this.userRole === 'MANAGER') return '/dashboard/manager';
    return '/dashboard/student/mentor-sessions';
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToDashboard(): void {
    this.router.navigate([this.getDashboardPath()]);
  }

  navigateToResume(): void {
    this.router.navigate(['/resume-customizer']);
  }

  navigateToMockInterviews(): void {
    const path = this.userRole === 'TRAINER' ? '/dashboard/trainer/mock-interviews' : '/dashboard/student/mock-interviews';
    this.router.navigate([path]);
  }

  setFeedbackRating(rating: number): void {
    this.feedbackRating = rating;
  }

  submitMeetingFeedback(): void {
    if (this.feedbackRating === 0) {
      this.toastr.warning('Please select a star rating before submitting.');
      return;
    }
    this.feedbackSubmitted = true;
    this.toastr.success('Thank you for sharing your feedback and suggestions!');
    this.cdr.detectChanges();
  }

  submitEvaluation(): void {
    if (!this.isInterviewer) {
      this.toastr.warning('Only authorized interviewers can submit evaluation reviews.');
      return;
    }

    if (!this.evaluation.studentName.trim()) {
      this.toastr.warning('Please enter the student name.');
      return;
    }

    this.isSubmittingFeedback = true;
    
    const scoreBreakdown = `\n\n--- Technical Scores ---\n` +
      `• Coding Skills: ${this.evaluation.codingSkills}/5\n` +
      `• System Design: ${this.evaluation.systemDesign}/5\n` +
      `• Communication: ${this.evaluation.communication}/5\n` +
      `• Problem Solving: ${this.evaluation.problemSolving}/5`;

    if (this.mockSessionId) {
      const formattedRemarks = `Milestone: ${this.evaluation.milestone.trim()}\nProgress: ${this.evaluation.progress}%\nFeedback: ${this.evaluation.note.trim()}${scoreBreakdown}`;

      this.trainerService.updateMockInterview(this.mockSessionId, {
        status: 'COMPLETED',
        trainerRemarks: formattedRemarks,
        meetingLink: this.getMeetingUrl()
      }).subscribe({
        next: (res: any) => {
          this.isSubmittingFeedback = false;
          this.toastr.success('Mock Interview feedback and ratings synced successfully!');
        },
        error: () => {
          this.isSubmittingFeedback = false;
          this.toastr.error('Failed to save Mock Interview feedback.');
        }
      });
    } else {
      const body = {
        studentName: this.evaluation.studentName.trim(),
        progress: this.evaluation.progress,
        milestone: this.evaluation.milestone.trim(),
        note: this.evaluation.note.trim() + scoreBreakdown
      };

      this.mentorService.submitFeedback(body).subscribe({
        next: (res: any) => {
          this.isSubmittingFeedback = false;
          this.toastr.success('Evaluation and rubric ratings synced successfully!');
        },
        error: () => {
          this.isSubmittingFeedback = false;
          this.toastr.error('Failed to submit evaluation to database.');
        }
      });
    }
  }

  // --- EXTERNAL MEETING CONTROL TOOLBAR WRAPPERS (Jitsi External API commands) ---
  toggleAudioState(): void {
    if (this.jitsiAPI) {
      this.jitsiAPI.executeCommand('toggleAudio');
    }
  }

  toggleVideoState(): void {
    if (this.jitsiAPI) {
      this.jitsiAPI.executeCommand('toggleVideo');
    }
  }

  toggleScreenShare(): void {
    if (this.jitsiAPI) {
      this.jitsiAPI.executeCommand('toggleShareScreen');
    }
  }

  toggleRaiseHand(): void {
    if (this.jitsiAPI) {
      this.jitsiAPI.executeCommand('toggleRaiseHand');
      this.isHandRaised = !this.isHandRaised;
      this.cdr.detectChanges();
    }
  }

  toggleTileView(): void {
    if (this.jitsiAPI) {
      this.jitsiAPI.executeCommand('toggleTileView');
    }
  }
}
