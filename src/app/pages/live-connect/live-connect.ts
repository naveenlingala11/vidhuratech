import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-live-connect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-connect.html',
  styleUrl: './live-connect.css'
})
export class LiveConnectComponent implements OnInit {
  activeSection: 'manual' | 'roles' | 'pricing' | 'terms' = 'manual';

  // Interactive Live Simulator states
  activeSimulatorTab: 'video' | 'scratchpad' | 'rubric' | 'recording' = 'video';
  simulatedRating = 5;
  simulatedFeedbackText = '';
  feedbackSubmitted = false;

  // State for role guidelines and FAQ search
  selectedRoleUsage: 'student' | 'mentor' | 'trainer' = 'student';
  faqSearchQuery = '';
  activeFaqIndex: number | null = 0; // Default open first FAQ for premium look

  // Detailed comparison matrix
  featuresComparison = [
    {
      category: 'Session Limits',
      free: '10 Mins (Unregistered Guest) / 45 Mins (Free Logged-in)',
      premium: '100% Unlimited Session Duration (Coordinators & Hosts)',
      isCore: true
    },
    {
      category: 'Video & Audio Quality',
      free: 'Standard 720p HD via Element Call WebRTC Engine',
      premium: 'Ultra HD 1080p WebRTC Channels with noise-cancellation',
      isCore: true
    },
    {
      category: 'Interactive Scratchpad',
      free: 'Shared Read/Write Code editor with Syntax highlighting',
      premium: 'AI-assisted Editor, complexity analysis, and live compiler',
      isCore: false
    },
    {
      category: 'Interviewer Rubrics',
      free: 'Standard session evaluation feedback screen',
      premium: 'Dynamic rubric builder, customized scoring metrics & auto sync',
      isCore: false
    },
    {
      category: 'Call Video Recording',
      free: 'Local WebM (Privacy-first client-side browser recorder)',
      premium: 'Automated high-fidelity cloud recordings saved on server',
      isCore: false
    },
    {
      category: 'Attendee Access Gate',
      free: 'Basic identity verification screen for new guest joins',
      premium: 'Managed VIP lobby queues with direct registration options',
      isCore: false
    },
    {
      category: 'Candidate Pipeline Sync',
      free: 'Not Available',
      premium: 'Auto-sync ratings to SmartRecruiters, Workday & HR dashboards',
      isCore: true
    }
  ];

  // Steps manual
  userManualSteps = [
    {
      step: '01',
      title: 'Generate Room Link',
      icon: '🚀',
      desc: 'Hosts log in and instantly generate a secure, end-to-end room link from their workspace panel.',
      badge: 'Quick Launch',
      color: 'violet'
    },
    {
      step: '02',
      title: 'Invite Attendees',
      icon: '✉️',
      desc: 'Share the generated meeting link with candidates, students, or guest interviewers.',
      badge: 'One-Click Share',
      color: 'pink'
    },
    {
      step: '03',
      title: 'Lobby Hardware Check',
      icon: '⚙️',
      desc: 'Participants configure camera/microphone settings in our warmup lobby before joining the session.',
      badge: 'Zero Connection Errors',
      color: 'cyan'
    },
    {
      step: '04',
      title: 'Collaborative Session',
      icon: '💻',
      desc: 'Utilize split-screen video feeds, side-by-side resume verification, and the shared code scratchpad.',
      badge: 'WebRTC Powered',
      color: 'emerald'
    },
    {
      step: '05',
      title: 'Grading & Auto-Save',
      icon: '📝',
      desc: 'Submit candidate scores, trigger local WebM recording downloads, and close the meeting instantly.',
      badge: 'Secure Exit',
      color: 'amber'
    }
  ];

  // Role usages details
  roleUsages = {
    student: {
      title: 'For Students & Job Seekers',
      icon: '🎓',
      summary: 'Practice technical mock interviews under realistic corporate patterns and get comprehensive evaluation insights.',
      bulletPoints: [
        'Practice live coding problems side-by-side with industry experts using our collaborative code editor.',
        'Access curated databases of algorithmic questions, design templates, and interview guides.',
        'No registration required for guest candidates; simply input your name at the gate to join secure rooms.',
        'Receive detailed scorecard summaries containing ratings for logic, coding, and communication.'
      ],
      previewHeadline: 'Interactive Candidate Console',
      previewDetails: 'Displays algorithmic tasks, live compiler feed, and real-time screen share tools.',
      badge: 'Build Career Ready Skills'
    },
    mentor: {
      title: 'For Industry Mentors & Experts',
      icon: '👔',
      summary: 'Conduct remote student evaluations, grade mock interviews, and share structured remarks.',
      bulletPoints: [
        'Select custom evaluation templates and grade students using our interactive rubric sheets.',
        'Easily review student resumes and portfolios directly inside the calling workspace.',
        'Configure custom availabilities, block out dates, and manage student bookings effortlessly.',
        'Access earnings summaries and direct payout tracking in the mentor dashboard.'
      ],
      previewHeadline: 'Mentor Workspace & Grading Portal',
      previewDetails: 'Access candidate profiles, rating rubrics, and privately compile session score cards.',
      badge: 'High Impact Mentoring'
    },
    trainer: {
      title: 'For Campus Trainers & Coordinators',
      icon: '🏫',
      summary: 'Organize large-scale placement readiness drives, batch assessments, and team coding evaluations.',
      bulletPoints: [
        'Oversee recruitment training batches and automatically generate Element Call video rooms.',
        'Compare candidate scores across groups using our unified trainer analytics dashboard.',
        'Hold unlimited duration assessment meetings backed by campus license policies.',
        'Download compiled batch coding evaluations and candidate performance trends.'
      ],
      previewHeadline: 'Trainer Dashboard & Batch Analytics',
      previewDetails: 'Monitor active video sessions, batch progress indicators, and overall score list sheets.',
      badge: 'Scale Campus Readiness'
    }
  };

  // FAQs
  faqs = [
    {
      question: 'Is VidhuraTech Live Connect free to use right now?',
      answer: 'Yes! The core features of VidhuraTech Live Connect are 100% free to use. To deliver highly secure, decentralised, and lag-free video feeds, the platform integrates Element Call (powered by open-source Matrix WebRTC protocols at meet.element.io using a compatible Jitsi Meet iframe API wrapper) rather than hosting video streams on third-party servers. Under our free policy: (1) Unauthenticated guest/free users can use call rooms for up to 10 minutes per session. (2) Registered users who log in with their free VidhuraTech account get extended calls of up to 45 minutes per session. (3) Subscribed coordinators, company mentors, or authorized hosts can run unlimited sessions subject to their active owner policies.'
    },
    {
      question: 'Do I need to sign up to join a mock interview?',
      answer: 'No registration or prior sign-up is required for guest candidates to join a mock interview via a shared session link. However, to keep our workspace secure and help hosts identify you, new unauthenticated guest users must enter their details (such as full name, email address, and designated role) on our glassmorphic gate screen before gaining access to the meeting room. Existing logged-in users bypass this verification gate automatically.'
    },
    {
      question: 'How do the future premium features work?',
      answer: 'Our upcoming Premium Pro Tier is built to offer advanced capabilities for universities, corporate training cells, and hiring panels: (1) Ultra HD 1080p WebRTC channels with enhanced compression for clear screenshares and code reading. (2) AI-Assisted Code Scratchpad Analyzer that reviews code in real-time, explaining algorithmic correctness, recommending space/time complexity optimizations (Big O), and highlighting potential edge-case bugs. (3) Structured Rubric Builders with automatic candidate grade card synchronization. (4) Cloud Storage Sync that automatically uploads session video recordings to secure cloud servers, providing hosts with shareable links instead of downloading locally. (5) Enterprise Applicant Tracking System (ATS) pipeline integration for streamlined HR recruitment.'
    },
    {
      question: 'How can I save recordings of my session?',
      answer: 'Registered host users can record sessions by clicking "Record Call" inside the meeting interface. To guarantee 100% privacy, VidhuraTech does not store, upload, or transmit any video, audio, or scratchpad code data to our servers. Instead, recordings are captured client-side in your web browser using HTML5 display media APIs and stored in local hardware memory. When you click "Stop & Save" or leave the meeting room, the browser automatically compiles the buffer and starts a direct WebM video file download to your computer. Please note that if you close the tab before stopping the recording, the browser memory buffer is cleared and the video is lost forever. This ensures complete data ownership and confidentiality.'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.fragment.subscribe(frag => {
      if (frag === 'quick-manual') {
        setTimeout(() => {
          this.scrollToManual();
        }, 300);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  selectSection(section: 'manual' | 'roles' | 'pricing' | 'terms'): void {
    this.activeSection = section;
  }

  setRoleUsage(role: 'student' | 'mentor' | 'trainer'): void {
    this.selectedRoleUsage = role;
  }

  toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  setSimulatorTab(tab: 'video' | 'scratchpad' | 'rubric' | 'recording'): void {
    this.activeSimulatorTab = tab;
  }

  setSimulatedFeedbackRating(rating: number): void {
    this.simulatedRating = rating;
  }

  submitSimulatedFeedback(): void {
    this.feedbackSubmitted = true;
    setTimeout(() => {
      this.feedbackSubmitted = false;
      this.simulatedRating = 5;
      this.simulatedFeedbackText = '';
    }, 4000);
  }

  get filteredFaqs() {
    if (!this.faqSearchQuery.trim()) {
      return this.faqs;
    }
    const query = this.faqSearchQuery.toLowerCase();
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }

  joinRoomName = '';

  navigateToCreateSession(): void {
    this.router.navigate(['/live-connect/create']);
  }

  joinSession(): void {
    let room = this.joinRoomName.trim();
    if (!room) return;

    // Extract room name if full URL was pasted
    if (room.includes('/meeting/')) {
      const parts = room.split('/meeting/');
      room = parts[parts.length - 1];
    }

    // Clean query params/trailing slashes
    room = room.split('?')[0].split('#')[0].replace(/\/+$/, '');

    if (room) {
      this.router.navigate(['/meeting', room]);
    }
  }

  scrollToManual(): void {
    const manualSection = document.getElementById('quick-manual');
    if (manualSection) {
      manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
