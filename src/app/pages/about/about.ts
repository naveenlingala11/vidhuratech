import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { ModalService } from '../../services/modal';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  constructor(
    private modalService: ModalService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.animateCounters();
    this.startStoryAutoplay();
  }

  /* =========================================
     DYNAMIC STATS & ANIMATION
  ========================================= */
  animatedStats = [
    { current: 0, target: 500, suffix: '+', label: 'Students Trained', icon: 'fa-solid fa-users' },
    { current: 0, target: 100, suffix: '+', label: 'Projects Built', icon: 'fa-solid fa-laptop-code' },
    { current: 0, target: 50, suffix: '+', label: 'Students Placed', icon: 'fa-solid fa-trophy' },
    {
      current: 0,
      target: 24,
      suffix: '/7 support',
      label: 'Mentor Availability',
      icon: 'fa-solid fa-headset',
    },
  ];

  animateCounters() {
    this.animatedStats.forEach((stat) => {
      const duration = 1500; // 1.5 seconds
      const steps = 40;
      const stepTime = duration / steps;
      const increment = stat.target / steps;

      let currentVal = 0;
      const timer = setInterval(() => {
        currentVal += increment;
        if (currentVal >= stat.target) {
          stat.current = stat.target;
          clearInterval(timer);
        } else {
          stat.current = Math.floor(currentVal);
        }
      }, stepTime);
    });
  }

  /* =========================================
     CAREER PATH FINDER (Interactive Recommender)
  ========================================= */
  careerStatusOptions = [
    { id: 'student', label: 'College Student / Fresher', icon: 'fa-solid fa-user-graduate' },
    { id: 'non-it', label: 'Non-IT Professional', icon: 'fa-solid fa-briefcase' },
    { id: 'it-pro', label: 'IT Professional (Upgrading)', icon: 'fa-solid fa-chart-line' },
  ];

  careerGoalOptions = [
    { id: 'fullstack', label: 'Full Stack Developer', icon: 'fa-solid fa-layer-group' },
    { id: 'backend', label: 'Backend Specialist', icon: 'fa-solid fa-microchip' },
    { id: 'frontend', label: 'Frontend Specialist', icon: 'fa-solid fa-display' },
  ];

  selectedStatus = '';
  selectedGoal = '';
  recommendationResult: any = null;

  findMyPath() {
    if (!this.selectedStatus || !this.selectedGoal) return;

    let duration = '4 Months';
    let difficulty = 'Beginner to Advanced';
    let primaryTech: string[] = [];
    let careerSteps: string[] = [];
    let jobOutlook = '';

    if (this.selectedStatus === 'student' || this.selectedStatus === 'non-it') {
      if (this.selectedGoal === 'fullstack') {
        duration = '6 Months';
        primaryTech = ['Java', 'Spring Boot', 'Angular', 'SQL', 'Git'];
        careerSteps = [
          'Logic Building: Core Java fundamentals, algorithms, and structures.',
          'UI Engineering: Responsive web layouts using HTML5, CSS3, ES6+, & Angular.',
          'Server Side: RESTful API development using Spring Boot and Spring Data JPA.',
          'Enterprise Architecture: Integration, security, deployment, and testing.',
          'Placement: Dynamic resume optimization, mock interviews, and reference links.',
        ];
        jobOutlook = 'Massive fresher demand. Potential package range: ₹4 LPA - ₹10 LPA.';
      } else if (this.selectedGoal === 'backend') {
        duration = '4 Months';
        primaryTech = ['Java', 'Spring Boot', 'SQL', 'MongoDB', 'REST APIs'];
        careerSteps = [
          'Java Core: Object-Oriented concepts, Collections, and Concurrency.',
          'Database Design: Structured SQL databases and unstructured NoSQL (MongoDB).',
          'Spring Core: Dependency Injection, AOP, and Data access frameworks.',
          'API Security: JWT and OAuth2 integration in Spring Security.',
          'Microservices: Service discovery, configuration server, and gateway setups.',
        ];
        jobOutlook = 'Highly stable roles with premium retention and high growth prospects.';
      } else {
        duration = '4 Months';
        primaryTech = ['Angular', 'React', 'JavaScript (ES6+)', 'HTML5 & CSS3'];
        careerSteps = [
          'Web Fundamentals: CSS flexbox, grid, semantic elements, and responsive designs.',
          'Javascript: Modern ES6 syntax, callbacks, promises, and async/await mechanisms.',
          'Framework Core: Components, Directives, Pipes, Forms, and Routing.',
          'State Management: RxJS reactive patterns and HTTP clients integrations.',
          'Build & Deploy: Production builds, optimization, and launching on Vercel/Netlify.',
        ];
        jobOutlook = 'Quickest entry path to IT. Lots of startups and product companies hiring.';
      }
    } else {
      // IT Professional upgrading
      if (this.selectedGoal === 'fullstack') {
        duration = '5 Months';
        primaryTech = ['Angular', 'Spring Boot', 'Microservices', 'Docker', 'AWS'];
        careerSteps = [
          'Full Stack Sync: Connecting specialized experience to comprehensive client-server flow.',
          'Reactive UI: Dynamic dashboards, RxJS custom streams, and advanced routing.',
          'Scalability: Designing secure microservices and distributed transaction handlers.',
          'DevOps: Dockerizing apps, setting up GitHub Actions pipelines.',
          'Cloud Delivery: AWS deployment (EC2, RDS, ECS) and load balancing.',
        ];
        jobOutlook = 'Tremendous career leverage. Command up to 50%-100% salary hikes.';
      } else if (this.selectedGoal === 'backend') {
        duration = '3 Months';
        primaryTech = ['Spring Boot', 'Microservices', 'Docker', 'AWS', 'Redis'];
        careerSteps = [
          'Architecture: Event-driven architecture with Kafka/RabbitMQ.',
          'Caching & Performance: Implementing Redis cache clusters.',
          'Infrastructure: Multi-stage Docker builds and Kubernetes concepts.',
          'Security & Identity: Centralized authorization servers.',
          'Telemetry: Prometheus, Grafana, and ELK stack integration.',
        ];
        jobOutlook = 'Niche expertise. Accelerates career growth towards Tech Lead / Architect.';
      } else {
        duration = '3 Months';
        primaryTech = ['Angular', 'TypeScript', 'RxJS', 'Web Performance', 'PWA'];
        careerSteps = [
          'Advanced Angular: Performance fine-tuning, change detection strategies, and SSR.',
          'Reactive Patterns: Managing massive asynchronous streams using RxJS.',
          'Security: Preventing XSS, CSRF, and managing Auth cycles.',
          'Modern Capabilities: PWAs, Service Workers, and web workers execution.',
          'Module Federation: Micro-frontends implementation.',
        ];
        jobOutlook = 'High demand for specialized UI Engineers in enterprise apps development.';
      }
    }

    this.recommendationResult = {
      duration,
      difficulty,
      primaryTech,
      careerSteps,
      jobOutlook,
    };
  }

  resetPathFinder() {
    this.selectedStatus = '';
    this.selectedGoal = '';
    this.recommendationResult = null;
  }

  /* =========================================
     TECHNOLOGIES (With Interactive Filtering)
  ========================================= */
  selectedTechCategory = 'all';

  technologies = [
    { name: 'Java', category: 'backend', icon: 'fa-solid fa-code' },
    { name: 'Spring Boot', category: 'backend', icon: 'fa-solid fa-microchip' },
    { name: 'Angular', category: 'frontend', icon: 'fa-solid fa-code' },
    { name: 'React', category: 'frontend', icon: 'fa-solid fa-layer-group' },
    { name: 'Python', category: 'backend', icon: 'fa-solid fa-terminal' },
    { name: 'SQL', category: 'database', icon: 'fa-solid fa-database' },
    { name: 'MongoDB', category: 'database', icon: 'fa-solid fa-database' },
    { name: 'AWS', category: 'cloud', icon: 'fa-solid fa-cloud' },
    { name: 'Docker', category: 'cloud', icon: 'fa-solid fa-box-open' },
    { name: 'Git', category: 'tools', icon: 'fa-solid fa-code-branch' },
    { name: 'REST APIs', category: 'tools', icon: 'fa-solid fa-network-wired' },
    { name: 'Microservices', category: 'backend', icon: 'fa-solid fa-sitemap' },
  ];

  get filteredTechnologies() {
    if (this.selectedTechCategory === 'all') {
      return this.technologies;
    }
    return this.technologies.filter((tech) => tech.category === this.selectedTechCategory);
  }

  /* =========================================
     FAQ (Interactive Search & Accordion)
  ========================================= */
  faqSearchQuery = '';
  activeFaqIndex: number | null = null;

  faqs = [
    {
      question: 'Do you provide placement assistance?',
      answer:
        'Yes. We provide placement guidance, mock interview assessments, resume optimizations, and direct referral opportunities in leading IT firms.',
    },
    {
      question: 'Are classes live or recorded?',
      answer:
        'Our sessions are highly interactive live classes, and we also provide recorded sessions so that you can revise the concepts at your own convenience.',
    },
    {
      question: 'Can beginners join?',
      answer:
        'Absolutely! We design our curriculum starting from basic programming concepts and variables, gradually progressing towards advanced industry architectures.',
    },
    {
      question: 'Do you provide projects?',
      answer:
        'Yes. You will work on multiple mini-projects and a major industry-level live project featuring modern databases, APIs, and clean security layers.',
    },
    {
      question: 'How can I attend a demo class?',
      answer:
        'You can submit your query via the contact form above, or instantly text/call us on WhatsApp. Our mentors will arrange a demo slot for you.',
    },
  ];

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  get filteredFaqs() {
    if (!this.faqSearchQuery.trim()) {
      return this.faqs;
    }
    const query = this.faqSearchQuery.toLowerCase();
    return this.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    );
  }

  /* =========================================
     SUCCESS STORIES (Interactive Slider/Autoplay)
  ========================================= */
  activeStoryIndex = 0;
  autoplayInterval: any;

  successStories = [
    {
      name: 'Ravi Kumar',
      role: 'Software Developer',
      company: 'TCS',
      initial: 'R',
      color: '#00f2fe',
      msg: 'The real-world projects and rigorous mock interview preparations completely changed my confidence level. I secured my job at TCS with ease.',
    },
    {
      name: 'Sneha Reddy',
      role: 'Frontend Developer',
      company: 'Infosys',
      initial: 'S',
      color: '#7028e4',
      msg: 'The deep-dive training in Angular and Spring Boot is outstanding. Mentors explain complex reactive patterns in a very easy, practical way.',
    },
    {
      name: 'Arjun',
      role: 'Java Developer',
      company: 'Wipro',
      initial: 'A',
      color: '#facc15',
      msg: 'As a beginner from a non-CS background, I was afraid of coding. Vidhura Tech support is accessible 24/7, helping me crack Wipro within months.',
    },
    {
      name: 'Priya',
      role: 'Software Engineer',
      company: 'Accenture',
      initial: 'P',
      color: '#ec4899',
      msg: 'The industry mentorship and personalized career guidance are exceptional. The mock interviews match real MNC expectations exactly.',
    },
  ];

  startStoryAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextStory();
    }, 6000);
  }

  nextStory() {
    this.activeStoryIndex = (this.activeStoryIndex + 1) % this.successStories.length;
  }

  prevStory() {
    this.activeStoryIndex =
      (this.activeStoryIndex - 1 + this.successStories.length) % this.successStories.length;
  }

  setStory(index: number) {
    this.activeStoryIndex = index;
    // Reset autoplay timer on manual click
    clearInterval(this.autoplayInterval);
    this.startStoryAutoplay();
  }

  /* =========================================
     CONTACT FORM & HTTP SUBMISSION
  ========================================= */
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  submitting = false;
  successMessage = '';
  errorMessage = '';

  submitContact() {
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/api/public/contact`, this.contactData).subscribe({
      next: () => {
        this.successMessage = 'Message sent successfully. Our team will contact you soon.';
        this.contactData = { name: '', email: '', phone: '', message: '' };
        this.submitting = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: () => {
        this.errorMessage = 'Unable to send message. Please try again later.';
        this.submitting = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      },
    });
  }

  /* =========================================
     STATIC INFO DATA
  ========================================= */
  features = [
    {
      icon: 'fa-solid fa-briefcase',
      title: 'Industry Based Training',
      desc: 'Learn architectures matching exact company projects and patterns.',
    },
    {
      icon: 'fa-solid fa-code',
      title: 'Hands-On Projects',
      desc: 'Build multiple real-world products using Angular, Spring Boot, & databases.',
    },
    {
      icon: 'fa-solid fa-chalkboard-user',
      title: 'Interview Preparation',
      desc: 'Solve mock interviews, revise aptitude topics, and construct killer portfolios.',
    },
    {
      icon: 'fa-solid fa-rocket',
      title: 'Placement Guidance',
      desc: 'Continuous referral support, job portals notifications, and interview reviews.',
    },
    {
      icon: 'fa-solid fa-laptop',
      title: 'Live Training & Recordings',
      desc: 'Engage in live mentor Q&A classes, with direct access to session recordings.',
    },
    {
      icon: 'fa-solid fa-award',
      title: 'Certification',
      desc: 'Earn a verified training completion certificate for your resume showcase.',
    },
  ];

  workflow = [
    { step: '01', title: 'Enroll', desc: 'Secure your learning seat in our path.' },
    { step: '02', title: 'Learn', desc: 'Build solid fundamental concepts in live classes.' },
    { step: '03', title: 'Practice', desc: 'Attempt daily assignments and coding challenges.' },
    { step: '04', title: 'Build', desc: 'Craft industry-scale projects with mentors.' },
    { step: '05', title: 'Prepare', desc: 'Refine technical skills and communication via mocks.' },
    { step: '06', title: 'Get Placed', desc: 'Attend interviews, secure placements, and win.' },
  ];

  whyChooseUs = [
    'Real-Time Project Execution',
    'Daily Code Exercises & Review',
    'Simulated Mock Interviews',
    'Direct Reference Assistance',
    'Professional Resume Engineering',
    '1-on-1 Mentorship Sessions',
    'Long-Term Career Strategy',
    'Interactive Live Discussions',
    '24/7 Chat Support Channel',
    'Access to Student Job Portal',
  ];

  jobSupportFeatures = [
    'Daily Verified Job Updates',
    'Direct Recruiter Apply Links',
    'Fresher Specific Positions',
    'Lateral Experienced Postings',
    'Employee Referral Requests',
    'Detailed Resume Audits',
    'Active Interview Alerts',
    'Career Stream Mapping',
  ];

  companyValues = [
    {
      title: 'Practical Learning First',
      desc: 'Learn topics by writing and executing lines of code.',
    },
    {
      title: 'Relentless Mentorship',
      desc: 'We answer your errors and debug logs whenever you get stuck.',
    },
    {
      title: 'Real Career Outcome',
      desc: 'Our target is to convert concepts into verified corporate offers.',
    },
    {
      title: 'Unified Student Hub',
      desc: 'Connect, study, share resources, and group program with peers.',
    },
  ];

  /* =========================================
     CTA ACTIONS
  ========================================= */
  openEnrollModal() {
    this.modalService.open();
  }

  openWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }

  callNow() {
    window.location.href = 'tel:9108057464';
  }

  sendMail() {
    window.location.href = 'mailto:support@vidhuratech.com';
  }
}
