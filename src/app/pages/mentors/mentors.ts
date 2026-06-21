import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService, MentorProfile } from '../../services/mentor.service';

interface FAQItem {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mentors.html',
  styleUrls: ['./mentors.css']
})
export class Mentors implements OnInit, OnDestroy {
  mentors: MentorProfile[] = [];
  filteredMentors: MentorProfile[] = [];
  loading = true;
  errorMessage = '';

  // Stepper Timeline state
  activeStep = 1;
  private stepperInterval: any;
  private userInteractedWithStepper = false;

  // Search & Filter state
  searchText = '';
  selectedDomain = '';
  selectedExperience = '';
  selectedLanguage = '';
  maxPrice: number | null = null;
  featuredOnly = false;

  // Match Finder console state
  matchDomain = '';
  matchExperience = '';
  isMatchingActive = false;
  matchingProgress = 0;
  matchingStatusText = '';

  // Premium Categories Navigation
  activeCategoryTab = 'all';

  // Match-Maker Wizard state
  showMatchWizard = false;
  wizardStep = 1;
  wizardAnswers = {
    domain: '',
    experience: '',
    focus: '',
    language: '',
    budget: 50000
  };
  mentorScores: { [key: number]: number } = {};

  // Compare Mentors state
  selectedCompareMentors: MentorProfile[] = [];
  showCompareModal = false;

  // Booking Preview state
  showBookingModal = false;
  selectedBookingMentor: MentorProfile | null = null;
  selectedBookingSlot = '';
  selectedBookingPackage = 'trial';
  bookingNotes = '';
  hasAgreedToTerms = false;
  showTermsModal = false;

  // Advanced Sorting & Tech Skills Multi-select
  sortBy = 'rating';
  selectedSkills: string[] = [];
  skillsList = ['Java', 'Spring Boot', 'Angular', 'React', 'TypeScript', 'AWS', 'Docker', 'Python', 'SQL', 'MongoDB', 'System Design', 'DSA'];

  // Interactive Chat Sandbox state
  chatMentor: MentorProfile | null = null;
  chatMessages: { sender: 'user' | 'mentor'; text: string; time: string }[] = [];
  currentChatMessage = '';
  isChatTyping = false;

  // Live Activity Stream Updates
  liveUpdates = [
    { text: 'SDE-1 at Amazon booked 1:1 System Design review', time: '5m ago', type: 'book' },
    { text: 'Resume audited for Senior Frontend Developer at Google', time: '12m ago', type: 'audit' },
    { text: 'Mock interview scorecard sent to TCS consultant', time: '22m ago', type: 'score' },
    { text: '5/5 stars awarded to mentor for Spring Boot microservices drill', time: '40m ago', type: 'star' }
  ];

  // Simulated Booking Slots per Card
  mockSlots = ['Sat 10:00 AM', 'Sun 04:00 PM', 'Mon 08:00 PM'];

  // Popular search tags for one-click filters
  quickTags = ['Google', 'Microsoft', 'Amazon', 'System Design', 'Frontend', 'Backend', 'Java', 'Angular', 'React', 'DSA'];

  // Top companies working cloud
  companyLogos = ['Google', 'Microsoft', 'Amazon', 'Meta', 'TCS', 'Infosys', 'Cognizant', 'Wipro'];

  // Pricing Estimator Calculator State
  selectedCalcTopic = 'dsa';
  calcMonths = 1;
  calculatedMinCost = 3000;
  calculatedMaxCost = 6000;

  // Student Testimonials Gallery
  testimonials = [
    {
      name: 'Naveen Lingala',
      role: 'SDE-2 at Microsoft',
      text: 'The mock interviews and resume reviews with verified mentors here were a game-changer. They gave me concrete feedback on distributed systems that helped me secure my dream role.',
      company: 'Microsoft',
      rating: 5,
      avatar: 'N',
      transition: 'QA Engineer ➔ SDE-2'
    },
    {
      name: 'Priya Sharma',
      role: 'Senior Frontend Dev at Google',
      text: 'Having direct access to mentors on WhatsApp made communication so simple. I got review comments on my angular code in hours and cleared my frontend rounds smoothly.',
      company: 'Google',
      rating: 5,
      avatar: 'P',
      transition: 'Freelancer ➔ Google Developer'
    },
    {
      name: 'Karthik Raja',
      role: 'Backend SDE at Amazon',
      text: 'Highly recommend the System Design mock sessions. We spent 2 hours designing a live rate limiter and a distributed chat application, which came up exactly in my interview!',
      company: 'Amazon',
      rating: 5,
      avatar: 'K',
      transition: 'System Analyst ➔ SDE-1'
    }
  ];

  // Filter options
  domains = ['Software Engineering', 'System Design', 'Frontend Development', 'Backend Development', 'Product Management', 'Data Science & AI'];
  experienceRanges = [
    { label: 'All Experience', value: '' },
    { label: '1-3 Years', value: '1-3' },
    { label: '3-5 Years', value: '3-5' },
    { label: '5-8 Years', value: '5-8' },
    { label: '8+ Years', value: '8+' }
  ];
  languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'];

  domainKeywords: { [key: string]: string[] } = {
    'Software Engineering': ['software', 'engineering', 'coding', 'dsa', 'algorithms', 'git', 'github', 'programming', 'developer'],
    'System Design': ['system design', 'architecture', 'microservices', 'scalability', 'distributed', 'aws', 'cloud'],
    'Frontend Development': ['frontend', 'angular', 'react', 'vue', 'html', 'css', 'javascript', 'typescript', 'sass', 'webpack'],
    'Backend Development': ['backend', 'java', 'spring', 'springboot', 'python', 'node', 'express', 'django', 'fastapi', 'rest api', 'sql', 'mysql', 'postgresql', 'mongodb', 'mulesoft', 'apis', 'microservices'],
    'Product Management': ['product', 'management', 'roadmap', 'agile', 'scrum', 'user experience', 'ux', 'analytics'],
    'Data Science & AI': ['data science', 'ai', 'ml', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'python', 'pandas', 'numpy']
  };

  // Interactive FAQs
  faqs: FAQItem[] = [
    {
      q: 'How does the 1:1 WhatsApp Connect work?',
      a: 'Once you select a mentor, click "Connect Now" or "View Profile". In the booking form, provide your name, contact, and the topic you want help with. Clicking "Connect on WhatsApp" will automatically launch WhatsApp on your device with a pre-filled, customized message directly to that mentor.',
      open: false
    },
    {
      q: 'What topics can I cover during a mentorship session?',
      a: 'You can get customized assistance on DSA & Coding practice, System Design (both High-Level and Low-Level), Frontend/Backend architectures, Resume auditing, Mock interviews, and strategic Career roadmaps.',
      open: false
    },
    {
      q: 'Is the communication direct with the mentor?',
      a: 'Yes! We believe in removing unnecessary middle steps. You connect directly with the mentor on WhatsApp. This allows you to schedule flexible timing, share files, and follow up directly without barriers.',
      open: false
    },
    {
      q: 'How are mentor prices set?',
      a: 'Each mentor sets their own hourly rate based on their industry experience and expertise. Prices are transparently listed on their profiles, and some mentors offer free consultation chats to map out your goals.',
      open: false
    }
  ];

  constructor(private mentorService: MentorService, private router: Router) {}

  ngOnInit(): void {
    this.loadMentors();
    this.startAutoStepper();
  }

  ngOnDestroy(): void {
    this.stopAutoStepper();
  }

  startAutoStepper() {
    this.stepperInterval = setInterval(() => {
      if (!this.userInteractedWithStepper) {
        this.activeStep = (this.activeStep % 4) + 1;
      }
    }, 4000);
  }

  stopAutoStepper() {
    if (this.stepperInterval) {
      clearInterval(this.stepperInterval);
    }
  }

  setActiveStep(step: number) {
    this.activeStep = step;
    this.userInteractedWithStepper = true;
  }

  loadMentors() {
    this.loading = true;
    this.mentorService.getPublicMentors().subscribe({
      next: (res) => {
        this.mentors = (res.data || []).map(m => ({ ...m, selectedPlanType: m.selectedPlanType || 'trial' }));
        if (this.mentors.length > 0 && !this.chatMentor) {
          this.selectSandboxMentor(this.mentors[0]);
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load mentors. Please try again.';
        this.loading = false;
      }
    });
  }

  runMatchFinder() {
    if (!this.matchDomain && !this.matchExperience) {
      document.querySelector('.directory-layout')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    this.isMatchingActive = true;
    this.matchingProgress = 0;
    this.matchingStatusText = 'Scanning expert profiles...';

    const interval = setInterval(() => {
      this.matchingProgress += 10;
      if (this.matchingProgress === 30) {
        this.matchingStatusText = 'Filtering by ' + (this.matchDomain || 'selected fields') + '...';
      } else if (this.matchingProgress === 60) {
        this.matchingStatusText = 'Matching company domains...';
      } else if (this.matchingProgress === 80) {
        this.matchingStatusText = 'Aligning availability calendar...';
      } else if (this.matchingProgress >= 100) {
        clearInterval(interval);
        this.isMatchingActive = false;
        
        // Apply inputs to main filters
        if (this.matchDomain) this.selectedDomain = this.matchDomain;
        if (this.matchExperience) this.selectedExperience = this.matchExperience;
        this.applyFilters();
        
        // Scroll to directory
        setTimeout(() => {
          document.querySelector('.directory-layout')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 150);
  }

  get spotlightMentors(): MentorProfile[] {
    return this.mentors.filter(m => m.featured).slice(0, 3);
  }

  selectCategoryTab(category: string) {
    this.activeCategoryTab = category;
    this.applyFilters();
  }

  calculateCosts() {
    let monthlyMin = 2500;
    let monthlyMax = 6000;

    if (this.selectedCalcTopic === 'system_design') {
      monthlyMin = 5000;
      monthlyMax = 12000;
    } else if (this.selectedCalcTopic === 'mock_interview') {
      monthlyMin = 4000;
      monthlyMax = 9000;
    } else if (this.selectedCalcTopic === 'resume_audit') {
      monthlyMin = 2000;
      monthlyMax = 5000;
    }

    let rawMin = monthlyMin * this.calcMonths;
    let rawMax = monthlyMax * this.calcMonths;

    // Apply multi-month discount (e.g., 10% for 3+ months, 15% for 6+ months)
    if (this.calcMonths >= 6) {
      rawMin = Math.round(rawMin * 0.85);
      rawMax = Math.round(rawMax * 0.85);
    } else if (this.calcMonths >= 3) {
      rawMin = Math.round(rawMin * 0.90);
      rawMax = Math.round(rawMax * 0.90);
    }

    this.calculatedMinCost = rawMin;
    this.calculatedMaxCost = rawMax;
  }

  onSearch() {
    this.applyFilters();
  }

  applyQuickTag(tag: string) {
    this.searchText = tag;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.mentors];

    // Category Tab match
    if (this.activeCategoryTab !== 'all') {
      let keywords: string[] = [];
      if (this.activeCategoryTab === 'dsa') {
        keywords = ['dsa', 'algorithm', 'data structure', 'coding', 'leetcode', 'java', 'python', 'c++', 'programming'];
      } else if (this.activeCategoryTab === 'system_design') {
        keywords = ['system design', 'architecture', 'microservice', 'distributed', 'scalability', 'aws', 'cloud', 'system'];
      } else if (this.activeCategoryTab === 'frontend') {
        keywords = ['frontend', 'angular', 'react', 'vue', 'html', 'css', 'javascript', 'typescript', 'ui', 'ux'];
      } else if (this.activeCategoryTab === 'backend') {
        keywords = ['backend', 'java', 'spring', 'springboot', 'node', 'express', 'django', 'sql', 'database', 'rest api', 'apis', 'microservices'];
      }
      
      result = result.filter(m => {
        if (!m.skills) return false;
        const mentorSkills = m.skills.toLowerCase();
        return keywords.some(kw => mentorSkills.includes(kw.toLowerCase()));
      });
    }

    // Search query match (name, company, role, skills, languages)
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      result = result.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.currentCompany && m.currentCompany.toLowerCase().includes(q)) ||
        (m.currentRole && m.currentRole.toLowerCase().includes(q)) ||
        (m.skills && m.skills.toLowerCase().includes(q)) ||
        (m.languages && m.languages.toLowerCase().includes(q))
      );
    }

    // Domain / Skill match
    if (this.selectedDomain) {
      const keywords = this.domainKeywords[this.selectedDomain] || [this.selectedDomain];
      result = result.filter(m => {
        if (!m.skills) return false;
        const mentorSkills = m.skills.toLowerCase();
        return keywords.some(kw => mentorSkills.includes(kw.toLowerCase()));
      });
    }

    // Experience match
    if (this.selectedExperience) {
      result = result.filter(m => {
        const exp = m.yearsOfExperience || 0;
        if (this.selectedExperience === '1-3') return exp >= 1 && exp <= 3;
        if (this.selectedExperience === '3-5') return exp > 3 && exp <= 5;
        if (this.selectedExperience === '5-8') return exp > 5 && exp <= 8;
        if (this.selectedExperience === '8+') return exp > 8;
        return true;
      });
    }

    // Language match
    if (this.selectedLanguage) {
      const lang = this.selectedLanguage.toLowerCase();
      result = result.filter(m => m.languages && m.languages.toLowerCase().includes(lang));
    }

    // Max Price filter
    if (this.maxPrice !== null && this.maxPrice >= 0) {
      result = result.filter(m => {
        const monthlyRate = m.pricePerMonth || (m.pricePerHour ? m.pricePerHour * 4 : 3999);
        return monthlyRate <= this.maxPrice!;
      });
    }

    // Featured toggle
    if (this.featuredOnly) {
      result = result.filter(m => m.featured);
    }

    // Multi-select Tech Skills match
    if (this.selectedSkills.length > 0) {
      result = result.filter(m => {
        if (!m.skills) return false;
        const mentorSkills = m.skills.toLowerCase();
        return this.selectedSkills.every(skill => mentorSkills.includes(skill.toLowerCase()));
      });
    }

    // Sorting Logic
    if (this.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.sortBy === 'popularity') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (this.sortBy === 'experience') {
      result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    } else if (this.sortBy === 'price') {
      result.sort((a, b) => {
        const priceA = a.pricePerMonth || (a.pricePerHour ? a.pricePerHour * 4 : 3999);
        const priceB = b.pricePerMonth || (b.pricePerHour ? b.pricePerHour * 4 : 3999);
        return priceA - priceB;
      });
    } else if (this.sortBy === 'match') {
      result.sort((a, b) => (this.mentorScores[b.userId] || 0) - (this.mentorScores[a.userId] || 0));
    }

    this.filteredMentors = result;
  }

  resetFilters() {
    this.searchText = '';
    this.selectedDomain = '';
    this.selectedExperience = '';
    this.selectedLanguage = '';
    this.maxPrice = null;
    this.featuredOnly = false;
    this.activeCategoryTab = 'all';
    this.selectedSkills = [];
    this.sortBy = 'rating';
    this.mentorScores = {};
    this.applyFilters();
  }

  getSkillsList(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getLanguagesList(languages: string): string[] {
    if (!languages) return [];
    return languages.split(',').map(l => l.trim()).filter(l => l.length > 0);
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  // --- Match-Maker Wizard ---
  openMatchWizard() {
    this.showMatchWizard = true;
    this.wizardStep = 1;
    this.wizardAnswers = {
      domain: this.selectedDomain || '',
      experience: this.selectedExperience || '',
      focus: '',
      language: this.selectedLanguage || '',
      budget: this.maxPrice || 50000
    };
  }

  closeMatchWizard() {
    this.showMatchWizard = false;
  }

  nextWizardStep() {
    if (this.wizardStep < 4) {
      this.wizardStep++;
    } else {
      this.submitWizard();
    }
  }

  prevWizardStep() {
    if (this.wizardStep > 1) {
      this.wizardStep--;
    }
  }

  submitWizard() {
    this.showMatchWizard = false;
    this.selectedDomain = this.wizardAnswers.domain;
    this.selectedExperience = this.wizardAnswers.experience;
    this.selectedLanguage = this.wizardAnswers.language;
    this.maxPrice = this.wizardAnswers.budget;
    this.calculateMatchScores();
    this.sortBy = 'match';
    this.applyFilters();
    setTimeout(() => {
      document.querySelector('.directory-layout')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  calculateMatchScores() {
    this.mentorScores = {};
    this.mentors.forEach(m => {
      let score = 50; // base compatibility score

      // Domain match (up to +20)
      if (this.wizardAnswers.domain) {
        const keywords = this.domainKeywords[this.wizardAnswers.domain] || [this.wizardAnswers.domain];
        const skills = (m.skills || '').toLowerCase();
        if (keywords.some(kw => skills.includes(kw.toLowerCase()))) {
          score += 20;
        }
      }

      // Experience match (up to +15)
      if (this.wizardAnswers.experience) {
        const exp = m.yearsOfExperience || 0;
        let expMatch = false;
        if (this.wizardAnswers.experience === '1-3' && exp >= 1 && exp <= 3) expMatch = true;
        else if (this.wizardAnswers.experience === '3-5' && exp > 3 && exp <= 5) expMatch = true;
        else if (this.wizardAnswers.experience === '5-8' && exp > 5 && exp <= 8) expMatch = true;
        else if (this.wizardAnswers.experience === '8+' && exp > 8) expMatch = true;
        if (expMatch) score += 15;
      }

      // Focus topic match (up to +15)
      if (this.wizardAnswers.focus) {
        const skills = (m.skills || '').toLowerCase();
        if (skills.includes(this.wizardAnswers.focus.toLowerCase())) {
          score += 15;
        }
      }

      // Language match (up to +10)
      if (this.wizardAnswers.language) {
        const lang = (m.languages || '').toLowerCase();
        if (lang.includes(this.wizardAnswers.language.toLowerCase())) {
          score += 10;
        }
      }

      // Budget match (up to +10)
      const monthlyRate = m.pricePerMonth || (m.pricePerHour ? m.pricePerHour * 4 : 3999);
      if (monthlyRate <= this.wizardAnswers.budget) {
        score += 10;
      } else {
        const diff = monthlyRate - this.wizardAnswers.budget;
        if (diff < 5000) score += 5;
      }

      this.mentorScores[m.userId] = Math.min(score, 99);
    });
  }

  // --- Mentor Comparison ---
  toggleCompareMentor(mentor: MentorProfile) {
    const idx = this.selectedCompareMentors.findIndex(m => m.userId === mentor.userId);
    if (idx > -1) {
      this.selectedCompareMentors.splice(idx, 1);
    } else {
      if (this.selectedCompareMentors.length >= 3) {
        return;
      }
      this.selectedCompareMentors.push(mentor);
    }
  }

  isCompareChecked(mentor: MentorProfile): boolean {
    return this.selectedCompareMentors.some(m => m.userId === mentor.userId);
  }

  clearCompareList() {
    this.selectedCompareMentors = [];
  }

  openCompareModal() {
    if (this.selectedCompareMentors.length >= 2) {
      this.showCompareModal = true;
    }
  }

  closeCompareModal() {
    this.showCompareModal = false;
  }

  // --- Booking Preview Modal ---
  openBookingModal(mentor: MentorProfile, slot?: string, pkg?: string) {
    this.selectedBookingMentor = mentor;
    this.selectedBookingSlot = slot || this.mockSlots[0];
    this.selectedBookingPackage = pkg || mentor.selectedPlanType || 'trial';
    this.bookingNotes = '';
    this.hasAgreedToTerms = false;
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedBookingMentor = null;
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

  getWhatsAppMessageText(): string {
    if (!this.selectedBookingMentor) return '';
    const m = this.selectedBookingMentor;
    const planLabel = this.selectedBookingPackage === 'trial' ? 'Direct 1:1 Trial Session' : 'Monthly Retainer package';
    const priceVal = this.selectedBookingPackage === 'trial' ? '₹99' : (m.pricePerMonth ? `₹${m.pricePerMonth}/mo` : '₹3,999/mo');
    
    let text = `Hello Vidhura Tech Support,\n\n`;
    text += `I just submitted a booking request on the portal for a mediated trial session with mentor *${m.name}* under the *${planLabel}* (${priceVal}).\n`;
    text += `*Preferred Slot:* ${this.selectedBookingSlot}\n`;
    if (this.bookingNotes.trim()) {
      text += `*My Goals:* ${this.bookingNotes.trim()}\n`;
    }
    text += `\nPlease coordinate the trial session and details. Thanks!`;
    return encodeURIComponent(text);
  }

  triggerWhatsAppBooking() {
    if (!this.selectedBookingMentor) return;

    const token = localStorage.getItem('vt_token');
    if (!token) {
      const payload = {
        mentorId: this.selectedBookingMentor.userId,
        topic: this.selectedBookingPackage === 'trial' ? '1:1 Trial Consultation' : 'Monthly Retainer Contract',
        message: this.bookingNotes.trim() || 'Requesting session',
        preferredPlan: this.selectedBookingPackage === 'trial' ? 'TRIAL' : 'MONTHLY',
        mentorName: this.selectedBookingMentor.name,
        selectedBookingSlot: this.selectedBookingSlot,
        selectedBookingPackage: this.selectedBookingPackage
      };
      localStorage.setItem('vt_pending_booking', JSON.stringify(payload));
      alert('Please register first to book your trial session. You will be redirected to the registration page, and your trial request will be automatically completed after registration.');
      this.router.navigate(['/register']);
      return;
    }

    const payload = {
      mentorId: this.selectedBookingMentor.userId,
      topic: this.selectedBookingPackage === 'trial' ? '1:1 Trial Consultation' : 'Monthly Retainer Contract',
      message: this.bookingNotes.trim() || 'Requesting session',
      preferredPlan: this.selectedBookingPackage === 'trial' ? 'TRIAL' : 'MONTHLY'
    };

    this.mentorService.createBookingRequest(payload).subscribe({
      next: (res) => {
        alert('Booking request registered successfully! Opening WhatsApp to coordinate with the Vidhura Support Team...');
        const text = this.getWhatsAppMessageText();
        const supportPhone = '919108057464'; // Official Vidhura Tech Support Number
        window.open(`https://wa.me/${supportPhone}?text=${text}`, '_blank');
        this.closeBookingModal();
      },
      error: (err) => {
        console.error('Booking request registration failed:', err);
        let errMsg = 'Failed to register booking request. Please check if you already have a pending request with this mentor.';
        if (err.status === 0) {
          errMsg = 'Connection Error: Cannot contact the server. Please verify the backend is running and try again.';
        } else if (err.status === 401 || err.status === 403) {
          errMsg = 'Access Denied: Please make sure you are logged in as a Student to book a trial session.';
        } else if (err?.error?.message && err.error.message !== 'No message available') {
          errMsg = err.error.message;
        }
        alert(errMsg);
      }
    });
  }

  // --- Advanced Tech Skills Filter ---
  toggleSkillFilter(skill: string) {
    const idx = this.selectedSkills.indexOf(skill);
    if (idx > -1) {
      this.selectedSkills.splice(idx, 1);
    } else {
      this.selectedSkills.push(skill);
    }
    this.applyFilters();
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  // --- Chat Sandbox Widget ---
  selectSandboxMentor(mentor: MentorProfile) {
    this.chatMentor = mentor;
    this.chatMessages = [
      { sender: 'mentor', text: `Hi! I am ${mentor.name}. Ask me any coding, System Design, or resume question here to see how my WhatsApp support works!`, time: 'Now' }
    ];
    this.currentChatMessage = '';
    this.isChatTyping = false;
  }

  sendSandboxMessage() {
    if (!this.currentChatMessage.trim() || !this.chatMentor) return;
    const msgText = this.currentChatMessage.trim();
    this.chatMessages.push({ sender: 'user', text: msgText, time: 'Now' });
    this.currentChatMessage = '';
    this.isChatTyping = true;

    setTimeout(() => {
      this.isChatTyping = false;
      const lower = msgText.toLowerCase();
      let reply = '';
      if (lower.includes('system design') || lower.includes('hld') || lower.includes('lld')) {
        reply = `For System Design, I recommend starting with standard templates: understand the functional requirements, estimate traffic/storage (QPS, bandwidth), design the high-level system components, and then drill down into API contracts and database schemas. What system are you trying to design?`;
      } else if (lower.includes('dsa') || lower.includes('algorithms') || lower.includes('leet')) {
        reply = `DSA requires structured practice rather than memorization. Start with Arrays & Hashing, move to Two Pointers, Sliding Window, Trees, and then Dynamic Programming. In our mock syncs, we whiteboard problems together. What topic are you studying?`;
      } else if (lower.includes('resume') || lower.includes('portfolio') || lower.includes('cv')) {
        reply = `I'll do an ATS-friendly review of your resume. We will focus on quantifying achievements (using the X-Y-Z formula), refining the technical stack list, and highlighting architectural contributions. What roles are you applying for?`;
      } else {
        reply = `That is a great question! Direct 1:1 sessions are perfect to deep dive into this. On WhatsApp, we can share code fragments, trace logs, and jump on a call to solve it. Let's connect!`;
      }
      this.chatMessages.push({ sender: 'mentor', text: reply, time: 'Now' });
    }, 1200);
  }
}
