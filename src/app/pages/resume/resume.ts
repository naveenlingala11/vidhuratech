import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnInit, inject, HostListener, ChangeDetectorRef, DoCheck, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ResumeService, Employment, Project, Education, Reference } from '../../services/resume.service';
import { ResumePreview } from '../../components/resume-preview/resume-preview';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResumePreview],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume implements OnInit, DoCheck, OnDestroy {
  public service = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  // Getter/Setter Delegations to the Shared Service
  get activeTab() { return this.service.activeTab; }
  set activeTab(val) { this.service.activeTab = val; }

  get activeSection() { return this.service.activeSection; }
  set activeSection(val) { this.service.activeSection = val; }

  get selectedTemplate() { return this.service.selectedTemplate; }
  set selectedTemplate(val) { this.service.selectedTemplate = val; }

  get dragIndex() { return this.service.dragIndex; }
  set dragIndex(val) { this.service.dragIndex = val; }

  get profileScore() { return this.service.profileScore; }
  set profileScore(val) { this.service.profileScore = val; }

  get userPlan() { return this.service.userPlan; }
  set userPlan(val) { this.service.userPlan = val; }

  get activeTemplateGroup() { return this.service.activeTemplateGroup; }
  set activeTemplateGroup(val) { this.service.activeTemplateGroup = val; }

  get showChecklistDrawer() { return this.service.showChecklistDrawer; }
  set showChecklistDrawer(val) { this.service.showChecklistDrawer = val; }

  get filterHeadshot() { return this.service.filterHeadshot; }
  set filterHeadshot(val) { this.service.filterHeadshot = val; }

  get filterGraphics() { return this.service.filterGraphics; }
  set filterGraphics(val) { this.service.filterGraphics = val; }

  get filterColumns() { return this.service.filterColumns; }
  set filterColumns(val) { this.service.filterColumns = val; }

  get headingStyle() { return this.service.headingStyle; }
  set headingStyle(val) { this.service.headingStyle = val; }

  get subheadingStyle() { return this.service.subheadingStyle; }
  set subheadingStyle(val) { this.service.subheadingStyle = val; }

  get highlightStyle() { return this.service.highlightStyle; }
  set highlightStyle(val) { this.service.highlightStyle = val; }

  get dividerStyle() { return this.service.dividerStyle; }
  set dividerStyle(val) { this.service.dividerStyle = val; }

  get bulletStyle() { return this.service.bulletStyle; }
  set bulletStyle(val) { this.service.bulletStyle = val; }

  get dateFormat() { return this.service.dateFormat; }
  set dateFormat(val) { this.service.dateFormat = val; }

  get skillsStyle() { return this.service.skillsStyle; }
  set skillsStyle(val) { this.service.skillsStyle = val; }

  get headerLayout() { return this.service.headerLayout; }
  set headerLayout(val) { this.service.headerLayout = val; }

  get selectedHighlights() { return this.service.selectedHighlights; }
  set selectedHighlights(val) { this.service.selectedHighlights = val; }

  get showKeywordModal() { return this.service.showKeywordModal; }
  set showKeywordModal(val) { this.service.showKeywordModal = val; }

  get showTemplateDropdown() { return this.service.showTemplateDropdown; }
  set showTemplateDropdown(val) { this.service.showTemplateDropdown = val; }

  get previewMode() { return this.service.previewMode; }
  set previewMode(val) { this.service.previewMode = val; }

  get expandedItems() { return this.service.expandedItems; }
  set expandedItems(val) { this.service.expandedItems = val; }

  get activeKeyword() { return this.service.activeKeyword; }
  set activeKeyword(val) { this.service.activeKeyword = val; }

  get keywordFormats() { return this.service.keywordFormats; }
  set keywordFormats(val) { this.service.keywordFormats = val; }

  get themeColor() { return this.service.themeColor; }
  set themeColor(val) { this.service.themeColor = val; }

  get headingFont() { return this.service.headingFont; }
  set headingFont(val) { this.service.headingFont = val; }

  get bodyFont() { return this.service.bodyFont; }
  set bodyFont(val) { this.service.bodyFont = val; }

  get headingSize() { return this.service.headingSize; }
  set headingSize(val) { this.service.headingSize = val; }

  get bodySize() { return this.service.bodySize; }
  set bodySize(val) { this.service.bodySize = val; }

  get lineSpacing() { return this.service.lineSpacing; }
  set lineSpacing(val) { this.service.lineSpacing = val; }

  get sectionSpacing() { return this.service.sectionSpacing; }
  set sectionSpacing(val) { this.service.sectionSpacing = val; }

  get pageMargin() { return this.service.pageMargin; }
  set pageMargin(val) { this.service.pageMargin = val; }

  get customSectionTitles() { return this.service.customSectionTitles; }
  set customSectionTitles(val) { this.service.customSectionTitles = val; }

  get selectedSkills() { return this.service.selectedSkills; }
  set selectedSkills(val) { this.service.selectedSkills = val; }

  get selectedLanguages() { return this.service.selectedLanguages; }
  set selectedLanguages(val) { this.service.selectedLanguages = val; }

  get skillInput() { return this.service.skillInput; }
  set skillInput(val) { this.service.skillInput = val; }

  get filteredSkills() { return this.service.filteredSkills; }
  set filteredSkills(val) { this.service.filteredSkills = val; }

  get aiRole() { return this.service.aiRole; }
  set aiRole(val) { this.service.aiRole = val; }

  get aiExperience() { return this.service.aiExperience; }
  set aiExperience(val) { this.service.aiExperience = val; }

  get targetRole() { return this.service.targetRole; }
  set targetRole(val) { this.service.targetRole = val; }

  get scoreChecklist() { return this.service.scoreChecklist; }
  set scoreChecklist(val) { this.service.scoreChecklist = val; }

  get errors() { return this.service.errors; }
  set errors(val) { this.service.errors = val; }

  get data() { return this.service.data; }
  set data(val) { this.service.data = val; }

  get oldResumeText() { return this.service.oldResumeText; }
  set oldResumeText(val) { this.service.oldResumeText = val; }

  get zoomLevel() { return this.service.zoomLevel; }
  set zoomLevel(val) { this.service.zoomLevel = val; }

  get templateHeight() { return this.service.templateHeight; }
  set templateHeight(val) { this.service.templateHeight = val; }

  get showDownloadDropdown() { return this.service.showDownloadDropdown; }
  set showDownloadDropdown(val) { this.service.showDownloadDropdown = val; }

  get highlights() { return this.service.highlights; }
  get customCssOverride() { return this.service.customCssOverride; }
  set customCssOverride(val) { this.service.customCssOverride = val; }
  get customizerFilteredTemplates() { return this.service.customizerFilteredTemplates; }
  get allLanguages() { return this.service.allLanguages; }

  // Constant & Data Lists exposed for template accessibility
  get templates() { return this.service.templates; }
  get sections() { return this.service.sections; }
  get availableRoles() { return this.service.availableRoles; }
  get roleKeywords() { return this.service.roleKeywords; }
  get filteredTemplates() { return this.service.filteredTemplates; }
  get colorPresets() { return this.service.colorPresets; }
  get fontPresets() { return this.service.fontPresets; }

  // Section Guidelines
  sectionGuidelines: any = {
    contact: {
      title: 'Contact Info Tips',
      tips: [
        'Use a professional email address containing your name.',
        'Ensure your phone number is correct and includes country code if applicable.',
        'Add customized URLs like LinkedIn or GitHub to show active professional presence.'
      ]
    },
    summary: {
      title: 'Profile Summary Tips',
      tips: [
        'Keep it short: 3-5 sentences summarizing key experience and expertise.',
        'Incorporate high-value keywords related to your target job profile.',
        'Avoid empty buzzwords. Focus on tangible strengths.'
      ]
    },
    skills: {
      title: 'Technical Skills Tips',
      tips: [
        'List core technologies, libraries, and frameworks you know well.',
        'Add related domain concepts (e.g. REST APIs, Microservices).',
        'Limit to 15-20 key qualifications to avoid cluttering the document.'
      ]
    },
    employment: {
      title: 'Work Experience Tips',
      tips: [
        'List experience in reverse chronological order.',
        'Use bullet points starting with strong action verbs (Developed, Optimized, Led).',
        'Quantify results wherever possible (e.g. improved speed by 25%).'
      ]
    },
    projects: {
      title: 'Projects Tips',
      tips: [
        'Describe real-world projects showing key capabilities.',
        'List the specific technologies used for building the project.',
        'Explain the problem solved, your role, and the final outcome.'
      ]
    },
    education: {
      title: 'Education Tips',
      tips: [
        'Mention your highest degree first.',
        'State graduation year clearly and provide correct university names.',
        'Optional: Mention major achievements or GPA if above 3.5.'
      ]
    },
    personal: {
      title: 'Personal Details Tips',
      tips: [
        'Only add address/DOB details if requested by specific region standards.',
        'Specify languages known to showcase multicultural capabilities.'
      ]
    }
  };

  // Guide accordion state
  guideExpandedSection: string = 'contact';

  guideSections = [
    {
      id: 'contact',
      icon: 'fa-address-card',
      title: 'Contact Details Optimization',
      tips: [
        'Use a professional email (first.last@domain.com).',
        'Provide a clean phone number with country code.',
        'Add updated LinkedIn and GitHub links to demonstrate active portfolio presence.'
      ],
      do: 'Do include your city and state (e.g. Bangalore, India). It passes location filters.',
      dont: 'Do not list full physical street addresses, date of birth, or photo unless required, to avoid bias.',
      example: 'John Doe\njohn.doe@email.com | +91 9999999999 | Bangalore, KA\nlinkedin.com/in/johndoe | github.com/johndoe'
    },
    {
      id: 'summary',
      icon: 'fa-user-tie',
      title: 'Profile Summary Construction',
      tips: [
        'Keep it short: 3-5 sentences maximum.',
        'Include your exact target job title.',
        'Mention years of experience and top 3 technical expertise areas.'
      ],
      do: 'Do start with strong adjectives and include quantitative metrics (e.g. "2+ years experience").',
      dont: 'Do not use first-person pronouns ("I", "me", "my"). Write in professional third-person passive voice.',
      example: 'Results-driven Full Stack Developer with 3+ years of experience designing scalable REST APIs and responsive web interfaces. Proven track record of improving application latency by 20% using Angular and Spring Boot.'
    },
    {
      id: 'experience',
      icon: 'fa-briefcase',
      title: 'Work History Accomplishments',
      tips: [
        'List experience in reverse-chronological order.',
        'Start every single bullet point with a strong action verb.',
        'Use the XYZ formula: Accomplished [X], measured by [Y], by doing [Z].'
      ],
      do: 'Do quantify results. Use percentages, time savings, or revenue numbers to make bullets stand out.',
      dont: 'Do not write a list of daily responsibilities. Focus on outcomes and impact, not tasks.',
      example: '• Spearheaded refactoring of legacy search modules, reducing load latencies by 35% using Redis caching.\n• Led a team of 3 developers to deliver a new client dashboard, onboarding 10K+ users within 2 months.'
    },
    {
      id: 'skills',
      icon: 'fa-screwdriver-wrench',
      title: 'Key Skills & Keyword Integration',
      tips: [
        'Distribute skills naturally throughout the resume.',
        'Match exact spelling of technical terms used in the Job Description.',
        'Group skills logically (Languages, Frameworks, Databases, Tools).'
      ],
      do: 'Do categorize your skills into clear sections to help both human recruiters and parsers read them.',
      dont: 'Do not list technologies you only used once or twice. Keep it relevant to the target role.',
      example: 'Languages: Java, TypeScript, SQL\nFrameworks: Angular 18, Spring Boot, Node.js\nDatabases: PostgreSQL, MongoDB, Redis\nTools & DevOps: Git, Docker, AWS, Jenkins'
    }
  ];

  // AI Phrase Suggestions per section
  summaryPhrases: string[] = [
    'Passionate {role} with {exp} years of hands-on experience in building scalable applications.',
    'Results-driven engineer specializing in {role} development with proven expertise in agile environments.',
    'Detail-oriented professional skilled in designing, developing, and deploying production-grade solutions.'
  ];
  actionVerbStarters: string[] = [
    'Developed', 'Architected', 'Optimized', 'Led', 'Implemented', 'Designed', 'Deployed',
    'Integrated', 'Refactored', 'Automated', 'Streamlined', 'Spearheaded', 'Mentored', 'Delivered'
  ];
  projectDescPhrases: string[] = [
    'Built a full-stack web application using {tech} with RESTful APIs and responsive UI.',
    'Designed and deployed a microservices architecture handling 10K+ concurrent requests.',
    'Created an interactive dashboard with real-time data visualization and chart analytics.'
  ];
  educationPhrases: string[] = [
    'Dean\'s List recipient for academic excellence',
    'Published research paper on {topic}',
    'Led a team of {n} students in capstone project'
  ];

  selectedSuggestRole: string = 'software-engineer';

  suggestedHeadlines: { [key: string]: string[] } = {
    'software-engineer': [
      'Senior Software Engineer | Full Stack Specialist',
      'Software Development Engineer (SDE-II) | Java & Angular',
      'Full Stack Developer | Spring Boot, Angular, PostgreSQL'
    ],
    'data-analyst': [
      'Data Analyst | SQL, Python & Tableau specialist',
      'Business Intelligence Analyst | Data Visualization Developer',
      'Data Scientist & Analytics Specialist | Machine Learning, Pandas'
    ],
    'product-manager': [
      'Agile Product Manager | Product Growth Leader',
      'Technical Product Manager | SaaS & Cloud specialist',
      'Product Owner | User Experience & Roadmap Strategy'
    ],
    'qa-engineer': [
      'Software Development Engineer in Test (SDET)',
      'Lead QA Automation Engineer | Cypress, Selenium, Java',
      'Quality Assurance Engineer | API & Integration Testing'
    ]
  };

  suggestedSkills: { [key: string]: string[] } = {
    'software-engineer': ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'JavaScript', 'SQL', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'HTML5 & CSS3', 'Node.js'],
    'data-analyst': ['Python', 'SQL', 'Tableau', 'Power BI', 'Excel VBA', 'Pandas & NumPy', 'Data Warehousing', 'ETL Pipelines', 'Statistics', 'R Programming', 'Data Visualization'],
    'product-manager': ['Product Roadmap', 'Agile / Scrum', 'JIRA', 'Product Strategy', 'User Research', 'A/B Testing', 'Customer Discovery', 'Market Analysis', 'SQL', 'Figma'],
    'qa-engineer': ['Cypress', 'Selenium', 'Java', 'TypeScript', 'API Testing', 'Postman', 'QA Manual', 'CI/CD Pipelines', 'Integration Testing', 'JIRA', 'Regression Testing']
  };

  suggestedRoleBullets: { [key: string]: string[] } = {
    'software-engineer': [
      'Spearheaded development of a real-time analytics engine using Angular and Node.js, reducing query response times by 40%.',
      'Designed and implemented secure RESTful microservices in Spring Boot, raising API uptime reliability to 99.9%.',
      'Optimized database index query architectures in PostgreSQL, achieving a 30% speedup in core page rendering speeds.',
      'Led the migration of legacy service architectures to Docker containers, streamlining delivery pipeline runtimes by 25%.'
    ],
    'data-analyst': [
      'Built dynamic Power BI dashboards that automated weekly executive reporting, saving 12 hours of manual analysis per week.',
      'Analyzed large customer datasets using SQL and Python to isolate churn patterns, helping increase quarterly retention by 15%.',
      'Designed a standard ETL database pipeline that consolidated data from 4 marketing channels, reducing report drift to zero.',
      'Identified sales bottleneck patterns using regression analysis models, uncovering $45K in previously lost pipeline opportunities.'
    ],
    'product-manager': [
      'Led cross-functional teams of 12 engineers and designers to launch a mobile app version, acquiring 50K users in 6 months.',
      'Defined product roadmap and key requirements based on 30+ customer interviews, boosting CSAT scores by 18%.',
      'Collaborated on release strategies that cut product time-to-market by 3 weeks, yielding a 14% revenue surge.',
      'Spearheaded transition to Agile Scrum methodologies, increasing team feature delivery output velocity by 22%.'
    ],
    'qa-engineer': [
      'Created and executed automated test suites using Cypress and Selenium, expanding coverage bounds from 40% to 85%.',
      'Collaborated with development leads in CI/CD pipeline integration, cutting release deployment cycle times by 25%.',
      'Orchestrated API contract security tests in Postman, preventing 3 major production data vulnerability leaks.',
      'Designed rigorous edge-case manual verification procedures, dropping post-release bug rates by 60%.'
    ]
  };

  // ============= ATS QUALITY CHECK METHODS =============
  getEmailQuality(): { status: string; label: string } {
    const email = this.data?.email || '';
    if (!email) return { status: 'empty', label: 'Missing' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { status: 'warning', label: 'Invalid format' };
    if (email.includes('gmail') || email.includes('outlook') || email.includes('yahoo'))
      return { status: 'good', label: 'Professional ✓' };
    return { status: 'good', label: 'Valid ✓' };
  }

  getPhoneQuality(): { status: string; label: string } {
    const phone = this.data?.phone || '';
    if (!phone) return { status: 'empty', label: 'Missing' };
    if (phone.length < 10) return { status: 'warning', label: 'Too short' };
    return { status: 'good', label: 'Valid ✓' };
  }

  getNameQuality(): { status: string; label: string } {
    const name = this.data?.name || '';
    if (!name) return { status: 'empty', label: 'Missing' };
    if (name.trim().split(/\s+/).length < 2) return { status: 'warning', label: 'Add full name' };
    return { status: 'good', label: 'ATS Ready ✓' };
  }

  getSummaryQuality(): { status: string; label: string; wordCount: number } {
    const summary = this.data?.summary || '';
    const wordCount = summary.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    if (wordCount === 0) return { status: 'empty', label: 'Not written', wordCount: 0 };
    if (wordCount < 20) return { status: 'warning', label: 'Too brief — add detail', wordCount };
    if (wordCount > 80) return { status: 'warning', label: 'Too long — trim it', wordCount };
    return { status: 'good', label: 'Optimal length ✓', wordCount };
  }

  getBulletStrength(text: string): { status: string; label: string } {
    if (!text || text.trim().length === 0) return { status: 'empty', label: 'Empty' };
    const strongVerbs = ['developed', 'architected', 'optimized', 'led', 'implemented', 'designed', 'deployed', 'integrated', 'refactored', 'automated', 'streamlined', 'spearheaded', 'mentored', 'delivered', 'built', 'created', 'managed', 'improved', 'reduced', 'increased'];
    const firstWord = text.trim().split(/\s+/)[0]?.toLowerCase() || '';
    const hasVerb = strongVerbs.some(v => firstWord.startsWith(v));
    const hasQuantity = /\d+%|\d+x|\d+\+|\$\d+|reduced|increased|improved/.test(text);
    if (hasVerb && hasQuantity) return { status: 'good', label: 'Strong ✓' };
    if (hasVerb) return { status: 'ok', label: 'Good — add metrics' };
    return { status: 'warning', label: 'Start with action verb' };
  }

  // ============= SECTION COMPLETENESS CALCULATORS =============
  getContactCompleteness(): { filled: number; total: number; percent: number } {
    let filled = 0;
    const total = 6;
    if (this.data?.name) filled++;
    if (this.data?.headline) filled++;
    if (this.data?.email) filled++;
    if (this.data?.phone) filled++;
    if (this.data?.personal?.linkedin) filled++;
    if (this.data?.personal?.github) filled++;
    return { filled, total, percent: Math.round((filled / total) * 100) };
  }

  getSummaryCompleteness(): { filled: number; total: number; percent: number } {
    const wordCount = (this.data?.summary || '').trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const percent = Math.min(100, Math.round((wordCount / 40) * 100));
    return { filled: wordCount, total: 40, percent };
  }

  getSkillsCompleteness(): { filled: number; total: number; percent: number } {
    const count = (this.selectedSkills || []).length;
    const ideal = 8;
    return { filled: count, total: ideal, percent: Math.min(100, Math.round((count / ideal) * 100)) };
  }

  getEmploymentCompleteness(): { filled: number; total: number; percent: number } {
    const items = this.data?.employment || [];
    if (items.length === 0) return { filled: 0, total: 1, percent: 0 };
    let filled = 0;
    let total = 0;
    items.forEach((e: any) => {
      total += 4;
      if (e.company) filled++;
      if (e.role) filled++;
      if (e.start) filled++;
      if (e.responsibilities) filled++;
    });
    return { filled, total, percent: total > 0 ? Math.round((filled / total) * 100) : 0 };
  }

  getProjectsCompleteness(): { filled: number; total: number; percent: number } {
    const items = this.data?.projects || [];
    if (items.length === 0) return { filled: 0, total: 1, percent: 0 };
    let filled = 0;
    let total = 0;
    items.forEach((p: any) => {
      total += 4;
      if (p.title) filled++;
      if (p.tech) filled++;
      if (p.role) filled++;
      if (p.desc) filled++;
    });
    return { filled, total, percent: total > 0 ? Math.round((filled / total) * 100) : 0 };
  }

  getEducationCompleteness(): { filled: number; total: number; percent: number } {
    const items = this.data?.education || [];
    if (items.length === 0) return { filled: 0, total: 1, percent: 0 };
    let filled = 0;
    let total = 0;
    items.forEach((ed: any) => {
      total += 3;
      if (ed.degree) filled++;
      if (ed.college) filled++;
      if (ed.year) filled++;
    });
    return { filled, total, percent: total > 0 ? Math.round((filled / total) * 100) : 0 };
  }


  // Insert AI phrase into summary
  insertSummaryPhrase(phrase: string) {
    const role = this.aiRole || 'Software Developer';
    const exp = this.aiExperience || '2';
    const formatted = phrase.replace('{role}', role).replace('{exp}', exp);
    this.data.summary = (this.data.summary || '') + (this.data.summary ? ' ' : '') + formatted;
    this.updateScore();
  }

  // Insert action verb at cursor
  insertActionVerb(verb: string) {
    if (this.data.employment && this.data.employment.length > 0) {
      const idx = this.expandedItems['employment'];
      if (idx >= 0 && idx < this.data.employment.length) {
        const current = this.data.employment[idx].responsibilities || '';
        this.data.employment[idx].responsibilities = current + (current ? '\n' : '') + verb + ' ';
      }
    }
  }

  insertProjectPhrase(phrase: string, idx: number) {
    if (this.data.projects && this.data.projects[idx]) {
      const tech = this.data.projects[idx].tech || 'modern technologies';
      const formatted = phrase.replace('{tech}', tech);
      const current = this.data.projects[idx].desc || '';
      this.data.projects[idx].desc = current + (current ? '\n' : '') + formatted;
      this.updateScore();
    }
  }

  insertRecommendedSkill(skill: string) {
    if (!this.selectedSkills.includes(skill)) {
      this.selectedSkills.push(skill);
      this.updateScore();
    }
  }

  insertHeadlineSuggestion(headline: string) {
    this.data.headline = headline;
    this.updateScore();
  }

  insertRoleBulletSuggestion(bullet: string, idx: number) {
    if (this.data.employment && this.data.employment[idx]) {
      const current = this.data.employment[idx].responsibilities || '';
      this.data.employment[idx].responsibilities = current + (current ? '\n' : '') + '• ' + bullet;
      this.updateScore();
    }
  }

  // Toggle guide section
  toggleGuideSection(section: string) {
    this.guideExpandedSection = this.guideExpandedSection === section ? '' : section;
  }

  constructor() { }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'resume-page-active');

    // Sync tab from current route path
    this.syncTabFromRoute();

    this.router.events.subscribe(() => {
      this.syncTabFromRoute();
    });

    // Restore unsaved progress and auto-download if returning from login/register
    if (typeof window !== 'undefined') {
      const unsaved = localStorage.getItem('unsaved_resume_data');
      if (unsaved) {
        try {
          const parsed = JSON.parse(unsaved);
          if (parsed.data) this.service.data = parsed.data;
          if (parsed.selectedSkills) this.service.selectedSkills = parsed.selectedSkills;
          if (parsed.selectedLanguages) this.service.selectedLanguages = parsed.selectedLanguages;
          if (parsed.themeColor) this.service.themeColor = parsed.themeColor;
          if (parsed.selectedTemplate) this.service.selectedTemplate = parsed.selectedTemplate;
          if (parsed.headingFont) this.service.headingFont = parsed.headingFont;
          if (parsed.bodyFont) this.service.bodyFont = parsed.bodyFont;
          if (parsed.headingSize) this.service.headingSize = parsed.headingSize;
          if (parsed.bodySize) this.service.bodySize = parsed.bodySize;
          if (parsed.lineSpacing) this.service.lineSpacing = parsed.lineSpacing;
          if (parsed.sectionSpacing) this.service.sectionSpacing = parsed.sectionSpacing;
          if (parsed.pageMargin) this.service.pageMargin = parsed.pageMargin;
          if (parsed.headingStyle) this.service.headingStyle = parsed.headingStyle;
          if (parsed.subheadingStyle) this.service.subheadingStyle = parsed.subheadingStyle;
          if (parsed.dividerStyle) this.service.dividerStyle = parsed.dividerStyle;
          if (parsed.bulletStyle) this.service.bulletStyle = parsed.bulletStyle;
          if (parsed.dateFormat) this.service.dateFormat = parsed.dateFormat;
          if (parsed.skillsStyle) this.service.skillsStyle = parsed.skillsStyle;
          if (parsed.headerLayout) this.service.headerLayout = parsed.headerLayout;
          if (parsed.selectedHighlights) this.service.selectedHighlights = parsed.selectedHighlights;

          localStorage.removeItem('unsaved_resume_data');

          // Check if we just completed registration/login
          const user = (this.service as any).authService.getUser();
          if (user || this.service['authService'].isLoggedIn()) {
            this.service.saveResume();
            setTimeout(() => {
              this.service.downloadPDF();
            }, 600);
          }
        } catch (e) {
          console.error('Failed to restore unsaved state', e);
        }
      }
    }
  }

  syncTabFromRoute() {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.includes('/resume-workspace')) {
      if (this.activeTab !== 'editor' && this.activeTab !== 'templates') {
        this.activeTab = 'templates';
      }
      this.autoFitZoom();
    } else if (path.includes('/resume-scanner')) {
      this.activeTab = 'scanner';
      this.autoFitZoom();
    } else if (path.includes('/resume-customizer')) {
      this.activeTab = 'customizer';
      this.autoFitZoom();
    } else if (path.includes('/resume-guide')) {
      this.activeTab = 'guide';
      this.autoFitZoom();
    }
  }

  ngDoCheck() {
    // Zoom auto-fit logic and checklist updates
    this.service.updateScore();
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'resume-page-active');
  }

  // Event Delegates (to match existing method signatures in html)
  selectWorkspaceTab(tab: string, section?: string) {
    this.service.selectWorkspaceTab(tab, section);
  }

  selectTemplate(id: string) {
    this.service.selectTemplate(id);
  }

  cancelUpgrade() {
    this.service.cancelUpgrade();
  }

  isTemplateLocked(id: string) {
    return this.service.isTemplateLocked(id);
  }

  getTemplateName(id: string) {
    return this.service.getTemplateName(id);
  }

  getRenderTemplateId(id: string) {
    const t = this.templates.find(x => x.id === id);
    return t && t.baseLayout ? t.baseLayout : id;
  }

  getSectionLabel(id: string, defaultVal: string) {
    return (this.customSectionTitles as any)[id] || defaultVal;
  }

  triggerEditorFileUpload() {
    if (typeof document !== 'undefined') {
      const fileInput = document.getElementById('editor-resume-file');
      if (fileInput) fileInput.click();
    }
  }

  onOldResumeUpload(event: any) {
    this.service.onOldResumeUpload(event);
  }

  onFileChange(event: any) {
    this.service.onFileChange(event);
  }

  addItem(type: 'employment' | 'projects' | 'education' | 'certifications' | 'achievements' | 'publications' | 'customSections') {
    this.service.addItem(type);
  }

  removeItem(type: 'employment' | 'projects' | 'education' | 'certifications' | 'achievements' | 'publications' | 'customSections', index: number) {
    this.service.removeItem(type, index);
  }

  addCustomSectionItem(secIndex: number) {
    this.service.addCustomSectionItem(secIndex);
  }

  removeCustomSectionItem(secIndex: number, itemIndex: number) {
    this.service.removeCustomSectionItem(secIndex, itemIndex);
  }

  saveAndDownload() {
    this.service.saveAndDownload();
  }

  toggleLanguage(lang: string) {
    this.service.toggleLanguage(lang);
  }

  openUpgradeLink() {
    this.service.openUpgradeLink();
  }

  addSkill(skill: string) {
    this.service.addSkill(skill);
  }

  removeSkill(i: number) {
    this.service.removeSkill(i);
  }

  onSkillInput() {
    this.service.onSkillInput();
  }

  loadSampleData() {
    this.service.loadSampleData();
  }

  clearForm() {
    this.service.clearForm();
  }

  generateAIResume() {
    this.service.generateAIResume();
  }

  updateScore() {
    this.service.updateScore();
  }

  openKeywordIntegration(keyword: string) {
    this.service.openKeywordIntegration(keyword);
  }

  insertSkillTag() {
    this.service.insertSkillTag();
  }

  insertIntoSummary() {
    this.service.insertIntoSummary();
  }

  insertIntoExperience() {
    this.service.insertIntoExperience();
  }

  insertIntoProjects() {
    this.service.insertIntoProjects();
  }

  // Spacing & zoom helpers
  zoomIn() {
    const nextZoom = Math.min(1.5, this.service.zoomLevel + 0.1);
    this.service.zoomLevel = nextZoom;
  }

  zoomOut() {
    const nextZoom = Math.max(0.2, this.service.zoomLevel - 0.1);
    this.service.zoomLevel = nextZoom;
  }

  autoFitZoom() {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const container = document.querySelector('.canvas-scroll-container');
      if (container) {
        const width = container.clientWidth;
        if (width > 0) {
          let calculatedZoom = (width - 32) / 816;
          const newZoom = Math.max(0.3, Math.min(1.2, calculatedZoom));
          if (Math.abs(this.service.zoomLevel - newZoom) > 0.01) {
            this.service.zoomLevel = newZoom;
          }
        }
      }
    }, 150);
  }

  toggleDownloadDropdown(event: Event) {
    event.stopPropagation();
    this.service.showDownloadDropdown = !this.service.showDownloadDropdown;
  }

  downloadPDF() {
    this.service.downloadPDF();
  }

  downloadDOC() {
    this.service.downloadDOC();
  }

  downloadTXT() {
    this.service.downloadTXT();
  }

  downloadJSON() {
    this.service.downloadJSON();
  }

  // Section reordering drag & drop helpers
  onDragStart(index: number) {
    this.service.dragIndex = index;
  }

  onDrop(index: number) {
    const dragIndex = this.service.dragIndex;
    if (dragIndex > -1 && dragIndex !== index) {
      const movedItem = this.sections[dragIndex];
      this.service.sections.splice(dragIndex, 1);
      this.service.sections.splice(index, 0, movedItem);
    }
    this.service.dragIndex = -1;
  }

  setSection(id: string) {
    this.activeSection = id;
  }

  getBulletPoints(text: string): string[] {
    return this.service.getBulletPoints(text);
  }

  formatDate(dateStr: string): string {
    return this.service.formatDate(dateStr);
  }

  togglePdfMenu(event: Event) {
    event.stopPropagation();
    this.service.showPdfMenu = !this.service.showPdfMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.service.showPdfMenu = false;
    this.service.showTemplateDropdown = false;
  }
}
