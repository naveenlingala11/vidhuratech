import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MentorService, MentorProfile } from '../../../services/mentor.service';
import { StudentMentorService } from '../../../dashboard/student-pages/service/student-mentor.service';
import { ToastrService } from 'ngx-toastr';

export interface MilestoneTimeline {
  company: string;
  logoUrl?: string;
  role: string;
  tenure: string;
  description: string;
}

export interface GroupSession {
  title: string;
  dateLabel: string;
  timeLabel: string;
  bannerUrl: string;
  link: string;
}

export interface VideoTestimonial {
  youtubeUrl: string;
  menteeName: string;
  transition: string;
  company: string;
}

export interface CurriculumMonth {
  monthNumber: number;
  title: string;
  topics: string[];
  sessionCount: number;
  sessionTypes: string[];
}

export interface CurriculumTrack {
  durationLabel: string;
  sessionsCount: number;
  topicsCount: number;
  months: CurriculumMonth[];
}

export interface MentorExtraMetadata {
  mentorshipMinutes: number;
  menteesCount: number;
  timeline: MilestoneTimeline[];
  groupSessions: GroupSession[];
  videoTestimonials: VideoTestimonial[];
  curriculums: CurriculumTrack[];
}

const DEFAULT_METADATA: MentorExtraMetadata = {
  mentorshipMinutes: 4800,
  menteesCount: 35,
  timeline: [
    {
      company: 'Booking.com',
      role: 'Senior Software Engineer',
      tenure: '2024 - Present',
      description: 'Tech lead for scalable high-performance payment engines, handling millions of write requests globally.'
    },
    {
      company: 'CRED',
      role: 'Software Engineer II',
      tenure: '2022 - 2024',
      description: 'Worked on payment card verification systems and optimized database query execution indexes.'
    },
    {
      company: 'Arcesium (D.E. Shaw)',
      role: 'Associate SDE',
      tenure: '2019 - 2022',
      description: 'Developed core distributed transaction logs pipelines and automated unit testing suites.'
    }
  ],
  groupSessions: [
    {
      title: 'Land Your Dream Job: Cracking System Design & DSA at FAANG',
      dateLabel: 'Sun, 28 Jun',
      timeLabel: '06:30 PM',
      bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
      link: '#'
    },
    {
      title: 'Resume Masterclass: How to get shortlisted at Booking.com & CRED',
      dateLabel: 'Sat, 04 Jul',
      timeLabel: '05:00 PM',
      bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
      link: '#'
    }
  ],
  videoTestimonials: [
    {
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      menteeName: 'Dev Mangrani',
      transition: 'QA Engineer ➔ SDE-2',
      company: 'Microsoft'
    }
  ],
  curriculums: [
    {
      durationLabel: '6 Months',
      sessionsCount: 24,
      topicsCount: 45,
      months: [
        {
          monthNumber: 1,
          title: 'Foundation Assessment & Coding Syllabus',
          topics: ['Big-O Analysis & Space Complexity', 'Arrays, Linked Lists, Stack & Queue drills', 'Solving 50 LeetCode Easy/Medium problems'],
          sessionCount: 4,
          sessionTypes: ['1:1 Roadmap Sync', 'Live DSA Debugging', 'Weekly Coding Assessment']
        },
        {
          monthNumber: 2,
          title: 'Advanced DSA & Tree/Graph Algorithms',
          topics: ['Binary Trees, BST traversal', 'Graph DFS/BFS & Recursion strategies', 'Dynamic Programming introduction'],
          sessionCount: 4,
          sessionTypes: ['Live Tree Whiteboarding', 'Mock Coding Assessment', 'Algorithmic Walkthrough']
        },
        {
          monthNumber: 3,
          title: 'High-Level System Design (HLD)',
          topics: ['Load Balancers, API Gateways, Rate Limiters', 'Vertical vs Horizontal scaling patterns', 'NoSQL vs SQL databases selection'],
          sessionCount: 4,
          sessionTypes: ['System Design Review', 'Architecture Assessment', 'Scale Optimization Drill']
        },
        {
          monthNumber: 4,
          title: 'Low-Level System Design & OOP Patterns',
          topics: ['SOLID design principles', 'Design Patterns (Singleton, Factory, Observer)', 'Schema design & UML diagramming'],
          sessionCount: 4,
          sessionTypes: ['OOP Schema Critique', 'Design Code Review', 'LLD Live Drill']
        },
        {
          monthNumber: 5,
          title: 'Behavioral & STAR Method Preparation',
          topics: ['Drafting STAR answers for leadership principles', 'Project deep dive explanation framing', 'Negotiation strategy & HR rounds'],
          sessionCount: 4,
          sessionTypes: ['Mock HR Behavioral Round', 'Pitch Audit & Review', 'STAR Answer Fine-Tuning']
        },
        {
          monthNumber: 6,
          title: 'Placement Assistance & Final Mock Loop',
          topics: ['Direct internal referrals submission', 'Resume ATS audit & LinkedIn profile update', 'Full 4-stage mock interview loops'],
          sessionCount: 4,
          sessionTypes: ['Placement Referral Prep', 'ATS Resume Audit', 'Full Loop Mock Scorecard']
        }
      ]
    },
    {
      durationLabel: '3 Months',
      sessionsCount: 12,
      topicsCount: 25,
      months: [
        {
          monthNumber: 1,
          title: 'Crash DSA Prep & HLD Basics',
          topics: ['Core DSA algorithms walkthrough', 'Scale & database sharding concepts', 'LeetCode Medium list curation'],
          sessionCount: 4,
          sessionTypes: ['Roadmap Sync', 'Live System Architecture Review']
        },
        {
          monthNumber: 2,
          title: 'LLD Patterns & Mock Interviews',
          topics: ['SOLID principles exercises', 'Design Patterns implementation', '2x Full Mock Technical rounds'],
          sessionCount: 4,
          sessionTypes: ['LLD Code Review', 'Mock Interview Prep']
        },
        {
          monthNumber: 3,
          title: 'ATS Resume Review & Referrals',
          topics: ['ATS optimizer review', 'Elevator pitch refinement', 'Direct referral pipelines connection'],
          sessionCount: 4,
          sessionTypes: ['Resume Critique', 'Referral Network Sync']
        }
      ]
    },
    {
      durationLabel: '1 Month',
      sessionsCount: 4,
      topicsCount: 10,
      months: [
        {
          monthNumber: 1,
          title: 'Targeted Gap Analysis & Mock Drills',
          topics: ['Resume assessment & portfolio check', 'Targeted system design mock interview', 'STAR behavior questions alignment'],
          sessionCount: 4,
          sessionTypes: ['Roadmap Assessment', 'Full Mock Interview Loop', 'Action Plan Sync']
        }
      ]
    }
  ]
};

@Component({
  selector: 'app-mentor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mentor-detail.html',
  styleUrls: ['./mentor-detail.css']
})
export class MentorDetail implements OnInit {
  mentor: MentorProfile | null = null;
  loading = true;
  errorMessage = '';

  // Premium Data-driven States
  extraMetadata: MentorExtraMetadata = DEFAULT_METADATA;
  activeCurriculumIndex = 0;
  activeMonthIndex = 0; // Default open first month accordion

  // Booking Form State
  bookingName = '';
  bookingPhone = '';
  bookingTopic = 'General Career Guidance';
  customMessage = '';
  bookingTab = 'inapp'; // 'inapp' or 'whatsapp'
  selectedPlan = 'HOURLY'; // 'HOURLY', 'WEEKLY', 'MONTHLY'
  selectedBookingPackage: 'trial' | 'monthly' = 'trial';
  isLoggedIn = false;
  isStudent = false;
  submittingBooking = false;
  hasAgreedToTerms = false;
  showTermsModal = false;
  mockSlots = ['Sat 10:00 AM', 'Sun 04:00 PM', 'Mon 08:00 PM'];
  selectedBookingSlot = 'Sat 10:00 AM';

  topics = [
    'General Career Guidance',
    'Mock Interview Prep',
    'DSA & Coding Practice',
    'System Design Review',
    'Resume & LinkedIn Critique',
    'Long-term 1:1 Mentorship'
  ];

  // Reviews State
  reviews: any[] = [];
  reviewStats = { averageRating: 5.0, totalReviews: 0, ratingBreakdown: {} as any };
  reviewsLoading = true;

  // Review Modal
  showReviewModal = false;
  reviewRating = 5;
  reviewText = '';
  reviewSessionType = 'General Mentorship';
  submittingReview = false;

  @ViewChild('bookingCard') bookingCard!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private mentorService: MentorService,
    private studentMentorService: StudentMentorService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.route.params.subscribe(params => {
      const idOrSlug = params['id'];
      if (idOrSlug) {
        this.loadMentor(idOrSlug);
      }
    });

    this.route.queryParams.subscribe(qParams => {
      if (qParams['package'] === 'monthly') {
        this.selectedBookingPackage = 'monthly';
        this.selectedPlan = 'MONTHLY';
      } else {
        this.selectedBookingPackage = 'trial';
        this.selectedPlan = 'HOURLY';
      }
      if (qParams['book'] === 'true') {
        setTimeout(() => {
          this.scrollToBooking();
        }, 800);
      }
    });
  }

  checkLoginStatus() {
    try {
      const user = JSON.parse(localStorage.getItem('vt_user') || '{}');
      this.isLoggedIn = !!user.email;
      this.isStudent = user.role === 'STUDENT';
      if (this.isStudent) {
        this.bookingTab = 'inapp';
        this.bookingName = user.name || '';
        this.bookingPhone = user.phone || '';
      } else {
        this.bookingTab = 'whatsapp';
      }
    } catch {
      this.isLoggedIn = false;
      this.isStudent = false;
      this.bookingTab = 'whatsapp';
    }
  }

  loadMentor(idOrSlug: string | number) {
    this.loading = true;
    
    // Check if it is a numeric ID
    const numericId = Number(idOrSlug);
    if (!isNaN(numericId) && idOrSlug !== '') {
      // Load directly by ID
      this.mentorService.getPublicMentorById(numericId).subscribe({
        next: (res) => {
          this.handleMentorLoaded(res.data);
          this.loadReviews(numericId);
        },
        error: () => {
          this.errorMessage = 'Mentor not found or profile is inactive.';
          this.loading = false;
        }
      });
    } else {
      // It is a string slug (e.g., 'shubham-khanna')
      const targetSlug = String(idOrSlug).toLowerCase().trim();
      this.mentorService.getPublicMentors().subscribe({
        next: (res) => {
          const found = (res.data || []).find(m => {
            const slug = (m.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return slug === targetSlug;
          });
          if (found) {
            this.handleMentorLoaded(found);
            this.loadReviews(found.userId);
          } else {
            this.errorMessage = `Mentor with slug "${idOrSlug}" not found.`;
            this.loading = false;
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load mentors directory to resolve slug.';
          this.loading = false;
        }
      });
    }
  }

  handleMentorLoaded(data: MentorProfile) {
    this.mentor = data;
    if (this.mentor) {
      // Customize default metadata to match loaded mentor details
      const name = this.mentor.name || 'Mentor';
      const company = this.mentor.currentCompany || 'top companies';
      const role = this.mentor.currentRole || 'Software Engineer';
      
      const customMetadata = JSON.parse(JSON.stringify(DEFAULT_METADATA));
      
      // Personalize the first timeline milestone
      if (customMetadata.timeline && customMetadata.timeline.length > 0) {
        customMetadata.timeline[0].company = company;
        customMetadata.timeline[0].role = role;
        customMetadata.timeline[0].description = `Active leader at ${company}, driving architectural design, operational excellence, and mentoring team members.`;
      }

      // Personalize webinars / group sessions
      if (customMetadata.groupSessions && customMetadata.groupSessions.length > 0) {
        customMetadata.groupSessions[0].title = `Cracking System Design & DSA interviews at ${company}`;
        customMetadata.groupSessions[1].title = `Resume & LinkedIn Masterclass: Get referred at ${company}`;
      }

      this.extraMetadata = customMetadata;
    }
    this.loading = false;
  }

  loadReviews(mentorId: number): void {
    this.reviewsLoading = true;
    this.mentorService.getMentorReviews(mentorId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.reviews = res.data.reviews || [];
          this.reviewStats.averageRating = res.data.averageRating || 5.0;
          this.reviewStats.totalReviews = res.data.totalReviews || 0;
          this.reviewStats.ratingBreakdown = res.data.ratingBreakdown || {};
        }
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }

  scrollToBooking() {
    if (this.bookingCard) {
      this.bookingCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  onTermsCheckboxClick(event: MouseEvent) {
    event.preventDefault(); // Prevents checkbox from checking automatically
    if (!this.hasAgreedToTerms) {
      this.openTermsModal();
    } else {
      this.hasAgreedToTerms = false;
    }
  }

  openTermsModal() {
    this.showTermsModal = true;
  }

  closeTermsModal() {
    this.showTermsModal = false;
  }

  declineTerms() {
    this.hasAgreedToTerms = false;
    this.showTermsModal = false;
  }

  acceptTerms() {
    this.hasAgreedToTerms = true;
    this.showTermsModal = false;
  }

  submitMediatedBooking() {
    if (!this.bookingTopic) {
      this.toastr.warning('Please select a topic');
      return;
    }
    if (!this.customMessage.trim() || this.customMessage.trim().length < 15) {
      this.toastr.warning('Please write a descriptive goals message of at least 15 characters.');
      return;
    }
    if (!this.hasAgreedToTerms) {
      this.toastr.warning('You must accept the Terms & Conditions first.');
      return;
    }
    if (!this.mentor) return;

    const token = localStorage.getItem('vt_token');
    if (!token) {
      const payload = {
        mentorId: this.mentor.userId,
        topic: this.bookingTopic,
        message: this.customMessage.trim(),
        preferredPlan: this.selectedBookingPackage === 'trial' ? 'TRIAL' : 'MONTHLY',
        mentorName: this.mentor.name,
        selectedBookingSlot: this.selectedBookingSlot,
        selectedBookingPackage: this.selectedBookingPackage
      };
      localStorage.setItem('vt_pending_booking', JSON.stringify(payload));
      alert('Please register first to book your trial session. You will be redirected to the registration page, and your trial request will be automatically completed after registration.');
      this.router.navigate(['/register']);
      return;
    }

    this.submittingBooking = true;
    const body = {
      mentorId: this.mentor.userId,
      topic: this.bookingTopic,
      message: this.customMessage.trim(),
      preferredPlan: this.selectedBookingPackage === 'trial' ? 'TRIAL' : 'MONTHLY'
    };

    this.studentMentorService.createBookingRequest(body).subscribe({
      next: (res: any) => {
        this.submittingBooking = false;
        this.toastr.success(res.message || 'Booking request submitted successfully!');
        
        // Open WhatsApp connect to coordinator
        const planLabel = this.selectedBookingPackage === 'trial' ? 'Direct 1:1 Trial Session' : 'Monthly Retainer package';
        const priceVal = this.selectedBookingPackage === 'trial' ? '₹99' : (this.mentor?.pricePerMonth ? `₹${this.mentor.pricePerMonth}/mo` : '₹3,999/mo');
        
        let text = `Hello Vidhura Tech Support,\n\n`;
        text += `I just submitted a booking request on the portal for a mediated trial session with mentor *${this.mentor?.name}* under the *${planLabel}* (${priceVal}).\n`;
        text += `*Preferred Slot:* ${this.selectedBookingSlot}\n`;
        if (this.customMessage.trim()) {
          text += `*My Goals:* ${this.customMessage.trim()}\n`;
        }
        text += `\nPlease coordinate the trial session and details. Thanks!`;

        const encodedText = encodeURIComponent(text);
        const supportPhone = '919108057464'; // Official Vidhura Tech Support Number
        window.open(`https://wa.me/${supportPhone}?text=${encodedText}`, '_blank');
        
        this.customMessage = '';
        this.hasAgreedToTerms = false;
      },
      error: (err: any) => {
        this.submittingBooking = false;
        console.error('Booking request registration failed:', err);
        let errMsg = 'Failed to register booking request. Please check if you already have a pending request with this mentor.';
        if (err.status === 0) {
          errMsg = 'Connection Error: Cannot contact the server. Please verify the backend is running and try again.';
        } else if (err.status === 401 || err.status === 403) {
          errMsg = 'Access Denied: Please make sure you are logged in as a Student to book a trial session.';
        } else if (err?.error?.message && err.error.message !== 'No message available') {
          errMsg = err.error.message;
        }
        this.toastr.error(errMsg);
      }
    });
  }

  getSkillsList(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getLanguagesList(languages: string): string[] {
    if (!languages) return [];
    return languages.split(',').map(l => l.trim()).filter(l => l.length > 0);
  }

  getAvailabilityDays(): string[] {
    if (!this.mentor?.availabilityDays) return [];
    return this.mentor.availabilityDays.split(',').map(d => d.trim());
  }

  getAvailabilitySlots(): string[] {
    if (!this.mentor?.availabilitySlots) return [];
    return this.mentor.availabilitySlots.split(',').map(s => s.trim());
  }

  getSlotLabel(slot: string): string {
    const labels: any = {
      morning: '🌅 Morning (9 AM - 12 PM)',
      afternoon: '☀️ Afternoon (1 PM - 5 PM)',
      evening: '🌙 Evening (6 PM - 9 PM)'
    };
    return labels[slot] || slot;
  }

  getDayShort(day: string): string {
    const shorts: any = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
      thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    return shorts[day] || day;
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getBreakdownPercent(star: number): number {
    const count = this.reviewStats.ratingBreakdown[star] || 0;
    if (this.reviewStats.totalReviews === 0) return 0;
    return Math.round((count / this.reviewStats.totalReviews) * 100);
  }

  openReviewModal(): void {
    this.showReviewModal = true;
    this.reviewRating = 5;
    this.reviewText = '';
    this.reviewSessionType = 'General Mentorship';
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setRating(star: number): void {
    this.reviewRating = star;
  }

  submitReview(): void {
    if (!this.mentor) return;
    if (!this.reviewText.trim()) {
      this.toastr.warning('Please write a review');
      return;
    }
    this.submittingReview = true;
    this.mentorService.submitReview({
      mentorId: this.mentor.userId,
      rating: this.reviewRating,
      reviewText: this.reviewText.trim(),
      sessionType: this.reviewSessionType
    }).subscribe({
      next: (res: any) => {
        this.submittingReview = false;
        this.showReviewModal = false;
        this.toastr.success('Review submitted successfully!');
        if (this.mentor) {
          this.loadReviews(this.mentor.userId);
        }
      },
      error: (err: any) => {
        this.submittingReview = false;
        const msg = err?.error?.message || 'Failed to submit review';
        this.toastr.error(msg);
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
}
