import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface RoadmapStep {
  step: string;
  title: string;
  desc: string;
}

interface ProgramStat {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

interface TechBadge {
  name: string;
  icon: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SectionDetail {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  color: string;
  accent: string;
  gradient: string;
  meshColor: string;
  features: string[];
  stats: ProgramStat[];
  techStack: TechBadge[];
  roadmap: RoadmapStep[];
  faqs: FaqItem[];
  ctaLabel: string;
  ctaRoute: string;
}

@Component({
  selector: 'app-featured-programs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-programs.html',
  styleUrls: ['./featured-programs.css'],
})
export class FeaturedPrograms implements OnInit {
  activeTabId = 'fresher';
  activeFaqIndex: number | null = 0;

  sections: SectionDetail[] = [
    {
      id: 'fresher',
      badge: 'Academic Foundations',
      title: 'Fresher & Graduate Launchpad',
      subtitle: 'Kickstart Your Career in Tech',
      icon: 'bi bi-mortarboard',
      description: 'Specially structured learning programs for final-year engineering students and recent graduates. We bridge the college-to-corporate gap with solid foundations, real-world coding environments, and placement support.',
      color: '#6366f1',
      accent: '#818cf8',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      meshColor: 'rgba(99, 102, 241, 0.15)',
      features: [
        'Structured DSA & Programming Foundations (Java, Python)',
        'Built-in ATS-Optimized Resume Builder tool',
        'Daily automation-graded coding sandbox tasks',
        'Direct campus referrals and entry-level placement drives'
      ],
      stats: [
        { label: 'Placement Rate', value: '94%', sub: 'Within 6 months', icon: 'bi bi-graph-up-arrow' },
        { label: 'Average Package', value: '₹5.6 LPA', sub: 'Highest: ₹14 LPA', icon: 'bi bi-cash-stack' },
        { label: 'Students Placed', value: '1,200+', sub: 'In Tier-1/Product Cos', icon: 'bi bi-people' }
      ],
      techStack: [
        { name: 'Core Java', icon: 'bi bi-code-slash' },
        { name: 'Python', icon: 'bi bi-terminal' },
        { name: 'Data Structures', icon: 'bi bi-diagram-3' },
        { name: 'SQL Databases', icon: 'bi bi-database' },
        { name: 'HTML5 & CSS3', icon: 'bi bi-globe' },
        { name: 'Git Versioning', icon: 'bi bi-git' }
      ],
      roadmap: [
        { step: '01', title: 'Language Foundations', desc: 'Master variables, objects, loops & core DSA syntax' },
        { step: '02', title: 'Database & Backend', desc: 'Build scalable REST APIs & structural SQL schemas' },
        { step: '03', title: 'ATS Resume Audit', desc: 'Craft an optimized professional resume with our tool' },
        { step: '04', title: 'Placement Drives', desc: 'Secure direct campus referral interviews with target partners' }
      ],
      faqs: [
        { question: 'Can I join this program if I am from a non-CS background?', answer: 'Yes! Our Fresher Launchpad starts with absolute programming basics (variables, conditions, loops) before moving to advanced data structures, making it perfect for non-CS students.' },
        { question: 'Do you offer placement guarantees?', answer: 'We offer extensive placement preparation, resume reviews, and direct referral drives with our target partner companies, boasting a 94% success rate.' },
        { question: 'How does the automated sandbox practice work?', answer: 'Our platform has an inline code compiler. You write code for daily assignments directly in your browser, and our server grades it instantly with test cases.' }
      ],
      ctaLabel: 'Browse Starter Courses',
      ctaRoute: '/courses'
    },
    {
      id: 'experienced',
      badge: 'Enterprise Upskilling',
      title: 'Experienced Professional Shift',
      subtitle: 'Scale Up to Product-Based Tech',
      icon: 'bi bi-rocket-takeoff',
      description: 'Are you looking to switch careers or level up to product-based companies like FAANG? Our advanced cohorts help software engineers master complex design principles, system architecture, and cloud deployment.',
      color: '#10b981',
      accent: '#34d399',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      meshColor: 'rgba(16, 185, 129, 0.15)',
      features: [
        'High-Level System Design (HLD & LLD) Masterclasses',
        'DevOps pipelines, Docker, Kubernetes & AWS Orchestration',
        'Mock panel drills with engineering directors from top-tier tech',
        'Confidential salary negotiation and referral pipelines'
      ],
      stats: [
        { label: 'Avg Salary Hike', value: '85%', sub: 'Typical switch metrics', icon: 'bi bi-arrow-up-right' },
        { label: 'Highest Package', value: '₹42 LPA', sub: 'Secured at FAANG', icon: 'bi bi-trophy' },
        { label: 'Active Switchers', value: '350+', sub: 'Engineers upskilled', icon: 'bi bi-person-check' }
      ],
      techStack: [
        { name: 'System Design', icon: 'bi bi-diagram-3-fill' },
        { name: 'Spring Boot', icon: 'bi bi-cpu' },
        { name: 'Docker & K8s', icon: 'bi bi-box-seam' },
        { name: 'AWS Cloud', icon: 'bi bi-cloud' },
        { name: 'Microservices', icon: 'bi bi-grid-3x3-gap' },
        { name: 'Terraform IaC', icon: 'bi bi-layers' }
      ],
      roadmap: [
        { step: '01', title: 'System Architecture', desc: 'Learn scalable distributed caches, DB replication & microservices' },
        { step: '02', title: 'Cloud Infrastructure', desc: 'Dockerize, orchestrate on Kubernetes & build CI/CD pipelines' },
        { step: '03', title: 'Expert Mock Drills', desc: 'Simulate high-pressure technical interviews with MAANG managers' },
        { step: '04', title: 'Confidential Referrals', desc: 'Execute secure candidate referrals to elite tier-1 target firms' }
      ],
      faqs: [
        { question: 'Will this program conflict with my current full-time job?', answer: 'Not at all. Our advanced professional classes are held on weekends and weekday evenings, with all live sessions recorded for flexible viewing.' },
        { question: 'What level of system design is covered in the classes?', answer: 'We cover both Low-Level Design (Design patterns, SOLID principles, schema design) and High-Level Design (sharding, load balancers, rate limiters, message queues).' },
        { question: 'Do you help with salary negotiation?', answer: 'Yes! Our mentors provide dedicated 1:1 sessions to guide you through offer reviews, corporate compensation packages, and strategic salary negotiation.' }
      ],
      ctaLabel: 'Explore Advanced Cohorts',
      ctaRoute: '/courses'
    },
    {
      id: 'coding',
      badge: 'Competitive Arena',
      title: 'Coding Enthusiasts & Contest Winners',
      subtitle: 'Compete, Rank Up & Claim Glory',
      icon: 'bi bi-trophy',
      description: 'For individuals who love solving complex puzzles and competitive programming. Test your limits, rise on the global leaderboards, participate in active hackathons, and win awards.',
      color: '#f59e0b',
      accent: '#fbbf24',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      meshColor: 'rgba(245, 158, 11, 0.15)',
      features: [
        'Weekly Coding Contests with instant global leaderboard reviews',
        'Dynamic Practice Arena with 1000+ curated algorithmic tasks',
        'Pseudo Challenges covering syntax and logic compiler tests',
        'Vidhura merit-based certifications shareable on LinkedIn'
      ],
      stats: [
        { label: 'Practice Tasks', value: '1,000+', sub: 'Curated algorithms', icon: 'bi bi-code-square' },
        { label: 'Weekly Contests', value: '50+', sub: 'Held annually', icon: 'bi bi-lightning' },
        { label: 'Submissions', value: '45K+', sub: 'Compiled code runs', icon: 'bi bi-terminal-dash' }
      ],
      techStack: [
        { name: 'C++', icon: 'bi bi-hash' },
        { name: 'Python 3', icon: 'bi bi-terminal' },
        { name: 'Java Algorithms', icon: 'bi bi-code-slash' },
        { name: 'Dynamic Prog.', icon: 'bi bi-grid-1x2' },
        { name: 'Graph Theory', icon: 'bi bi-share' },
        { name: 'Big-O Analysis', icon: 'bi bi-calculator' }
      ],
      roadmap: [
        { step: '01', title: 'Algorithmic Drills', desc: 'Solve daily recursion, graph, tree & dynamic programming challenges' },
        { step: '02', title: 'Weekly Contests', desc: 'Compete live against thousands with instant online compiler tests' },
        { step: '03', title: 'Global Leaderboard', desc: 'Rank up, unlock points, and showcase your profile to sponsors' },
        { step: '04', title: 'Badges & Rewards', desc: 'Earn verified badges, certificates & prime interview referrals' }
      ],
      faqs: [
        { question: 'Are the coding contests free to participate?', answer: 'Yes! All our standard weekly coding contests are free for registered users. Specialized corporate hiring hackathons might require eligibility reviews.' },
        { question: 'What languages does your browser compiler support?', answer: 'Our practice sandbox and contest compiler fully support C++, Java, Python 3, and JavaScript.' },
        { question: 'Can I show my leaderboard rank to potential recruiters?', answer: 'Absolutely! Your public profile displays your coding badges, contest ratings, and leaderboard standing, which is shareable via a unique link.' }
      ],
      ctaLabel: 'Enter Practice Arena',
      ctaRoute: '/practice'
    },
    {
      id: 'mentorship',
      badge: '1:1 Guided Sprints',
      title: 'Personalized Mentorship Hub',
      subtitle: 'Get Unstuck with Industry Experts',
      icon: 'bi bi-people',
      description: 'Stop wasting hours stuck on complex bugs or system issues. Connect directly with vetted industry professionals for live video calls, code reviews, and structured career planning.',
      color: '#ec4899',
      accent: '#f472b6',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      meshColor: 'rgba(236, 72, 153, 0.15)',
      features: [
        'Open Q&A forum with top-rated software engineers',
        'Monthly retainer packages for continuous guided learning',
        'Dedicated live chat channel with assigned tech mentors'
      ],
      stats: [
        { label: 'Active Mentors', value: '150+', sub: 'Vetted professionals', icon: 'bi bi-person-workspace' },
        { label: 'Mentor Rating', value: '4.9/5', sub: 'From 5,000+ reviews', icon: 'bi bi-star-fill' },
        { label: 'Sessions Held', value: '10K+', sub: 'Mentorship hours', icon: 'bi bi-calendar2-check' }
      ],
      techStack: [
        { name: 'Google', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=128' },
        { name: 'Microsoft', icon: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128' },
        { name: 'Amazon', icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128' },
        { name: 'Meta', icon: 'https://www.google.com/s2/favicons?domain=meta.com&sz=128' },
        { name: 'Apple', icon: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128' },
        { name: 'Netflix', icon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128' },
        { name: 'Uber', icon: 'https://www.google.com/s2/favicons?domain=uber.com&sz=128' },
        { name: 'Stripe', icon: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128' },
        { name: 'Airbnb', icon: 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=128' },
        { name: 'TCS', icon: 'https://www.google.com/s2/favicons?domain=tcs.com&sz=128' },
        { name: 'Infosys', icon: 'https://www.google.com/s2/favicons?domain=infosys.com&sz=128' },
        { name: 'Cognizant', icon: 'https://www.google.com/s2/favicons?domain=cognizant.com&sz=128' },
        { name: 'Wipro', icon: 'https://www.google.com/s2/favicons?domain=wipro.com&sz=128' }
      ],
      roadmap: [
        { step: '01', title: 'Goal Alignment', desc: 'Meet your mentor to align roadmaps and preparation strategies' },
        { step: '02', title: 'Structured Sprints', desc: 'Start weekly video audits, code checkups, and task reviews' },
        { step: '03', title: 'Continuous Chat', desc: 'Access active live chat channels for persistent guidance' }
      ],
      faqs: [
        { question: 'How does a typical 1:1 mentorship session work?', answer: 'A session is a live video call on our portal. You can use this time for code reviews, mock interviews, or custom study plan alignments.' },
        { question: 'Can I switch my mentor if needed?', answer: 'Yes! If you feel your learning goals would match better with another mentor, you can change your mentor allocation via your dashboard settings.' },
        { question: 'How are mentors vetted?', answer: 'All our mentors are active senior developers, tech leads, or engineering managers working at top tech firms, having passed three rounds of technical and communication audits.' }
      ],
      ctaLabel: 'Find a Mentor Now',
      ctaRoute: '/mentors'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get currentSection(): SectionDetail {
    return this.sections.find(s => s.id === this.activeTabId) || this.sections[0];
  }

  selectTab(tabId: string): void {
    this.activeTabId = tabId;
    this.activeFaqIndex = 0; // Reset open FAQ item to the first one
  }

  toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  trackBySectionId(index: number, section: SectionDetail): string {
    return section.id;
  }
}
