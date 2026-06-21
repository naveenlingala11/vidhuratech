import { Injectable, inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { UserPlanBadgeService, UserPlanTier } from './user-plan-badge.service';
import { AuthService } from '../features/auth/services/auth.service';
import { ALL_SKILLS, SECTIONS, AVAILABLE_ROLES, ROLE_KEYWORDS, TEMPLATES } from '../pages/resume/resume-constants';

export interface Employment {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  responsibilities: string;
}

export interface Project {
  title: string;
  tech: string;
  role: string;
  link: string;
  desc: string;
}

export interface Education {
  degree: string;
  college: string;
  year: string;
}

export interface Reference {
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Achievement {
  title: string;
  date: string;
  issuer: string;
  desc: string;
}

export interface Publication {
  title: string;
  publisher: string;
  date: string;
  link: string;
  desc: string;
}

export interface CustomSectionItem {
  title: string;
  subtitle: string;
  date: string;
  desc: string;
}

export interface CustomSection {
  title: string;
  items: CustomSectionItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private planService = inject(UserPlanBadgeService);
  private authService = inject(AuthService);
  private zone = inject(NgZone);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  /* ================= CORE STATE ================= */
  selectedTemplate = 'template1';
  activeSection = 'contact';
  dragIndex = -1;
  profileScore = 0;
  userPlan: UserPlanTier = 'FREE';
  activeTemplateGroup = 'ALL';
  showChecklistDrawer = false;
  activeTab = 'templates';
  showPdfMenu = false;
  showDownloadDropdown = false;

  /* ================= JD SCANNER STATE ================= */
  scanCompleted = false;
  scannerSubTab: 'input' | 'keywords' | 'optimizer' | 'audit' = 'input';
  scanSensitivity: 'strict' | 'moderate' | 'loose' = 'moderate';
  scanScoreThreshold = 80;
  isScanning = false;
  jobDescriptionText = '';
  oldResumeText = '';
  uploadedFileName = '';
  isParsing = false;
  jdMatchedSkills: string[] = [];
  jdMissingSkills: string[] = [];
  jdMatchScore = 50;
  jdSuggestions: string[] = [];

  /* ================= DESIGN & CUSTOMIZATION STATE ================= */
  filterHeadshot = 'ALL';
  filterGraphics = 'ALL';
  filterColumns = 'ALL';

  headingStyle = 'uppercase';
  subheadingStyle = 'bold-dark';
  highlightStyle = 'background';
  dividerStyle = 'line';
  bulletStyle = 'disc';
  dateFormat = 'standard';
  skillsStyle = 'pills';
  headerLayout = 'centered';
  selectedHighlights: { [key: string]: boolean } = {};
  showKeywordModal = false;
  showTemplateDropdown = false;
  previewMode: 'template' | 'raw' = 'template';

  themeColor = '#1e293b';
  headingFont = 'Outfit';
  bodyFont = 'Outfit';
  headingSize = 24;
  bodySize = 14;
  lineSpacing = 1.5;
  sectionSpacing = 20;
  pageMargin = 24;

  customCssOverride = '';
  zoomLevel = 1.0;
  templateHeight = 1056;

  customSectionTitles: any = {
    summary: 'Profile Summary',
    skills: 'Key Skills',
    employment: 'Employment History',
    projects: 'Projects',
    education: 'Education',
    personal: 'Personal Details',
    certifications: 'Certifications',
    achievements: 'Achievements & Awards',
    publications: 'Publications',
    customSections: 'Custom Sections'
  };

  expandedItems: { [key: string]: number } = {
    employment: 0,
    projects: 0,
    education: 0,
    certifications: 0,
    achievements: 0,
    publications: 0,
    customSections: 0
  };

  activeKeyword = '';
  keywordFormats = { tag: '', summary: '', experience: '', project: '' };

  selectedSkills: string[] = [];
  selectedLanguages: string[] = [];
  allLanguages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];

  maxSkills = 25;
  skillInput = '';
  filteredSkills: string[] = [];

  aiRole = '';
  aiExperience = 'Fresher';
  targetRole = 'Full Stack Developer';

  /* ================= SCORECARD CHECKLIST ================= */
  scoreChecklist = {
    hasName: false,
    hasContact: false,
    hasSummary: false,
    hasSkills: false,
    hasEmployment: false,
    hasProjects: false,
    hasEducation: false,
    hasSocials: false
  };

  errors: any = {
    employment: [] as any[],
    projects: [] as any[],
    education: [] as any[],
    personal: {} as any
  };

  /* ================= CONSTANTS EXPOSED ================= */
  readonly allSkills = ALL_SKILLS;
  readonly sections = SECTIONS;
  readonly availableRoles = AVAILABLE_ROLES;
  readonly roleKeywords = ROLE_KEYWORDS;
  readonly templates = TEMPLATES;

  colorPresets = [
    '#1e293b', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
    '#dc2626', '#db2777', '#7c3aed', '#0f766e', '#334155'
  ];

  fontPresets = ['Outfit', 'Inter', 'Roboto', 'Playfair Display', 'Fira Code', 'Georgia'];

  previousTemplate = 'template1';

  /* ================= MAIN DATA MODEL ================= */
  data = {
    name: '',
    email: '',
    phone: '',
    photo: '',
    headline: '',
    summary: '',
    employment: <Employment[]>[],
    projects: <Project[]>[],
    education: <Education[]>[],
    personal: {
      dob: '',
      gender: '',
      address: '',
      nationality: '',
      linkedin: '',
      github: '',
    },
    certifications: <Certification[]>[],
    achievements: <Achievement[]>[],
    publications: <Publication[]>[],
    customSections: <CustomSection[]>[]
  };

  constructor() {
    this.planService.load();
    this.planService.badge$.subscribe(badge => {
      this.userPlan = badge ? badge.tier : 'FREE';
    });
    this.loadSavedResume();
  }

  selectWorkspaceTab(tab: string, section?: string) {
    this.activeTab = tab;
    if (section) {
      this.activeSection = section;
    }
    this.showChecklistDrawer = false;

    if (tab === 'scanner') {
      this.router.navigate(['/resume-scanner']);
    } else if (tab === 'customizer') {
      this.router.navigate(['/resume-customizer']);
    } else if (tab === 'guide') {
      this.router.navigate(['/resume-guide']);
    } else {
      this.router.navigate(['/resume-workspace']);
    }
  }

  selectTemplate(id: string) {
    if (!this.isTemplateLocked(this.selectedTemplate)) {
      this.previousTemplate = this.selectedTemplate;
    }
    this.selectedTemplate = id;
    const t = this.templates.find(x => x.id === id);
    if (t) {
      this.themeColor = t.color;
    }
    if (!this.data.name || this.data.name.trim() === '') {
      this.loadSampleData();
    }
  }

  cancelUpgrade() {
    this.selectedTemplate = this.previousTemplate;
    const t = this.templates.find(x => x.id === this.selectedTemplate);
    if (t) {
      this.themeColor = t.color;
    }
  }

  get filteredTemplates() {
    if (this.activeTemplateGroup === 'ALL') {
      return this.templates;
    }
    return this.templates.filter(t => t.tier === this.activeTemplateGroup);
  }

  getTemplateName(id: string): string {
    const t = this.templates.find(x => x.id === id);
    return t ? t.name : 'Classic';
  }

  addItem(type: 'employment' | 'projects' | 'education' | 'certifications' | 'achievements' | 'publications' | 'customSections') {
    if (type === 'employment') {
      this.data.employment.push({ company: '', role: '', location: '', start: '', end: '', current: false, responsibilities: '' });
    } else if (type === 'projects') {
      this.data.projects.push({ title: '', tech: '', role: '', link: '', desc: '' });
    } else if (type === 'education') {
      this.data.education.push({ degree: '', college: '', year: '' });
    } else if (type === 'certifications') {
      this.data.certifications.push({ name: '', issuer: '', date: '', link: '' });
    } else if (type === 'achievements') {
      this.data.achievements.push({ title: '', date: '', issuer: '', desc: '' });
    } else if (type === 'publications') {
      this.data.publications.push({ title: '', publisher: '', date: '', link: '', desc: '' });
    } else if (type === 'customSections') {
      this.data.customSections.push({ title: 'New Custom Section', items: [] });
    }
    this.updateScore();
  }

  removeItem(type: 'employment' | 'projects' | 'education' | 'certifications' | 'achievements' | 'publications' | 'customSections', index: number) {
    if (type === 'employment') {
      this.data.employment.splice(index, 1);
    } else if (type === 'projects') {
      this.data.projects.splice(index, 1);
    } else if (type === 'education') {
      this.data.education.splice(index, 1);
    } else if (type === 'certifications') {
      this.data.certifications.splice(index, 1);
    } else if (type === 'achievements') {
      this.data.achievements.splice(index, 1);
    } else if (type === 'publications') {
      this.data.publications.splice(index, 1);
    } else if (type === 'customSections') {
      this.data.customSections.splice(index, 1);
    }
    this.updateScore();
  }

  addCustomSectionItem(secIndex: number) {
    if (this.data.customSections[secIndex]) {
      if (!this.data.customSections[secIndex].items) {
        this.data.customSections[secIndex].items = [];
      }
      this.data.customSections[secIndex].items.push({ title: '', subtitle: '', date: '', desc: '' });
      this.updateScore();
    }
  }

  removeCustomSectionItem(secIndex: number, itemIndex: number) {
    if (this.data.customSections[secIndex]?.items) {
      this.data.customSections[secIndex].items.splice(itemIndex, 1);
      this.updateScore();
    }
  }

  toggleLanguage(lang: string) {
    const idx = this.selectedLanguages.indexOf(lang);
    if (idx > -1) {
      this.selectedLanguages.splice(idx, 1);
    } else {
      this.selectedLanguages.push(lang);
    }
    this.updateScore();
  }

  get customizerFilteredTemplates() {
    return this.templates.filter(t => {
      // Filter by Headshot
      if (this.filterHeadshot !== 'ALL') {
        const hasPhoto = t.photo;
        if (this.filterHeadshot === 'YES' && !hasPhoto) return false;
        if (this.filterHeadshot === 'NO' && hasPhoto) return false;
      }
      // Filter by Graphics Style
      if (this.filterGraphics !== 'ALL' && t.graphics !== this.filterGraphics) {
        return false;
      }
      // Filter by Columns
      if (this.filterColumns !== 'ALL') {
        const cols = t.columns || 1;
        if (this.filterColumns === '1' && cols !== 1) return false;
        if (this.filterColumns === '2' && cols !== 2) return false;
      }
      return true;
    });
  }

  isTemplateLocked(templateId: string): boolean {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return false;

    const user = this.authService.getUser();
    const role = String(user?.role || '').trim().toUpperCase();
    if (['ADMIN', 'SUPER_ADMIN', 'HR', 'MANAGER', 'TRAINER', 'MENTOR'].includes(role)) {
      return false;
    }

    const requiredTier = template.tier || 'FREE';
    if (requiredTier === 'FREE' || requiredTier === 'BASIC') {
      return false;
    }

    if (requiredTier === 'PRO') {
      return this.userPlan !== 'PRO' && this.userPlan !== 'ELITE';
    }

    if (requiredTier === 'ELITE') {
      return this.userPlan !== 'ELITE';
    }

    return false;
  }

  getTemplateTier(templateId: string): string {
    const template = this.templates.find(t => t.id === templateId);
    return template ? (template.tier || 'FREE') : 'FREE';
  }

  openUpgradeLink() {
    if (typeof window !== 'undefined') {
      const template = this.templates.find(t => t.id === this.selectedTemplate);
      const tier = template ? (template.tier || 'PRO') : 'PRO';
      window.open(`/pricing-plans?unlock=${tier}&redirect=/resume-workspace`, '_blank');
    }
  }

  clearForm() {
    this.data = {
      name: '',
      email: '',
      phone: '',
      photo: '',
      headline: '',
      summary: '',
      employment: [],
      projects: [],
      education: [],
      personal: {
        dob: '',
        gender: '',
        address: '',
        nationality: '',
        linkedin: '',
        github: '',
      },
      certifications: [],
      achievements: [],
      publications: [],
      customSections: []
    };
    this.selectedSkills = [];
    this.selectedLanguages = [];
    this.jdSuggestions = [];
    this.jdMatchScore = 0;
    this.jdMatchedSkills = [];
    this.jdMissingSkills = [];
    this.uploadedFileName = '';
    this.oldResumeText = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vt_saved_resume');
    }
    this.updateScore();
  }

  loadSampleData() {
    this.data = {
      name: 'User',
      email: 'user@domain.com',
      phone: '+91 9876543210',
      photo: '',
      headline: 'Full Stack Java Developer',
      summary: 'Passionate Full Stack Java Developer with 2+ years of educational and practical experience specializing in Angular, Spring Boot microservices, and Postgres database systems. Proven capabilities in building interactive responsive sandbox interfaces, optimizing latency, and deploying secure APIs with comprehensive unit testing frameworks.',
      employment: [
        {
          company: 'Vidhura Tech Labs',
          role: 'Junior Full Stack Developer',
          location: 'Bangalore, India',
          start: '2024-06-01',
          end: '',
          current: true,
          responsibilities: 'Developed responsive, glassmorphic UI components in Angular 18 with smooth keyframe layouts.\nDesigned and deployed Java Spring Boot REST APIs utilizing JWT authentication controls and Postgres backends.\nOptimized practice playground sandbox instances, improving container hot-reload latency by 28%.'
        }
      ],
      projects: [
        {
          title: 'Interactive Code Playground',
          tech: 'Angular, Node.js, Docker, WebSockets',
          role: 'Lead Project Developer',
          link: 'https://github.com/user_name/interactive-sandbox',
          desc: 'Developed an isolated virtual code execution interface provisioning backend database sandboxes directly inside the browser, allowing students to test API calls in real time.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Technology in Computer Science',
          college: 'JNTU University',
          year: '2024'
        }
      ],
      personal: {
        dob: '2002-05-15',
        gender: 'Male',
        address: 'HSR Layout Sector 2, Bangalore, KA, 560102',
        nationality: 'Indian',
        linkedin: 'https://linkedin.com/in/user_name',
        github: 'https://github.com/user_name'
      },
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services (AWS)',
          date: '2025-01-15',
          link: 'https://aws.amazon.com/verification'
        }
      ],
      achievements: [
        {
          title: 'First Place – Smart India Hackathon',
          date: '2023-11-20',
          issuer: 'Ministry of Education, India',
          desc: 'Led a team of 6 developers to construct a real-time landslide monitoring system with AWS IoT Core integration.'
        }
      ],
      publications: [
        {
          title: 'Optimizing Container Startup Latencies in Serverless Environments',
          publisher: 'IEEE Conference on Cloud Computing',
          date: '2024-04-10',
          link: 'https://ieee.org/publications/serverless-opt',
          desc: 'Presented analytical insights regarding the impact of pre-fetching layered base images on sandbox spin-up times.'
        }
      ],
      customSections: [
        {
          title: 'Extra-Curricular Leadership',
          items: [
            {
              title: 'President – College Coding Club',
              subtitle: 'JNTU Student Association',
              date: '2023-08-01',
              desc: 'Organized 12+ hackathons and mentored 150+ students in algorithms and basic software engineering architectures.'
            }
          ]
        }
      ]
    };
    this.selectedSkills = ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'SQL', 'REST API', 'Docker', 'Git'];
    this.selectedLanguages = ['English', 'Telugu', 'Hindi'];
    this.updateScore();
  }

  getDuration(start: string, end: string) {
    if (!start) return '';
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years > 0 ? years + ' yr ' : ''}${months > 0 ? months + ' mos' : ''}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const year = dateMatch[1];
      const monthIndex = parseInt(dateMatch[2], 10) - 1;
      const monthNumStr = dateMatch[2];

      if (this.dateFormat === 'slash') {
        return `${monthNumStr}/${year}`;
      } else if (this.dateFormat === 'full') {
        const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${fullMonths[monthIndex]} ${year}`;
      } else if (this.dateFormat === 'year') {
        return year;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  }

  generateAIResume() {
    if (!this.aiRole) {
      alert('Please enter a role before generating.');
      return;
    }
    this.data.summary = `Results-driven ${this.aiRole} with a strong foundation in modern architectures, code optimizations, and software engineering principles. Proficient in designing scalable applications, writing clean logic, and collaborating across development teams to achieve milestones.`;
    this.data.headline = `Associate ${this.aiRole}`;

    const match = this.roleKeywords[this.aiRole] || this.roleKeywords['Full Stack Developer'];
    this.selectedSkills = match.slice(0, 7);

    this.data.projects = [
      {
        title: `Enterprise ${this.aiRole} System`,
        tech: this.selectedSkills.join(', '),
        role: 'Developer',
        link: 'https://github.com/example/enterprise-system',
        desc: `Architected and developed a core module for an enterprise-level platform utilizing ${this.selectedSkills.slice(0, 3).join(' and ')}, enhancing transaction speed by 18%.`
      }
    ];

    this.data.employment = [
      {
        company: 'Systems Solutions Inc',
        role: `Junior ${this.aiRole}`,
        location: 'Bangalore, India',
        start: '2025-01-01',
        end: '',
        current: true,
        responsibilities: `Developed robust functional modules and resolved platform tickets.\nCollaborated on database schema design and writing clean API documentation.`
      }
    ];

    this.updateScore();
  }

  updateScore() {
    this.scoreChecklist.hasName = !!(this.data.name && this.data.name.length >= 3);
    this.scoreChecklist.hasContact = !!(this.data.email && /^\S+@\S+\.\S+$/.test(this.data.email) && this.data.phone && /^\d{10}$/.test(this.data.phone));
    this.scoreChecklist.hasSummary = !!(this.data.summary && this.data.summary.length >= 20);
    this.scoreChecklist.hasSkills = this.selectedSkills.length >= 4;
    this.scoreChecklist.hasEmployment = this.data.employment.length > 0 && !!this.data.employment[0].company;
    this.scoreChecklist.hasProjects = this.data.projects.length > 0 && !!this.data.projects[0].title;
    this.scoreChecklist.hasEducation = this.data.education.length > 0 && !!this.data.education[0].degree;
    this.scoreChecklist.hasSocials = !!(this.data.personal.linkedin || this.data.personal.github);

    let score = 0;
    if (this.scoreChecklist.hasName) score += 10;
    if (this.scoreChecklist.hasContact) score += 15;
    if (this.scoreChecklist.hasSummary) score += 10;
    if (this.scoreChecklist.hasSkills) score += 15;
    if (this.scoreChecklist.hasEmployment) score += 20;
    if (this.scoreChecklist.hasProjects) score += 15;
    if (this.scoreChecklist.hasEducation) score += 10;
    if (this.scoreChecklist.hasSocials) score += 5;

    this.profileScore = score;
  }

  /* ================= JD KEYWORDS MATCHER SCANNER ================= */
  scanJdAndResume(isManual = false) {
    if (!this.jobDescriptionText || this.jobDescriptionText.trim().length === 0) {
      if (isManual) {
        alert('Please paste a Job Description first.');
      }
      return;
    }

    if (this.oldResumeText && this.oldResumeText.trim().length > 0) {
      this.parseOldResumeText(this.oldResumeText);
    }

    this.isScanning = true;

    setTimeout(() => {
      const foundJdKeywords: string[] = [];
      this.allSkills.forEach(s => {
        const escaped = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let regex: RegExp;
        if (this.scanSensitivity === 'strict') {
          regex = new RegExp('\\b' + escaped + '\\b', 'i');
        } else if (this.scanSensitivity === 'moderate') {
          regex = new RegExp('\\b' + escaped + '(s|es)?\\b', 'i');
        } else {
          regex = new RegExp(escaped, 'i');
        }

        if (regex.test(this.jobDescriptionText)) {
          foundJdKeywords.push(s);
        }
      });

      this.jdMatchedSkills = foundJdKeywords.filter(s => this.selectedSkills.includes(s));
      this.jdMissingSkills = foundJdKeywords.filter(s => !this.selectedSkills.includes(s));

      if (foundJdKeywords.length > 0) {
        this.jdMatchScore = Math.round((this.jdMatchedSkills.length / foundJdKeywords.length) * 100);
      } else {
        this.jdMatchScore = 50;
      }

      this.generateJdSuggestions();
      this.scanCompleted = true;
      this.scannerSubTab = 'keywords';
      this.isScanning = false;
    }, 1000);
  }

  optimizeResume() {
    if (this.jdMissingSkills.length === 0) return;

    this.jdMissingSkills.forEach(s => {
      if (this.selectedSkills.length < this.maxSkills && !this.selectedSkills.includes(s)) {
        this.selectedSkills.push(s);
        this.jdMatchedSkills.push(s);
      }
    });

    this.jdMissingSkills = [];
    this.jdMatchScore = 100;
    this.jdSuggestions = this.jdSuggestions.filter(s => !s.includes('missing critical keywords'));
    this.updateScore();
  }

  openKeywordIntegration(keyword: string) {
    this.activeKeyword = keyword;
    const lower = keyword.toLowerCase();
    let summarySent = '';
    let expBullet = '';
    let projBullet = '';

    if (/\b(docker|kubernetes|k8s|aws|azure|gcp|jenkins|ansible|terraform|ci\/cd|devops|nginx|cloud|helm|git)\b/i.test(lower)) {
      summarySent = `Specialized in modern cloud architecture, containerization, and establishing automated workflows utilizing ${keyword}.`;
      expBullet = `Successfully built and maintained high-availability deployments and automated CI/CD pipelines with ${keyword}, reducing release times by 35%.`;
      projBullet = `Designed and deployed microservices-based project configurations orchestrated via ${keyword} for seamless scaling.`;
    } else if (/\b(java|python|javascript|typescript|js|ts|rust|go|golang|c\+\+|c#|\.net|php|ruby|scala|kotlin|swift|sql)\b/i.test(lower)) {
      summarySent = `Possess strong programming proficiency in designing backend application layers and algorithms using ${keyword}.`;
      expBullet = `Engineered clean modular backend microservices and high-throughput database queries in ${keyword}, boosting response latency by 20%.`;
      projBullet = `Developed clean functional systems using ${keyword} to power backend transactions and business routing logic.`;
    } else if (/\b(angular|react|vue|html|css|tailwind|sass|next\.js|nuxt|flutter|react-native|bootstrap|ux|ui)\b/i.test(lower)) {
      summarySent = `Expertise in building highly responsive client-facing interfaces, pixel-perfect layouts, and components utilizing ${keyword}.`;
      expBullet = `Redesigned visual dashboards and web frontends using ${keyword}, improving mobile responsive scores and core web vitals by 40%.`;
      projBullet = `Built a modern responsive single-page web client powered by ${keyword} with dynamic routing and state management.`;
    } else {
      summarySent = `Proven skill in leveraging ${keyword} to deliver optimized solutions and adhere to technical standards.`;
      expBullet = `Successfully integrated ${keyword} into the development lifecycle to streamline system efficiency and improve data integrity.`;
      projBullet = `Implemented integrations with ${keyword} to enhance application performance, business logic, and modular scalability.`;
    }

    this.keywordFormats = {
      tag: keyword,
      summary: summarySent,
      experience: expBullet,
      project: projBullet
    };

    this.showKeywordModal = true;
  }

  markKeywordAsMatched(keyword: string) {
    if (!this.selectedSkills.includes(keyword) && this.selectedSkills.length < this.maxSkills) {
      this.selectedSkills.push(keyword);
    }
    if (this.jdMissingSkills.includes(keyword)) {
      this.jdMatchedSkills.push(keyword);
      this.jdMissingSkills = this.jdMissingSkills.filter(s => s !== keyword);
      const total = this.jdMatchedSkills.length + this.jdMissingSkills.length;
      this.jdMatchScore = total > 0 ? Math.round((this.jdMatchedSkills.length / total) * 100) : 100;
    }
    this.updateScore();
  }

  insertSkillTag() {
    this.markKeywordAsMatched(this.activeKeyword);
    this.showKeywordModal = false;
  }

  insertIntoSummary() {
    const currentSummary = this.data.summary ? this.data.summary.trim() : '';
    if (currentSummary) {
      this.data.summary = currentSummary + ' ' + this.keywordFormats.summary;
    } else {
      this.data.summary = this.keywordFormats.summary;
    }
    this.markKeywordAsMatched(this.activeKeyword);
    this.showKeywordModal = false;
  }

  insertIntoExperience() {
    if (this.data.employment.length === 0) {
      this.data.employment.push({
        company: 'Company Name',
        role: 'Designated Role',
        location: 'Location',
        start: '2025-01-01',
        end: '',
        current: true,
        responsibilities: ''
      });
    }
    const currentResp = this.data.employment[0].responsibilities ? this.data.employment[0].responsibilities.trim() : '';
    if (currentResp) {
      this.data.employment[0].responsibilities = currentResp + '\n' + this.keywordFormats.experience;
    } else {
      this.data.employment[0].responsibilities = this.keywordFormats.experience;
    }
    this.markKeywordAsMatched(this.activeKeyword);
    this.showKeywordModal = false;
  }

  insertIntoProjects() {
    if (this.data.projects.length === 0) {
      this.data.projects.push({
        title: 'Project Title',
        tech: '',
        role: 'Developer',
        link: '',
        desc: ''
      });
    }
    const currentDesc = this.data.projects[0].desc ? this.data.projects[0].desc.trim() : '';
    if (currentDesc) {
      this.data.projects[0].desc = currentDesc + ' ' + this.keywordFormats.project;
    } else {
      this.data.projects[0].desc = this.keywordFormats.project;
    }
    const currentTech = this.data.projects[0].tech ? this.data.projects[0].tech.trim() : '';
    if (currentTech) {
      if (!currentTech.toLowerCase().includes(this.activeKeyword.toLowerCase())) {
        this.data.projects[0].tech = currentTech + ', ' + this.activeKeyword;
      }
    } else {
      this.data.projects[0].tech = this.activeKeyword;
    }
    this.markKeywordAsMatched(this.activeKeyword);
    this.showKeywordModal = false;
  }

  generateJdSuggestions() {
    this.jdSuggestions = [];
    if (this.jdMatchScore < this.scanScoreThreshold) {
      this.jdSuggestions.push(`Your match rating (${this.jdMatchScore}%) is below your target pass threshold of ${this.scanScoreThreshold}%.`);
      const top3 = this.jdMissingSkills.slice(0, 3).join(', ');
      if (top3) {
        this.jdSuggestions.push(`Incorporate missing critical keywords into summary, experience, or projects: ${top3}.`);
      }
    } else {
      this.jdSuggestions.push(`Excellent match rating! Your resume passes the target score criteria (${this.jdMatchScore}% score vs ${this.scanScoreThreshold}% threshold).`);
    }

    if (this.data.employment.length === 0) {
      this.jdSuggestions.push('Add at least one professional work history item to improve structure and scoring.');
    } else {
      const emptyDesc = this.data.employment.some(e => !e.responsibilities || e.responsibilities.trim().length < 15);
      if (emptyDesc) {
        this.jdSuggestions.push('Flesh out employment bullet lists with metrics to impress human screeners.');
      }
    }

    if (this.data.projects.length === 0) {
      this.jdSuggestions.push('Add at least one technical project demonstrating core stack implementations.');
    }

  }

  validate(): boolean {
    this.errors = {
      employment: [] as any[],
      projects: [] as any[],
      education: [] as any[],
      personal: {} as any
    };

    if (!this.data.name || this.data.name.trim().length < 3) {
      this.errors.name = 'Name must be at least 3 characters.';
    }
    if (!this.data.headline || this.data.headline.trim().length < 3) {
      this.errors.headline = 'Professional title must be at least 3 characters.';
    }
    if (!this.data.email || !/^\S+@\S+\.\S+$/.test(this.data.email.trim())) {
      this.errors.email = 'Invalid email address format.';
    }
    const phoneRegex = /^(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$|^\d{10}$/;
    if (!this.data.phone || !phoneRegex.test(this.data.phone.trim())) {
      this.errors.phone = 'Phone must be a valid 10-digit number or international format.';
    }
    if (!this.data.summary || this.data.summary.trim().length < 20) {
      this.errors.summary = 'Summary must be at least 20 characters.';
    } else if (this.data.summary.trim().length > 1500) {
      this.errors.summary = 'Summary must not exceed 1500 characters.';
    }

    if (this.selectedSkills.length < 3) {
      this.errors.skills = 'Please add at least 3 skills.';
    }

    this.data.employment.forEach((emp, index) => {
      const empErrors: any = {};
      if (!emp.company || emp.company.trim().length < 2) {
        empErrors.company = 'Company name is required.';
      }
      if (!emp.role || emp.role.trim().length < 2) {
        empErrors.role = 'Role/position is required.';
      }
      if (!emp.start) {
        empErrors.start = 'Start date is required.';
      }
      if (!emp.responsibilities || emp.responsibilities.trim().length < 15) {
        empErrors.responsibilities = 'Responsibilities must be at least 15 characters.';
      }
      this.errors.employment[index] = empErrors;
    });

    this.data.projects.forEach((proj, index) => {
      const projErrors: any = {};
      if (!proj.title || proj.title.trim().length < 2) {
        projErrors.title = 'Project title is required.';
      }
      if (!proj.tech || proj.tech.trim().length < 2) {
        projErrors.tech = 'Technologies list is required.';
      }
      if (!proj.desc || proj.desc.trim().length < 15) {
        projErrors.desc = 'Description must be at least 15 characters.';
      }
      this.errors.projects[index] = projErrors;
    });

    this.data.education.forEach((edu, index) => {
      const eduErrors: any = {};
      if (!edu.degree || edu.degree.trim().length < 2) {
        eduErrors.degree = 'Degree/certification is required.';
      }
      if (!edu.college || edu.college.trim().length < 2) {
        eduErrors.college = 'College/University name is required.';
      }
      if (!edu.year || !/^\d{4}$/.test(edu.year.trim())) {
        eduErrors.year = 'Please enter a valid 4-digit graduation year.';
      }
      this.errors.education[index] = eduErrors;
    });

    if (this.data.personal.dob && !/^\d{4}-\d{2}-\d{2}$/.test(this.data.personal.dob.trim())) {
      this.errors.personal.dob = 'DOB must be in YYYY-MM-DD format.';
    }
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (this.data.personal.linkedin && !urlRegex.test(this.data.personal.linkedin.trim())) {
      this.errors.personal.linkedin = 'Invalid LinkedIn URL.';
    }
    if (this.data.personal.github && !urlRegex.test(this.data.personal.github.trim())) {
      this.errors.personal.github = 'Invalid GitHub URL.';
    }

    const hasBasicErrors = !!(this.errors.name || this.errors.headline || this.errors.email || this.errors.phone || this.errors.summary || this.errors.skills);
    const hasPersonalErrors = Object.keys(this.errors.personal).length > 0;
    const hasEmploymentErrors = this.errors.employment.some((x: any) => Object.keys(x).length > 0);
    const hasProjectErrors = this.errors.projects.some((x: any) => Object.keys(x).length > 0);
    const hasEducationErrors = this.errors.education.some((x: any) => Object.keys(x).length > 0);

    return !(hasBasicErrors || hasPersonalErrors || hasEmploymentErrors || hasProjectErrors || hasEducationErrors);
  }

  async downloadPDF() {
    if (this.isTemplateLocked(this.selectedTemplate)) {
      alert(`The "${this.templates.find(t => t.id === this.selectedTemplate)?.name}" template is locked for your current subscription. Redirecting to upgrade page!`);
      this.openUpgradeLink();
      return;
    }
    if (!this.validate()) {
      alert('Please resolve validation issues highlighted in red before downloading.');
      return;
    }
    if (typeof window === 'undefined') return;
    const element = document.getElementById('preview-content');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 0,
      filename: `${this.data.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    } as const;

    html2pdf().set(opt).from(element).save();
  }

  downloadDOC() {
    if (this.isTemplateLocked(this.selectedTemplate)) {
      alert(`The "${this.templates.find(t => t.id === this.selectedTemplate)?.name}" template is locked for your current subscription. Redirecting to upgrade page!`);
      this.openUpgradeLink();
      return;
    }
    if (!this.validate()) {
      alert('Please resolve validation issues highlighted in red before downloading.');
      return;
    }
    const element = document.getElementById('preview-content');
    if (!element) return;

    const htmlContent = element.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><title>Resume</title><style>" +
      "body { font-family: Arial, sans-serif; font-size: 11pt; color: #333333; line-height: 1.4; }" +
      "h1 { font-size: 22pt; font-weight: bold; margin-bottom: 5px; color: " + (this.themeColor || '#1e3a8a') + "; }" +
      "h2 { font-size: 13pt; font-weight: bold; border-bottom: 1px solid #cccccc; padding-bottom: 3px; margin-top: 15px; margin-bottom: 8px; color: " + (this.themeColor || '#1e3a8a') + "; }" +
      "h3 { font-size: 11pt; font-weight: bold; margin-bottom: 4px; }" +
      "strong { font-weight: bold; }" +
      "p { margin: 0 0 6px 0; }" +
      "ul { margin: 0 0 8px 20px; padding: 0; }" +
      "li { margin-bottom: 3px; }" +
      "</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + sourceHTML], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.data.name.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${this.data.name.replace(/\s+/g, '_')}_Resume_Metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadTXT() {
    let text = `${this.data.name}\n`;
    if (this.data.headline) text += `${this.data.headline}\n`;
    text += `${this.data.email} | ${this.data.phone}\n`;
    if (this.data.personal.linkedin) text += `LinkedIn: ${this.data.personal.linkedin}\n`;
    if (this.data.personal.github) text += `GitHub: ${this.data.personal.github}\n\n`;

    if (this.data.summary) {
      text += `PROFESSIONAL SUMMARY\n====================\n${this.data.summary}\n\n`;
    }

    if (this.selectedSkills.length > 0) {
      text += `TECHNICAL SKILLS\n================\n${this.selectedSkills.join(', ')}\n\n`;
    }

    if (this.data.employment.length > 0) {
      text += `WORK EXPERIENCE\n===============\n`;
      this.data.employment.forEach(emp => {
        text += `${emp.role} at ${emp.company} (${emp.location})\n`;
        text += `${this.formatDate(emp.start)} - ${emp.current ? 'Present' : this.formatDate(emp.end)}\n`;
        text += `${emp.responsibilities}\n\n`;
      });
    }

    if (this.data.projects.length > 0) {
      text += `PROJECTS\n========\n`;
      this.data.projects.forEach(p => {
        text += `${p.title} - ${p.role}\n`;
        text += `Tech: ${p.tech}\n`;
        if (p.link) text += `Link: ${p.link}\n`;
        text += `${p.desc}\n\n`;
      });
    }

    if (this.data.education.length > 0) {
      text += `EDUCATION\n=========\n`;
      this.data.education.forEach(ed => {
        text += `${ed.degree} - ${ed.college} (${ed.year})\n\n`;
      });
    }

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${this.data.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getBulletPoints(text: string): string[] {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.replace(/^[•\-\*\+\>\s]+/, '').trim())
      .filter(line => line.length > 0);
  }

  /* ================= OLD RESUME TEXT PARSING LOGIC ================= */
  parseOldResumeText(text: string) {
    if (!text || text.trim().length === 0) return;

    const lines = text.split('\n').map(l => l.trim());
    let currentSection = 'contact';
    const sectionTexts: { [key: string]: string[] } = {
      contact: [],
      summary: [],
      skills: [],
      experience: [],
      projects: [],
      education: []
    };

    const summaryHeaderRegex = /^(?:(?:professional\s+)?summary|profile|about\s+me|executive\s+summary|background|summary\s+of\s+qualifications)$/i;
    const skillsHeaderRegex = /^(?:(?:key\s+)?skills|technical\s+skills|expertise|competencies|technologies|stack|core\s+strengths|areas\s+of\s+expertise)$/i;
    const experienceHeaderRegex = /^(?:(?:work\s+)?experience|employment(?:\s+history)?|professional\s+experience|work\s+history|career\s+history|career\s+path|occupational\s+history)$/i;
    const projectsHeaderRegex = /^(?:projects|featured\s+projects|personal\s+projects|academic\s+projects|creations|key\s+projects|notable\s+projects)$/i;
    const educationHeaderRegex = /^(?:education|academic\s+(?:profile|background|history)|qualifications|educational\s+background|degrees)$/i;

    const cleanHeaderLine = (line: string): string => {
      let cleaned = line.trim();
      cleaned = cleaned.replace(/^[^a-zA-Z0-9\s]+/, '').trim();
      cleaned = cleaned.replace(/^(?:(?:\d+\.)+\d*|[a-zA-Z]\.)\s+/, '').trim();
      cleaned = cleaned.replace(/[\s*_\-:]+$/, '').trim();
      return cleaned;
    };

    for (let line of lines) {
      if (!line) continue;
      const cleaned = cleanHeaderLine(line);

      if (summaryHeaderRegex.test(cleaned)) {
        currentSection = 'summary';
        this.customSectionTitles['summary'] = cleaned;
      } else if (skillsHeaderRegex.test(cleaned)) {
        currentSection = 'skills';
        this.customSectionTitles['skills'] = cleaned;
      } else if (experienceHeaderRegex.test(cleaned)) {
        currentSection = 'experience';
        this.customSectionTitles['employment'] = cleaned;
      } else if (projectsHeaderRegex.test(cleaned)) {
        currentSection = 'projects';
        this.customSectionTitles['projects'] = cleaned;
      } else if (educationHeaderRegex.test(cleaned)) {
        currentSection = 'education';
        this.customSectionTitles['education'] = cleaned;
      } else {
        sectionTexts[currentSection].push(line);
      }
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
    if (emailMatch) this.data.email = emailMatch[0];

    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/);
    if (phoneMatch) this.data.phone = phoneMatch[0];

    const contactLines = sectionTexts['contact'];
    let nameCandidate = '';
    if (contactLines.length > 0) {
      const firstLine = contactLines[0].trim();
      if (firstLine.length > 2 && firstLine.length < 40 && !firstLine.includes('@') && !firstLine.includes('http') && !/\d{5,}/.test(firstLine)) {
        nameCandidate = firstLine;
      }
    }

    if (!nameCandidate) {
      nameCandidate = contactLines.find(l =>
        l.trim().length > 2 &&
        l.trim().length < 35 &&
        !l.includes('@') &&
        !l.includes('http') &&
        !l.includes(':') &&
        !/\d/.test(l)
      ) || '';
    }

    if (nameCandidate) {
      this.data.name = nameCandidate;
      const nameIndex = contactLines.indexOf(nameCandidate);
      if (nameIndex !== -1 && contactLines.length > nameIndex + 1) {
        const headlineCandidate = contactLines[nameIndex + 1];
        if (headlineCandidate && headlineCandidate.length < 50 && !headlineCandidate.includes('@') && !headlineCandidate.includes('http')) {
          this.data.headline = headlineCandidate;
        }
      }
    }

    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch) this.data.personal.linkedin = linkedinMatch[0];

    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch) this.data.personal.github = githubMatch[0];

    const isLikelySummaryProse = (line: string): boolean => {
      const trimmed = line.trim();
      if (trimmed.length < 50) return false;
      if (trimmed.includes('|')) return false;
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/.test(trimmed)) return false;
      if (/\+?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(trimmed) || /\b\d{10}\b/.test(trimmed)) return false;
      if (/\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.(?:com|org|net|online|dev|co|in|info)\b/i.test(trimmed)) return false;
      if (/(?:experience|exp|phone|mobile|email|location|address|linkedin|github|website|portfolio|skills)\s*[:\-]/i.test(trimmed)) return false;
      if (/\bexperience\s*:\s*\d+\s*(?:years?|yrs?|months?|mos?)/i.test(trimmed)) return false;
      return true;
    };

    const validSummaryLines = sectionTexts['summary'].filter(l => isLikelySummaryProse(l));
    let summaryText = validSummaryLines.join('\n').trim();

    if (!summaryText) {
      const summaryCandidate = lines.find(l => isLikelySummaryProse(l) && l.length > 70 && l.length < 400 &&
        (l.toLowerCase().includes('experience') || l.toLowerCase().includes('developer') || l.toLowerCase().includes('motivated') || l.toLowerCase().includes('engineer'))
      );
      if (summaryCandidate) summaryText = summaryCandidate;
    }
    if (summaryText) {
      this.data.summary = summaryText;
    }

    const foundSkills: string[] = [];
    const skillsToSearch = sectionTexts['skills'].length > 0 ? sectionTexts['skills'].join(' ') : text;
    this.allSkills.forEach(s => {
      const escaped = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escaped + '\\b', 'i');
      if (regex.test(skillsToSearch)) {
        foundSkills.push(s);
      }
    });

    foundSkills.forEach(s => {
      if (!this.selectedSkills.includes(s) && this.selectedSkills.length < this.maxSkills) {
        this.selectedSkills.push(s);
      }
    });

    if (sectionTexts['experience'].length > 0) {
      const empEntries: Employment[] = [];
      const roleRegex = /(developer|engineer|analyst|manager|lead|intern|associate|consultant|specialist|officer|administrator|designer|architect|programmer|tester|specialist)/i;
      const dateYearRegex = /\b((?:19|20)\d{2})\b/;
      const monthRegexStr = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\\d{1,2})';

      const rangePresentRegex = new RegExp(
        `\\b(?:(${monthRegexStr})\\s+)?((?:19|20)\\d{2})\\s*(?:-|–|—|to)\\s*(present|current|now)\\b`,
        'i'
      );
      const rangeDoubleRegex = new RegExp(
        `\\b(?:(${monthRegexStr})\\s+)?((?:19|20)\\d{2})\\s*(?:-|–|—|to)\\s*(?:(${monthRegexStr})\\s+)?((?:19|20)\\d{2})\\b`,
        'i'
      );
      const singleDateRegex = new RegExp(
        `\\b(?:(${monthRegexStr})\\s+)?((?:19|20)\\d{2})\\b`,
        'i'
      );

      const parseSingleDate = (monthStr: string | undefined, yearStr: string): string => {
        const year = yearStr;
        let month = '01';
        if (monthStr) {
          const m = monthStr.trim().toLowerCase();
          if (m.startsWith('jan')) month = '01';
          else if (m.startsWith('feb')) month = '02';
          else if (m.startsWith('mar')) month = '03';
          else if (m.startsWith('apr')) month = '04';
          else if (m.startsWith('may')) month = '05';
          else if (m.startsWith('jun')) month = '06';
          else if (m.startsWith('jul')) month = '07';
          else if (m.startsWith('aug')) month = '08';
          else if (m.startsWith('sep')) month = '09';
          else if (m.startsWith('oct')) month = '10';
          else if (m.startsWith('nov')) month = '11';
          else if (m.startsWith('dec')) month = '12';
          else {
            const num = parseInt(m, 10);
            if (num >= 1 && num <= 12) {
              month = num.toString().padStart(2, '0');
            }
          }
        }
        return `${year}-${month}-01`;
      };

      const isBulletOrResponsibility = (line: string): boolean => {
        const trimmed = line.trim();
        if (/^[•\-\*\+\>\s]/.test(trimmed)) return true;
        if (/^[a-z]/.test(trimmed)) return true;
        if (trimmed.length > 80) return true;
        return false;
      };

      const blocks: { headers: string[], bullets: string[] }[] = [];
      let currentBlock: { headers: string[], bullets: string[] } | null = null;

      for (let line of sectionTexts['experience']) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isBullet = isBulletOrResponsibility(trimmed);
        let startsNewBlock = false;
        if (!isBullet) {
          if (!currentBlock) {
            startsNewBlock = true;
          } else {
            if (currentBlock.bullets.length > 0) {
              startsNewBlock = true;
            } else {
              const hasRole = roleRegex.test(trimmed);
              const hasDate = dateYearRegex.test(trimmed) || /present|current/i.test(trimmed);
              const currentHasRole = currentBlock.headers.some(h => roleRegex.test(h));
              const currentHasDate = currentBlock.headers.some(h => dateYearRegex.test(h) || /present|current/i.test(h));

              if ((hasRole && currentHasRole) || (hasDate && currentHasDate)) {
                startsNewBlock = true;
              }
            }
          }
        }

        if (startsNewBlock) {
          currentBlock = { headers: [trimmed], bullets: [] };
          blocks.push(currentBlock);
        } else {
          if (currentBlock) {
            if (isBullet) {
              currentBlock.bullets.push(trimmed);
            } else {
              currentBlock.headers.push(trimmed);
            }
          } else {
            currentBlock = { headers: [], bullets: [trimmed] };
            blocks.push(currentBlock);
          }
        }
      }

      for (let block of blocks) {
        let headers = [...block.headers];
        let start = '';
        let end = '';
        let current = false;
        let location = '';

        for (let j = 0; j < headers.length; j++) {
          const h = headers[j];
          const matchPresent = h.match(rangePresentRegex);
          if (matchPresent) {
            start = parseSingleDate(matchPresent[1], matchPresent[2]);
            current = true;
            headers[j] = h.replace(matchPresent[0], '').trim();
            continue;
          }
          const matchDouble = h.match(rangeDoubleRegex);
          if (matchDouble) {
            start = parseSingleDate(matchDouble[1], matchDouble[2]);
            end = parseSingleDate(matchDouble[3], matchDouble[4]);
            headers[j] = h.replace(matchDouble[0], '').trim();
            continue;
          }
          const matchSingle = h.match(singleDateRegex);
          if (matchSingle) {
            start = parseSingleDate(matchSingle[1], matchSingle[2]);
            headers[j] = h.replace(matchSingle[0], '').trim();
            continue;
          }
        }

        headers = headers.map(h => h.replace(/\s*\(\s*\)/g, '').trim()).filter(h => h.length > 0);

        for (let j = 0; j < headers.length; j++) {
          const h = headers[j];
          const parenMatch = h.match(/\(([^)]+)\)/);
          if (parenMatch) {
            location = parenMatch[1].trim();
            headers[j] = h.replace(parenMatch[0], '').trim();
            break;
          }
        }

        if (!location) {
          for (let j = 0; j < headers.length; j++) {
            const h = headers[j];
            const locPrefixMatch = h.match(/location\s*:\s*([^,]+(?:,\s*[^,]+)?)/i);
            if (locPrefixMatch) {
              location = locPrefixMatch[1].trim();
              headers[j] = h.replace(locPrefixMatch[0], '').trim();
              break;
            }
          }
        }

        headers = headers.map(h => h.trim()).filter(h => h.length > 0);

        let role = '';
        let company = '';
        let roleLineIndex = -1;
        for (let j = 0; j < headers.length; j++) {
          if (roleRegex.test(headers[j])) {
            roleLineIndex = j;
            break;
          }
        }

        if (roleLineIndex !== -1) {
          const line = headers[roleLineIndex];
          const parts = line.split(/\s*(?:\||@| at | - )\s*/i).map(p => p.trim()).filter(p => p.length > 0);

          if (parts.length >= 2) {
            const rIdx = parts.findIndex(p => roleRegex.test(p));
            if (rIdx !== -1) {
              role = parts[rIdx];
              company = parts.filter((_, idx) => idx !== rIdx).join(', ');
            } else {
              role = parts[0];
              company = parts.slice(1).join(', ');
            }
          } else {
            role = line;
            const otherLines = headers.filter((_, idx) => idx !== roleLineIndex);
            if (otherLines.length > 0) {
              const companyLine = otherLines[0];
              const commaParts = companyLine.split(',').map(p => p.trim()).filter(p => p.length > 0);
              if (commaParts.length >= 2) {
                company = commaParts[0];
                if (!location) location = commaParts.slice(1).join(', ');
              } else {
                company = companyLine;
              }
              if (otherLines.length >= 2 && !location) {
                location = otherLines[1];
              }
            }
          }
        } else {
          if (headers.length >= 1) {
            role = headers[0];
          }
          if (headers.length >= 2) {
            const companyLine = headers[1];
            const commaParts = companyLine.split(',').map(p => p.trim()).filter(p => p.length > 0);
            if (commaParts.length >= 2) {
              company = commaParts[0];
              if (!location) location = commaParts.slice(1).join(', ');
            } else {
              company = companyLine;
            }
          }
          if (headers.length >= 3 && !location) {
            location = headers[2];
          }
        }

        role = role.replace(/^[\s,\-|()]+|[\s,\-|()]+$/g, '').trim();
        company = company.replace(/^[\s,\-|()]+|[\s,\-|()]+$/g, '').trim();

        const bulletLines = block.bullets.map(b => b.replace(/^[•\-\*\+\>\s\d\.\)]+/g, '').trim()).filter(b => b.length > 0);
        const responsibilities = bulletLines.join('\n');

        if (role || company || responsibilities) {
          empEntries.push({
            company: company || 'Company Name',
            role: role || 'Designated Role',
            location: location || 'Location',
            start: start || '',
            end: end || '',
            current: current,
            responsibilities: responsibilities || ''
          });
        }
      }

      if (empEntries.length > 0) {
        this.data.employment = empEntries;
      }
    }

    if (sectionTexts['projects'].length > 0) {
      const projEntries: Project[] = [];
      let currentProj: Project | null = null;

      for (let line of sectionTexts['projects']) {
        const isNewProject = line.length < 50 && (line.includes('|') || line.includes(':') || line.includes('http') || /^[A-Z][A-Za-z0-9\s]{3,25}$/.test(line));

        if (isNewProject && currentProj && currentProj.title) {
          projEntries.push(currentProj);
          currentProj = null;
        }

        if (!currentProj) {
          currentProj = {
            title: line.split(/[:|]/)[0].trim(),
            tech: '',
            role: 'Developer',
            link: '',
            desc: ''
          };

          const urlMatch = line.match(/https?:\/\/[^\s]+/);
          if (urlMatch) currentProj.link = urlMatch[0];

          if (line.includes(':')) {
            currentProj.tech = line.split(':')[1].replace(currentProj.link, '').trim();
          } else if (line.includes('|')) {
            currentProj.tech = line.split('|')[1].replace(currentProj.link, '').trim();
          }
        } else {
          currentProj.desc += (currentProj.desc ? ' ' : '') + line;
        }
      }
      if (currentProj && currentProj.title) {
        projEntries.push(currentProj);
      }
      if (projEntries.length > 0) {
        this.data.projects = projEntries;
      }
    }

    if (sectionTexts['education'].length > 0) {
      const eduEntries: Education[] = [];
      const degreeRegex = /(B\.Tech|B\.E\.|B\.Sc|B\.S\.|B\.A\.|M\.Tech|M\.Sc|M\.S\.|MBA|MCA|BCA|Bachelor|Master|Ph\.D|Diploma|High\s+School|Intermediate|SSC)/i;
      const yearRegex = /\b(19|20)\d{2}\b/;

      for (let line of sectionTexts['education']) {
        const degreeMatch = line.match(degreeRegex);
        if (degreeMatch) {
          const degree = degreeMatch[0];
          const yearMatch = line.match(yearRegex);
          const year = yearMatch ? yearMatch[0] : '';
          let college = line.replace(degree, '').replace(year, '').replace(/[\s,\-|()]+/g, ' ').trim();
          if (!college || college.length < 5) {
            college = 'University / School';
          }
          eduEntries.push({ degree, college, year });
        }
      }
      if (eduEntries.length > 0) {
        this.data.education = eduEntries;
      }
    }



    const extracted: string[] = [];
    const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    sentences.forEach(s => {
      const hasPercent = s.includes('%');
      const hasNumber = /\b\d{2,}\b/.test(s);
      const hasActionVerb = /\b(optimized|launched|developed|implemented|increased|reduced|managed|led|saved|improved|designed|engineered|spearheaded|architected)\b/i.test(s);
      if ((hasPercent || hasNumber) && hasActionVerb && extracted.length < 10) {
        if (!extracted.includes(s)) {
          extracted.push(s);
        }
      }
    });
    this.highlights = extracted;
    this.selectedHighlights = {};
    extracted.forEach(h => {
      this.selectedHighlights[h] = true;
    });

    this.updateScore();
  }

  set highlights(val: string[]) {
    // Keep highlights setter
  }

  get highlights(): string[] {
    return Object.keys(this.selectedHighlights);
  }

  onOldResumePaste() {
    this.clearForm();
    setTimeout(() => {
      this.zone.run(() => {
        if (this.oldResumeText && this.oldResumeText.trim().length > 0) {
          this.parseOldResumeText(this.oldResumeText);
          if (this.jobDescriptionText && this.jobDescriptionText.trim().length > 0) {
            this.scanJdAndResume();
          }
        }
      });
    }, 100);
  }

  async extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
      const win = window as any;
      if (!win.pdfjsLib) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
      }
      const pdfjsLib = win.pdfjsLib;

      try {
        const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        const response = await fetch(workerUrl);
        const workerCode = await response.text();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch (workerErr) {
        console.warn('Could not load standalone Blob worker, trying fallback:', workerErr);
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      let lastY: number | null = null;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = (textContent.items || []) as any[];

        const validItems = items.filter(item => item && item.str !== undefined && item.transform && typeof item.transform.length === 'number' && item.transform.length >= 6);
        validItems.sort((a, b) => {
          const yA = a.transform[5];
          const yB = b.transform[5];
          if (Math.abs(yA - yB) > 3) {
            return yB - yA;
          }
          return a.transform[4] - b.transform[4];
        });

        let pageText = '';
        validItems.forEach((item) => {
          const y = item.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 3) {
            pageText += '\n';
          } else if (lastY !== null) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = y;
        });

        fullText += pageText + '\n';
        lastY = null;
      }
      return fullText;
    } catch (e) {
      console.error('PDF parsing error:', e);
      throw new Error('Could not parse PDF file.');
    }
  }

  async extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
      const win = window as any;
      if (!win.mammoth) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
      }
      const mammoth = win.mammoth;
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value || '';
    } catch (e) {
      console.error('Docx parsing error:', e);
      throw new Error('Could not parse Word (.docx) file.');
    }
  }

  async extractTextFromOdt(arrayBuffer: ArrayBuffer): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
      const win = window as any;
      if (!win.JSZip) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }
      const JSZip = win.JSZip;
      const zip = await JSZip.loadAsync(arrayBuffer);
      const contentXmlFile = zip.file('content.xml');
      if (!contentXmlFile) {
        throw new Error('Invalid ODF/ODT file: content.xml not found.');
      }
      const xmlText = await contentXmlFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const textNode = xmlDoc.getElementsByTagName('office:text')[0] ||
        xmlDoc.getElementsByTagNameNS('*', 'text')[0] ||
        xmlDoc.querySelector('text');

      const root = textNode || xmlDoc.documentElement;

      const paragraphs: string[] = [];
      const extractFromNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          const tagName = el.localName || el.tagName || '';
          const tag = tagName.toLowerCase();

          if (tag === 'p' || tag === 'h' || tag === 'text:p' || tag === 'text:h') {
            const txt = el.textContent || '';
            paragraphs.push(txt.trim());
          } else {
            for (let i = 0; i < node.childNodes.length; i++) {
              extractFromNode(node.childNodes[i]);
            }
          }
        }
      };

      extractFromNode(root);
      return paragraphs.join('\n').trim();
    } catch (e) {
      console.error('ODT/ODF parsing error:', e);
      throw new Error('Could not parse ODT/ODF file.');
    }
  }

  extractTextFromDoc(arrayBuffer: ArrayBuffer): string {
    const uint8 = new Uint8Array(arrayBuffer);
    let result = '';
    for (let i = 0; i < uint8.length; i++) {
      const charCode = uint8[i];
      if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
        result += String.fromCharCode(charCode);
      } else {
        if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
          result += ' ';
        }
      }
    }
    return result
      .replace(/[ \t]+/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      this.document.body.appendChild(script);
    });
  }

  async onOldResumeUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isParsing = true;
    this.uploadedFileName = file.name;
    const fileName = file.name.toLowerCase();
    this.clearForm();

    this.uploadedFileName = file.name;

    try {
      let text = '';
      if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.extractTextFromPdf(arrayBuffer);
      } else if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.extractTextFromDocx(arrayBuffer);
      } else if (fileName.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        text = this.extractTextFromDoc(arrayBuffer);
      } else if (fileName.endsWith('.odt') || fileName.endsWith('.odf')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.extractTextFromOdt(arrayBuffer);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          this.zone.run(() => {
            if (typeof reader.result === 'string') {
              this.oldResumeText = reader.result;
              if (fileName.endsWith('.json')) {
                try {
                  const parsed = JSON.parse(reader.result);
                  if (parsed && typeof parsed === 'object') {
                    this.data = { ...this.data, ...parsed };
                    this.updateScore();
                    this.isParsing = false;
                    this.previewMode = 'template';
                    if (this.jobDescriptionText && this.jobDescriptionText.trim().length > 0) {
                      this.scanJdAndResume();
                    }
                  }
                } catch (e) {
                  this.isParsing = false;
                  alert('Invalid JSON metadata format. Please upload a valid exported JSON file.');
                }
              } else {
                this.parseOldResumeText(reader.result);
                this.isParsing = false;
                this.previewMode = 'template';
                if (this.jobDescriptionText && this.jobDescriptionText.trim().length > 0) {
                  this.scanJdAndResume();
                }
              }
            }
          });
        };
        reader.readAsText(file);
        return;
      }

      this.zone.run(() => {
        this.oldResumeText = text;
        this.parseOldResumeText(text);
        this.isParsing = false;
        this.previewMode = 'template';
        if (this.jobDescriptionText && this.jobDescriptionText.trim().length > 0) {
          this.scanJdAndResume();
        }
      });
    } catch (err: any) {
      this.zone.run(() => {
        this.isParsing = false;
        this.uploadedFileName = '';
        alert(err.message || 'Error parsing the document. Please ensure it is not corrupt.');
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.data.photo = e.target.result as string;
        this.updateScore();
      };
      reader.readAsDataURL(file);
    }
  }

  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const mockEvent = { target: { files: [file] } };
      this.onOldResumeUpload(mockEvent);
    }
  }

  syncPreviewTextToModel(originalText: string, newText: string) {
    const oldVal = originalText.trim();
    const newVal = newText.trim();
    if (!oldVal || oldVal === newVal) return;

    this.zone.run(() => {
      // 1. Basic Info
      if (this.data.name === oldVal) this.data.name = newVal;
      if (this.data.headline === oldVal) this.data.headline = newVal;
      if (this.data.summary === oldVal) this.data.summary = newVal;
      if (this.data.email === oldVal) this.data.email = newVal;
      if (this.data.phone === oldVal) this.data.phone = newVal;

      // 2. Skills
      const skillIndex = this.selectedSkills.indexOf(oldVal);
      if (skillIndex !== -1) {
        this.selectedSkills[skillIndex] = newVal;
      }

      // 3. Employment
      this.data.employment.forEach(emp => {
        if (emp.company === oldVal) emp.company = newVal;
        if (emp.role === oldVal) emp.role = newVal;
        if (emp.location === oldVal) emp.location = newVal;
        if (emp.responsibilities) {
          const lines = emp.responsibilities.split('\n');
          const lineIndex = lines.map(l => l.replace(/^[•\-\*\+\>\s]+/, '').trim()).indexOf(oldVal);
          if (lineIndex !== -1) {
            const matchPrefix = lines[lineIndex].match(/^[•\-\*\+\>\s]+/);
            const prefix = matchPrefix ? matchPrefix[0] : '';
            lines[lineIndex] = prefix + newVal;
            emp.responsibilities = lines.join('\n');
          }
        }
      });

      // 4. Projects
      this.data.projects.forEach(p => {
        if (p.title === oldVal) p.title = newVal;
        if (p.role === oldVal) p.role = newVal;
        if (p.tech === oldVal) p.tech = newVal;
        if (p.desc === oldVal) p.desc = newVal;
      });

      // 5. Education
      this.data.education.forEach(ed => {
        if (ed.degree === oldVal) ed.degree = newVal;
        if (ed.college === oldVal) ed.college = newVal;
        if (ed.year === oldVal) ed.year = newVal;
      });


      // 7. Personal
      if (this.data.personal) {
        if (this.data.personal.linkedin === oldVal) this.data.personal.linkedin = newVal;
        if (this.data.personal.github === oldVal) this.data.personal.github = newVal;
      }

      // 8. Certifications
      if (this.data.certifications) {
        this.data.certifications.forEach(cert => {
          if (cert.name === oldVal) cert.name = newVal;
          if (cert.issuer === oldVal) cert.issuer = newVal;
        });
      }

      // 9. Achievements
      if (this.data.achievements) {
        this.data.achievements.forEach(ach => {
          if (ach.title === oldVal) ach.title = newVal;
          if (ach.issuer === oldVal) ach.issuer = newVal;
          if (ach.desc === oldVal) ach.desc = newVal;
        });
      }

      // 10. Publications
      if (this.data.publications) {
        this.data.publications.forEach(pub => {
          if (pub.title === oldVal) pub.title = newVal;
          if (pub.publisher === oldVal) pub.publisher = newVal;
          if (pub.desc === oldVal) pub.desc = newVal;
        });
      }

      // 11. Custom Sections
      if (this.data.customSections) {
        this.data.customSections.forEach(sec => {
          if (sec.title === oldVal) sec.title = newVal;
          if (sec.items) {
            sec.items.forEach(item => {
              if (item.title === oldVal) item.title = newVal;
              if (item.subtitle === oldVal) item.subtitle = newVal;
              if (item.desc === oldVal) item.desc = newVal;
            });
          }
        });
      }

      this.updateScore();
    });
  }

  onSkillInput() {
    this.filteredSkills = this.allSkills.filter(
      (s) =>
        s.toLowerCase().includes(this.skillInput.toLowerCase()) && !this.selectedSkills.includes(s),
    );
  }

  addSkill(skill: string) {
    if (this.selectedSkills.length >= this.maxSkills) {
      alert('Maximum of 25 skills allowed.');
      return;
    }
    const trimmed = skill.trim();
    if (trimmed && !this.selectedSkills.includes(trimmed)) {
      this.selectedSkills.push(trimmed);
      this.skillInput = '';
      this.filteredSkills = [];
      this.updateScore();
    }
  }

  removeSkill(i: number) {
    this.selectedSkills.splice(i, 1);
    this.updateScore();
  }

  showAuthGateModal = false;

  saveResume() {
    if (typeof window === 'undefined') return;
    const state = {
      data: this.data,
      selectedSkills: this.selectedSkills,
      selectedLanguages: this.selectedLanguages,
      themeColor: this.themeColor,
      selectedTemplate: this.selectedTemplate,
      headingFont: this.headingFont,
      bodyFont: this.bodyFont,
      headingSize: this.headingSize,
      bodySize: this.bodySize,
      lineSpacing: this.lineSpacing,
      sectionSpacing: this.sectionSpacing,
      pageMargin: this.pageMargin,
      headingStyle: this.headingStyle,
      subheadingStyle: this.subheadingStyle,
      dividerStyle: this.dividerStyle,
      bulletStyle: this.bulletStyle,
      dateFormat: this.dateFormat,
      skillsStyle: this.skillsStyle,
      headerLayout: this.headerLayout,
      selectedHighlights: this.selectedHighlights
    };
    localStorage.setItem('vt_saved_resume', JSON.stringify(state));
  }

  loadSavedResume() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('vt_saved_resume');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          this.data = { ...this.data, ...parsed.data };
        }
        if (parsed.selectedSkills) this.selectedSkills = parsed.selectedSkills;
        if (parsed.selectedLanguages) this.selectedLanguages = parsed.selectedLanguages;
        if (parsed.themeColor) this.themeColor = parsed.themeColor;
        if (parsed.selectedTemplate) this.selectedTemplate = parsed.selectedTemplate;
        if (parsed.headingFont) this.headingFont = parsed.headingFont;
        if (parsed.bodyFont) this.bodyFont = parsed.bodyFont;
        if (parsed.headingSize) this.headingSize = parsed.headingSize;
        if (parsed.bodySize) this.bodySize = parsed.bodySize;
        if (parsed.lineSpacing) this.lineSpacing = parsed.lineSpacing;
        if (parsed.sectionSpacing) this.sectionSpacing = parsed.sectionSpacing;
        if (parsed.pageMargin) this.pageMargin = parsed.pageMargin;
        if (parsed.headingStyle) this.headingStyle = parsed.headingStyle;
        if (parsed.subheadingStyle) this.subheadingStyle = parsed.subheadingStyle;
        if (parsed.dividerStyle) this.dividerStyle = parsed.dividerStyle;
        if (parsed.bulletStyle) this.bulletStyle = parsed.bulletStyle;
        if (parsed.dateFormat) this.dateFormat = parsed.dateFormat;
        if (parsed.skillsStyle) this.skillsStyle = parsed.skillsStyle;
        if (parsed.headerLayout) this.headerLayout = parsed.headerLayout;
        if (parsed.selectedHighlights) this.selectedHighlights = parsed.selectedHighlights;

        this.updateScore();
      } catch (e) {
        console.error('Failed to load saved resume state', e);
      }
    } else {
      this.loadSampleData();
    }
  }

  saveAndDownload() {
    if (!this.validate()) {
      alert('Please resolve validation issues highlighted in red before saving.');
      return;
    }

    if (this.authService.isLoggedIn()) {
      this.saveResume();
      this.downloadPDF();
    } else {
      const state = {
        data: this.data,
        selectedSkills: this.selectedSkills,
        selectedLanguages: this.selectedLanguages,
        themeColor: this.themeColor,
        selectedTemplate: this.selectedTemplate,
        headingFont: this.headingFont,
        bodyFont: this.bodyFont,
        headingSize: this.headingSize,
        bodySize: this.bodySize,
        lineSpacing: this.lineSpacing,
        sectionSpacing: this.sectionSpacing,
        pageMargin: this.pageMargin,
        headingStyle: this.headingStyle,
        subheadingStyle: this.subheadingStyle,
        dividerStyle: this.dividerStyle,
        bulletStyle: this.bulletStyle,
        dateFormat: this.dateFormat,
        skillsStyle: this.skillsStyle,
        headerLayout: this.headerLayout,
        selectedHighlights: this.selectedHighlights
      };
      localStorage.setItem('unsaved_resume_data', JSON.stringify(state));
      this.showAuthGateModal = true;
    }
  }
}
