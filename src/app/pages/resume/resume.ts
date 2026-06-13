import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* 🔥 MODELS (STRUCTURED DATA) */
interface Employment {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  responsibilities: string;
}

interface Project {
  title: string;
  tech: string;
  role: string;
  link: string;
  desc: string;
}

interface Education {
  degree: string;
  college: string;
  year: string;
}

interface Reference {
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume {
  /* ================= CORE STATE ================= */
  selectedTemplate = 'template1';
  activeSection = 'summary';
  dragIndex = -1;
  profileScore = 0;

  /* ================= TAB NAVIGATION ================= */
  activeTab = 'editor'; // 'editor' | 'scanner'

  /* ================= JD SCANNER STATE ================= */
  jobDescriptionText = '';
  oldResumeText = '';
  jdMatchedSkills: string[] = [];
  jdMissingSkills: string[] = [];
  jdSuggestions: string[] = [];
  jdMatchScore = 0;
  isScanning = false;

  /* ================= SKILLS SYSTEM ================= */
  allSkills: string[] = [
    'Java', 'Spring Boot', 'Angular', 'React', 'Node.js', 'SQL', 'MongoDB',
    'Microservices', 'REST API', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Jenkins', 'Python', 'C', 'C++',
    'Data Structures', 'Algorithms', 'DevOps', 'Machine Learning', 'Linux',
    'GraphQL', 'Redux', 'Next.js', 'Azure', 'Firebase', 'JUnit', 'Hibernate',
    'PostgreSQL', 'Tailwind', 'CI/CD', 'API Testing', 'JSON', 'Agile'
  ];
  maxSkills = 25;
  skillInput = '';
  filteredSkills: string[] = [];
  selectedSkills: string[] = [];

  /* ================= LANGUAGES ================= */
  allLanguages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];
  selectedLanguages: string[] = [];

  /* ================= SECTIONS ================= */
  sections = [
    { id: 'summary', label: 'Profile Summary' },
    { id: 'skills', label: 'Key Skills' },
    { id: 'employment', label: 'Employment History' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'personal', label: 'Personal Details' },
    { id: 'references', label: 'Professional References' }
  ];

  /* ================= ATS KEYWORDS BY ROLE ================= */
  targetRole = 'Full Stack Developer';
  availableRoles = ['Full Stack Developer', 'Java Developer', 'Frontend Developer', 'DevOps Engineer'];

  roleKeywords: { [key: string]: string[] } = {
    'Full Stack Developer': ['Angular', 'React', 'Node.js', 'Spring Boot', 'SQL', 'MongoDB', 'Microservices', 'REST API', 'Git', 'Docker', 'AWS', 'TypeScript', 'CI/CD', 'GraphQL'],
    'Java Developer': ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'REST API', 'SQL', 'JUnit', 'Maven', 'Jenkins', 'Git', 'Docker', 'AWS', 'Design Patterns'],
    'Frontend Developer': ['Angular', 'React', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Redux', 'SASS', 'Git', 'Webpack', 'REST API', 'Bootstrap', 'Tailwind', 'Responsive Design'],
    'DevOps Engineer': ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Linux', 'Python', 'Terraform', 'Ansible', 'CI/CD', 'Monitoring', 'Bash', 'Azure', 'YAML']
  };

  /* ================= SECTION HELP TIPS ================= */
  sectionGuidelines: { [key: string]: { title: string; tips: string[] } } = {
    'summary': {
      title: 'Profile Summary Guidelines',
      tips: [
        'Keep it concise: 2 to 4 sentences highlighting your core competencies and years of learning.',
        'Use strong action verbs and mention your software architecture or frontend proficiency.',
        'Avoid generic descriptors; focus on specific technologies and project achievements.'
      ]
    },
    'skills': {
      title: 'Skills & Keywords Tips',
      tips: [
        'List 6 to 15 key technical competencies matching your target career tracks.',
        'Click industry keywords below to automatically parse and append tags to your profile.',
        'Balance languages, databases, cloud, and tools (e.g. Java, PostgreSQL, AWS, Git).'
      ]
    },
    'employment': {
      title: 'Work History Tips',
      tips: [
        'Detail your duties using bulleted lists starting with active terms ("Built", "Managed", "Implemented").',
        'Add quantitative figures if possible (e.g., "reduced latency by 25%", "improved code coverage by 15%").',
        'Reference specific technologies employed in each position description.'
      ]
    },
    'projects': {
      title: 'Project Portfolio Tips',
      tips: [
        'Highlight 1 to 3 projects showcasing practical coding and system architectures.',
        'Follow the STAR format: specify Situation, Task, Action taken, and Results achieved.',
        'Include repository links (GitHub) or sandbox references to demonstrate active code.'
      ]
    },
    'education': {
      title: 'Education Tips',
      tips: [
        'List degrees in reverse chronological order with college/university details.',
        'Add GPA or percentage details if you are a fresher or entry-level candidate.',
        'Optionally include key specializations or thesis focus.'
      ]
    },
    'personal': {
      title: 'Personal Details Tips',
      tips: [
        'Ensure professional links (LinkedIn & GitHub) are accurate and fully qualified.',
        'Select all languages in which you possess professional working proficiency.',
        'Keep date of birth and location specifications minimal.'
      ]
    },
    'references': {
      title: 'Reference Guidelines',
      tips: [
        'Provide 1 or 2 professional references (such as mentors, trainers, or project leads).',
        'Ensure you have obtained authorization from reference candidates prior to publication.',
        'Check that email addresses and phone numbers are correctly structured.'
      ]
    }
  };

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
    references: <Reference[]>[]
  };

  /* ================= SCORECARD CHECKLIST ================= */
  scoreChecklist = {
    hasName: false,
    hasContact: false,
    hasSummary: false,
    hasSkills: false,
    hasEmployment: false,
    hasProjects: false,
    hasEducation: false,
    hasSocials: false,
    hasReferences: false
  };

  /* ================= SECTION NAVIGATION ================= */
  setSection(id: string) {
    this.activeSection = id;
  }

  /* ================= DRAGGABLE SECTIONS ================= */
  onDragStart(i: number) {
    this.dragIndex = i;
  }

  onDrop(i: number) {
    const moved = this.sections.splice(this.dragIndex, 1)[0];
    this.sections.splice(i, 0, moved);
  }

  /* ================= SKILL TAGS MANAGEMENT ================= */
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

  /* ================= KEYWORD COMPLIANCE ================= */
  addKeyword(keyword: string) {
    this.addSkill(keyword);
  }

  /* ================= LANGUAGES SELECTOR ================= */
  toggleLanguage(lang: string) {
    if (this.selectedLanguages.includes(lang)) {
      this.selectedLanguages = this.selectedLanguages.filter((l) => l !== lang);
    } else {
      this.selectedLanguages.push(lang);
    }
  }

  /* ================= ARRAY LIST OPERATIONS ================= */
  addItem(type: 'employment' | 'projects' | 'education' | 'references') {
    if (type === 'employment') {
      this.data.employment.push({
        company: '', role: '', location: '', start: '', end: '', current: false, responsibilities: ''
      });
    } else if (type === 'projects') {
      this.data.projects.push({
        title: '', tech: '', role: '', link: '', desc: ''
      });
    } else if (type === 'education') {
      this.data.education.push({
        degree: '', college: '', year: ''
      });
    } else if (type === 'references') {
      this.data.references.push({
        name: '', relationship: '', company: '', email: '', phone: ''
      });
    }
    this.updateScore();
  }

  removeItem(type: 'employment' | 'projects' | 'education' | 'references', i: number) {
    this.data[type].splice(i, 1);
    this.updateScore();
  }

  /* ================= PICTURE UPLOADER ================= */
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.data.photo = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  /* ================= PROFILE STRENGTH ALGORITHM ================= */
  updateScore() {
    this.scoreChecklist.hasName = !!(this.data.name && this.data.name.length >= 3);
    this.scoreChecklist.hasContact = !!(this.data.email && /^\S+@\S+\.\S+$/.test(this.data.email) && this.data.phone && /^\d{10}$/.test(this.data.phone));
    this.scoreChecklist.hasSummary = !!(this.data.summary && this.data.summary.length >= 20);
    this.scoreChecklist.hasSkills = this.selectedSkills.length >= 4;
    this.scoreChecklist.hasEmployment = this.data.employment.length > 0 && !!this.data.employment[0].company;
    this.scoreChecklist.hasProjects = this.data.projects.length > 0 && !!this.data.projects[0].title;
    this.scoreChecklist.hasEducation = this.data.education.length > 0 && !!this.data.education[0].degree;
    this.scoreChecklist.hasSocials = !!(this.data.personal.linkedin || this.data.personal.github);
    this.scoreChecklist.hasReferences = this.data.references.length > 0 && !!this.data.references[0].name;

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

  /* ================= PREVIEW SCALE CONTROLS ================= */
  zoomLevel = 1.0;
  zoomIn() {
    if (this.zoomLevel < 1.5) this.zoomLevel += 0.05;
  }
  zoomOut() {
    if (this.zoomLevel > 0.6) this.zoomLevel -= 0.05;
  }

  /* ================= PREVIEW TEMPLATES LIST (10+ TEMPLATES) ================= */
  templates = [
    { id: 'template1', name: 'Standard Classic', color: '#1e293b' },
    { id: 'template2', name: 'Corporate Modern', color: '#4f46e5' },
    { id: 'template3', name: 'Dual Column', color: '#0ea5e9' },
    { id: 'template4', name: 'Tech Developer', color: '#10b981' },
    { id: 'template5', name: 'Executive Serif', color: '#9d174d' },
    { id: 'template6', name: 'Minimalist Clean', color: '#64748b' },
    { id: 'template7', name: 'Bold Left Border', color: '#dc2626' },
    { id: 'template8', name: 'Accent Top Header', color: '#7c3aed' },
    { id: 'template9', name: 'Academic CV', color: '#0369a1' },
    { id: 'template10', name: 'Startup Creative', color: '#db2777' },
    { id: 'template11', name: 'Elegant Royal', color: '#d97706' },
    { id: 'template12', name: 'Navy Compact', color: '#1e3a8a' },
    { id: 'template13', name: 'Teal Modern', color: '#0f766e' },
    { id: 'template14', name: 'Charcoal Corp', color: '#334155' },
    { id: 'template15', name: 'Left Bar Minimal', color: '#475569' },
    { id: 'template16', name: 'Slate Standard', color: '#0284c7' },
    { id: 'template17', name: 'Orange Bold', color: '#ea580c' },
    { id: 'template18', name: 'Clean Split', color: '#0369a1' },
    { id: 'template19', name: 'Retro Terminal', color: '#16a34a' },
    { id: 'template20', name: 'Creative Portfolio', color: '#be185d' },
    { id: 'template21', name: 'Luxury Gold', color: '#b59410' },
    { id: 'template22', name: 'Executive Crimson', color: '#880808' },
    { id: 'template23', name: 'Tech Lead Minimal', color: '#0f172a' },
    { id: 'template24', name: 'Startup Creative Premium', color: '#ec4899' },
    { id: 'template25', name: 'Academic Premium', color: '#111827' }
  ];

  /* ================= RESET & SEEDING ================= */
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
      references: []
    };
    this.selectedSkills = [];
    this.selectedLanguages = [];
    this.jdSuggestions = [];
    this.jdMatchScore = 0;
    this.jdMatchedSkills = [];
    this.jdMissingSkills = [];
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
      references: [
        {
          name: 'Dr. Ramesh Kumar',
          relationship: 'Senior Mentor & Placement Head',
          company: 'JNTU CSE Department',
          email: 'ramesh@jntu.edu.in',
          phone: '9848022338'
        }
      ]
    };
    this.selectedSkills = ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'SQL', 'REST API', 'Docker', 'Git'];
    this.selectedLanguages = ['English', 'Telugu', 'Hindi'];
    this.updateScore();
  }

  /* ================= FORMAT DURATION HELPER ================= */
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
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[monthIndex]} ${year}`;
    }
    return dateStr;
  }

  /* ================= AUTO AI GENERATION ================= */
  aiRole = '';
  aiExperience = 'Fresher';
  generateAIResume() {
    if (!this.aiRole) {
      alert('Please enter a role before generating.');
      return;
    }
    this.data.summary = `Results-driven ${this.aiRole} with a strong foundation in modern architectures, code optimizations, and software engineering principles. Proficient in designing scalable applications, writing clean logic, and collaborating across development teams to achieve milestones.`;
    this.data.headline = `Associate ${this.aiRole}`;

    // Auto populate matching skills
    const match = this.roleKeywords[this.aiRole] || this.roleKeywords['Full Stack Developer'];
    this.selectedSkills = match.slice(0, 7);

    // Auto populate sample details matching the role
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

  /* ================= OLD RESUME TEXT PARSING ================= */
  /* ================= OLD RESUME TEXT PARSING ================= */
  parseOldResumeText(text: string) {
    if (!text || text.trim().length === 0) return;

    // Split text into lines
    const lines = text.split('\n').map(l => l.trim());

    let currentSection = 'contact';
    const sectionTexts: { [key: string]: string[] } = {
      contact: [],
      summary: [],
      skills: [],
      experience: [],
      projects: [],
      education: [],
      references: []
    };

    // Words/patterns that identify a section header
    const summaryHeaderRegex = /^(?:(?:professional\s+)?summary|profile|about\s+me|executive\s+summary)$/i;
    const skillsHeaderRegex = /^(?:(?:key\s+)?skills|technical\s+skills|expertise|competencies|technologies|stack)$/i;
    const experienceHeaderRegex = /^(?:(?:work\s+)?experience|employment(?:\s+history)?|professional\s+experience|work\s+history|career\s+history)$/i;
    const projectsHeaderRegex = /^(?:projects|featured\s+projects|personal\s+projects|academic\s+projects|creations)$/i;
    const educationHeaderRegex = /^(?:education|academic\s+(?:profile|background|history)|qualifications)$/i;
    const referencesHeaderRegex = /^(?:references|professional\s+references)$/i;

    const cleanHeaderLine = (line: string): string => {
      return line.trim()
        .replace(/^[\s#*_\-\d\.\:]+/, '') // remove markdown header symbols, lists, spaces
        .replace(/[\s*_\-:]+$/, '')      // remove trailing punctuation, spaces, asterisks
        .trim();
    };

    for (let line of lines) {
      if (!line) continue;
      const cleaned = cleanHeaderLine(line);

      if (summaryHeaderRegex.test(cleaned)) {
        currentSection = 'summary';
      } else if (skillsHeaderRegex.test(cleaned)) {
        currentSection = 'skills';
      } else if (experienceHeaderRegex.test(cleaned)) {
        currentSection = 'experience';
      } else if (projectsHeaderRegex.test(cleaned)) {
        currentSection = 'projects';
      } else if (educationHeaderRegex.test(cleaned)) {
        currentSection = 'education';
      } else if (referencesHeaderRegex.test(cleaned)) {
        currentSection = 'references';
      } else {
        sectionTexts[currentSection].push(line);
      }
    }

    // --- 1. NAME & INFO (CONTACT) ---
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
    if (emailMatch) this.data.email = emailMatch[0];

    const phoneMatch = text.match(/\b\d{10}\b/);
    if (phoneMatch) this.data.phone = phoneMatch[0];

    // Find a name candidate from the contact lines
    const contactLines = sectionTexts['contact'];
    const nameCandidate = contactLines.find(l =>
      !l.includes('@') &&
      !l.includes('http') &&
      !l.includes(':') &&
      l.length > 2 &&
      l.length < 35 &&
      /^[a-zA-Z\s]+$/.test(l)
    );
    if (nameCandidate) {
      this.data.name = nameCandidate;
      // Extract headline if possible (first short line after name candidate in contact)
      const nameIndex = contactLines.indexOf(nameCandidate);
      if (nameIndex !== -1 && contactLines.length > nameIndex + 1) {
        const headlineCandidate = contactLines[nameIndex + 1];
        if (headlineCandidate && headlineCandidate.length < 50 && !headlineCandidate.includes('@') && !headlineCandidate.includes('http')) {
          this.data.headline = headlineCandidate;
        }
      }
    }

    // --- 2. LINKEDIN / GITHUB ---
    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch) this.data.personal.linkedin = linkedinMatch[0];

    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch) this.data.personal.github = githubMatch[0];

    // --- 3. PROFILE SUMMARY ---
    const isLikelySummaryProse = (line: string): boolean => {
      const trimmed = line.trim();
      if (trimmed.length < 50) return false;

      // Ignore if it contains pipe symbol (very common in metadata rows, never in summary prose paragraphs)
      if (trimmed.includes('|')) return false;

      // Ignore if it contains an email address
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/.test(trimmed)) return false;

      // Ignore if it contains a phone number pattern (broad matching)
      if (/\+?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(trimmed) || /\b\d{10}\b/.test(trimmed)) return false;

      // Ignore if it contains common URL/link keywords or patterns
      if (/\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.(?:com|org|net|online|dev|co|in|info)\b/i.test(trimmed)) return false;

      // Ignore if it looks like key-value pairs (e.g. Experience: 5 years, Location: Bangalore)
      if (/(?:experience|exp|phone|mobile|email|location|address|linkedin|github|website|portfolio|skills)\s*[:\-]/i.test(trimmed)) return false;

      // Ignore if it contains experience details in a metadata format
      if (/\bexperience\s*:\s*\d+\s*(?:years?|yrs?|months?|mos?)/i.test(trimmed)) return false;

      return true;
    };

    const validSummaryLines = sectionTexts['summary'].filter(l => isLikelySummaryProse(l));
    let summaryText = validSummaryLines.join('\n').trim();

    if (!summaryText) {
      // Fallback: look for a paragraph of length 70 to 400 inside contact section or general lines
      const summaryCandidate = lines.find(l => isLikelySummaryProse(l) && l.length > 70 && l.length < 400 &&
        (l.toLowerCase().includes('experience') || l.toLowerCase().includes('developer') || l.toLowerCase().includes('motivated') || l.toLowerCase().includes('engineer'))
      );
      if (summaryCandidate) summaryText = summaryCandidate;
    }
    if (summaryText) {
      this.data.summary = summaryText;
    }

    // --- 4. KEY SKILLS ---
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

    // --- 5. WORK EXPERIENCE ---
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

      // Segment into blocks
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

      // Parse each block into an Employment entry
      for (let block of blocks) {
        let headers = [...block.headers];

        let start = '';
        let end = '';
        let current = false;
        let location = '';

        // A. Extract dates from headers
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

        // Clean up empty parentheses that might be left over from dates e.g. "()"
        headers = headers.map(h => h.replace(/\s*\(\s*\)/g, '').trim()).filter(h => h.length > 0);

        // B. Extract location
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

        // C. Extract role & company
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
          // Fallback if no line matched roleRegex
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

        // Clean up leading/trailing symbols from role and company
        role = role.replace(/^[\s,\-|()]+|[\s,\-|()]+$/g, '').trim();
        company = company.replace(/^[\s,\-|()]+|[\s,\-|()]+$/g, '').trim();

        // D. Clean responsibilities
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

    // --- 6. PROJECT PORTFOLIO ---
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

    // --- 7. EDUCATION INFO ---
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

    // --- 8. REFERENCES ---
    if (sectionTexts['references'].length > 0) {
      const refEntries: Reference[] = [];
      let currentRef: Reference | null = null;

      for (let line of sectionTexts['references']) {
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
        const phoneMatch = line.match(/\b\d{10}\b/);

        const isNewRef = line.length < 40 && !emailMatch && !phoneMatch && /^[A-Z][a-zA-Z\s]+$/.test(line);

        if (isNewRef && currentRef && currentRef.name) {
          refEntries.push(currentRef);
          currentRef = null;
        }

        if (!currentRef) {
          currentRef = {
            name: line,
            relationship: 'Professional Contact',
            company: 'Institution',
            email: '',
            phone: ''
          };
        } else {
          if (emailMatch) currentRef.email = emailMatch[0];
          if (phoneMatch) currentRef.phone = phoneMatch[0];
          if (!emailMatch && !phoneMatch) {
            if (line.includes(' at ') || line.includes('@')) {
              currentRef.company = line.split(/at|@/)[1].trim();
            } else {
              currentRef.relationship = line;
            }
          }
        }
      }
      if (currentRef && currentRef.name) {
        refEntries.push(currentRef);
      }
      if (refEntries.length > 0) {
        this.data.references = refEntries;
      }
    }

    this.updateScore();
  }

  onOldResumePaste() {
    this.clearForm();
  }

  onOldResumeUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.clearForm();
        this.oldResumeText = reader.result;
        this.parseOldResumeText(this.oldResumeText);
      }
    };
    reader.readAsText(file);
  }

  /* ================= JD KEYWORDS MATCHER SCANNER ================= */
  scanJdAndResume() {
    if (!this.jobDescriptionText || this.jobDescriptionText.trim().length === 0) {
      alert('Please paste a Job Description first.');
      return;
    }

    // Run parser to ensure any last-minute text pastes/changes are fully parsed & matched
    if (this.oldResumeText && this.oldResumeText.trim().length > 0) {
      this.parseOldResumeText(this.oldResumeText);
    }

    this.isScanning = true;

    setTimeout(() => {
      // Find keywords matching allSkills in the Job Description
      const foundJdKeywords: string[] = [];
      this.allSkills.forEach(s => {
        const escaped = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + escaped + '\\b', 'i');
        if (regex.test(this.jobDescriptionText)) {
          foundJdKeywords.push(s);
        }
      });

      // Filter matched & missing keyword tags
      this.jdMatchedSkills = foundJdKeywords.filter(s => this.selectedSkills.includes(s));
      this.jdMissingSkills = foundJdKeywords.filter(s => !this.selectedSkills.includes(s));

      // Calculate JD Match Score
      if (foundJdKeywords.length > 0) {
        this.jdMatchScore = Math.round((this.jdMatchedSkills.length / foundJdKeywords.length) * 100);
      } else {
        this.jdMatchScore = 50; // default baseline if no direct skills matches are found
      }

      this.generateJdSuggestions();
      this.isScanning = false;
    }, 1000); // 1s simulation timer for modern loading aesthetics
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

  /* ================= SUGGEST CHANGES RECOMMENDER ================= */
  generateJdSuggestions() {
    this.jdSuggestions = [];

    // Summary checks
    if (!this.data.summary || this.data.summary.trim().length < 30) {
      this.jdSuggestions.push('Your Profile Summary is missing or too brief. Write a 3-sentence summary highlighting your core skills.');
    } else if (this.data.summary && this.targetRole && !this.data.summary.toLowerCase().includes(this.targetRole.toLowerCase())) {
      this.jdSuggestions.push(`Mention your target job title "${this.targetRole}" in your Profile Summary to increase relevance.`);
    }

    // Skills checklist
    if (this.selectedSkills.length < 5) {
      this.jdSuggestions.push('Your key skills section lists fewer than 5 items. Include more technical skills to demonstrate capability.');
    }
    if (this.jdMissingSkills.length > 0) {
      const top3 = this.jdMissingSkills.slice(0, 3).join(', ');
      this.jdSuggestions.push(`Insert missing critical keywords found in the Job Description: "${top3}".`);
    }

    // Social profiles
    if (!this.data.personal.linkedin) {
      this.jdSuggestions.push('Include a LinkedIn profile link. Recruiters look for professional social evidence.');
    }
    if (!this.data.personal.github && (this.targetRole.includes('Developer') || this.targetRole.includes('Engineer'))) {
      this.jdSuggestions.push('For engineering roles, linking a GitHub profile is highly recommended to display your code repositories.');
    }

    // Work experience checks
    if (this.data.employment.length === 0) {
      this.jdSuggestions.push('Your work experience is empty. Add previous jobs, training records, or internships.');
    } else {
      const emptyDesc = this.data.employment.some(e => !e.responsibilities || e.responsibilities.trim().length < 15);
      if (emptyDesc) {
        this.jdSuggestions.push('Provide bulleted details of your responsibilities and achievements in your experience block.');
      }
    }

    // Projects checks
    if (this.data.projects.length === 0) {
      this.jdSuggestions.push('Add a coding project. Showing off actual codebase projects increases developer matching rates.');
    }

    // References checks
    if (this.data.references.length === 0) {
      this.jdSuggestions.push('Add a professional reference (e.g. trainers or mentors) to validate your technical capability.');
    }
  }

  /* ================= PDF EXPORTER ================= */
  errors: any = {};
  validate() {
    this.errors = {};
    if (!this.data.name || this.data.name.trim().length < 3) {
      this.errors.name = 'Name must be at least 3 characters.';
    }
    if (!this.data.email || !/^\S+@\S+\.\S+$/.test(this.data.email)) {
      this.errors.email = 'Invalid email address format.';
    }
    if (!this.data.phone || !/^\d{10}$/.test(this.data.phone)) {
      this.errors.phone = 'Phone must be a valid 10-digit number.';
    }
    if (this.data.summary.length > 500) {
      this.errors.summary = 'Summary must not exceed 500 characters.';
    }
    return Object.keys(this.errors).length === 0;
  }

  async downloadPDF() {
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
}
