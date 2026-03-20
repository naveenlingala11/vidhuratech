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

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume {
  /* ================= CORE STATE ================= */
  selectedTemplate = 'template6';
  activeSection = 'summary';
  dragIndex = -1;
  profileScore = 0;

  /* ================= SKILLS SYSTEM ================= */
  allSkills: string[] = [
    'Java',
    'Spring Boot',
    'Angular',
    'React',
    'Node.js',
    'SQL',
    'MongoDB',
    'Microservices',
    'REST API',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'Jenkins',
    'Python',
    'C',
    'C++',
    'Data Structures',
    'Algorithms',
    'DevOps',
    'Machine Learning',
    'Linux',
    'GraphQL',
    'Redux',
    'Next.js',
    'Azure',
    'Firebase',
    'Testing',
    'JUnit',
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
  ];

  /* ================= MAIN DATA ================= */
  data = {
    name: '',
    email: '',
    phone: '',
    photo: '',
    headline: '',
    summary: '',

    employment: <Employment[]>[
      {
        company: '',
        role: '',
        location: '',
        start: '',
        end: '',
        current: false,
        responsibilities: '',
      },
    ],

    projects: <Project[]>[{ title: '', tech: '', role: '', link: '', desc: '' }],

    education: <Education[]>[{ degree: '', college: '', year: '' }],

    personal: {
      dob: '',
      gender: '',
      address: '',
      nationality: '',
      linkedin: '',
      github: '',
    },
  };

  /* ================= SECTION ================= */
  setSection(id: string) {
    this.activeSection = id;
  }

  /* ================= DRAG ================= */
  onDragStart(i: number) {
    this.dragIndex = i;
  }

  onDrop(i: number) {
    const moved = this.sections.splice(this.dragIndex, 1)[0];
    this.sections.splice(i, 0, moved);
  }

  /* ================= SKILLS ================= */
  onSkillInput() {
    this.filteredSkills = this.allSkills.filter(
      (s) =>
        s.toLowerCase().includes(this.skillInput.toLowerCase()) && !this.selectedSkills.includes(s),
    );
  }

  addSkill(skill: string) {
    if (this.selectedSkills.length >= this.maxSkills) {
      alert('Max 25 skills allowed');
      return;
    }
    this.selectedSkills.push(skill);
    this.skillInput = '';
    this.filteredSkills = [];
    this.updateScore();
  }

  removeSkill(i: number) {
    this.selectedSkills.splice(i, 1);
    this.updateScore();
  }

  /* ================= LANGUAGES ================= */
  toggleLanguage(lang: string) {
    if (this.selectedLanguages.includes(lang)) {
      this.selectedLanguages = this.selectedLanguages.filter((l) => l !== lang);
    } else {
      this.selectedLanguages.push(lang);
    }
  }

  /* ================= ADD / REMOVE ================= */
  addItem(type: 'employment' | 'projects' | 'education') {
    if (type === 'employment') {
      this.data.employment.push({
        company: '',
        role: '',
        location: '',
        start: '',
        end: '',
        current: false,
        responsibilities: '',
      });
    }

    if (type === 'projects') {
      this.data.projects.push({
        title: '',
        tech: '',
        role: '',
        link: '',
        desc: '',
      });
    }

    if (type === 'education') {
      this.data.education.push({
        degree: '',
        college: '',
        year: '',
      });
    }

    this.updateScore();
  }

  removeItem(type: 'employment' | 'projects' | 'education', i: number) {
    this.data[type].splice(i, 1);
    this.updateScore();
  }

  /* ================= PHOTO ================= */
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

  /* ================= SCORE ================= */
  updateScore() {
    let score = 0;

    if (this.data.summary) score += 10;
    if (this.selectedSkills.length > 3) score += 15;
    if (this.data.projects.length > 0) score += 15;
    if (this.data.employment.length > 0) score += 20;
    if (this.data.education.length > 0) score += 10;
    if (this.data.photo) score += 5;

    this.profileScore = score;
  }

  /* ================= PDF ================= */
  // 🔥 ZOOM CONTROL
  zoomLevel = 1;

  zoomIn() {
    this.zoomLevel += 0.1;
  }

  zoomOut() {
    if (this.zoomLevel > 0.6) this.zoomLevel -= 0.1;
  }

  // 🔥 TEMPLATE LIST
  templates = [
    { id: 'template1', name: 'ATS', color: '#0d6efd' },
    { id: 'template2', name: 'Modern', color: '#6f42c1' },
    { id: 'template3', name: 'Sidebar', color: '#198754' },
    { id: 'template4', name: 'Creative', color: '#fd7e14' },
    { id: 'template5', name: 'Corporate', color: '#343a40' },
  ];

  // 🔥 REAL PDF DOWNLOAD
  async downloadPDF() {
    if (!this.validate()) {
      alert('Please fix errors before downloading');
      return;
    }

    if (typeof window === 'undefined') return;

    const element = document.getElementById('preview');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;

    html2pdf()
      .set({
        margin: 0,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save();
  }

  errors: any = {};

  validate() {
    this.errors = {};

    if (!this.data.name || this.data.name.length < 3) {
      this.errors.name = 'Name must be at least 3 characters';
    }

    if (!this.data.email || !/^\S+@\S+\.\S+$/.test(this.data.email)) {
      this.errors.email = 'Invalid email';
    }

    if (!this.data.phone || !/^\d{10}$/.test(this.data.phone)) {
      this.errors.phone = 'Phone must be 10 digits';
    }

    if (this.data.summary.length > 300) {
      this.errors.summary = 'Max 300 characters';
    }

    return Object.keys(this.errors).length === 0;
  }

  getDuration(start: string, end: string) {
    if (!start || !end) return '';

    const s = new Date(start);
    const e = new Date(end);

    const years = e.getFullYear() - s.getFullYear();
    const months = e.getMonth() - s.getMonth();

    return `${years}y ${months}m`;
  }

  /* ================= AI ================= */
  aiRole = '';
  aiExperience = 'Fresher';

  generateAIResume() {
    if (!this.aiRole) {
      alert('Enter role');
      return;
    }

    this.data.summary = `Results-driven ${this.aiRole} with ${this.aiExperience} experience in designing, developing, and optimizing scalable applications. Strong expertise in modern technologies and problem-solving with a focus on performance and quality.`;

    const roleSkills: any = {
      'Java Developer': ['Java', 'Spring Boot', 'Microservices', 'SQL', 'REST API'],
      'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'Angular', 'React'],
      'Full Stack Developer': ['Java', 'Angular', 'Node.js', 'MongoDB'],
    };

    this.selectedSkills = roleSkills[this.aiRole] || ['Problem Solving', 'Communication'];

    this.data.projects = [
      {
        title: `${this.aiRole} Project`,
        tech: this.selectedSkills.join(', '),
        role: 'Developer',
        link: '',
        desc: 'Developed scalable application with modern architecture and optimized performance.',
      },
    ];

    this.data.employment = [
      {
        company: 'ABC Tech',
        role: this.aiRole,
        location: 'India',
        start: '2023',
        end: 'Present',
        current: true,
        responsibilities: 'Developed APIs, optimized performance, collaborated with team.',
      },
    ];

    this.updateScore();
  }

  /* ================= FUTURE READY ================= */
  // 🔥 future: save to backend
  saveResume() {
    console.log('Save to DB (future)');
  }

  // 🔥 future: load resume
  loadResume() {
    console.log('Load from DB (future)');
  }
}
