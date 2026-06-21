import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Job, JobService } from '../../services/job';
import { ResumeService } from '../../services/resume.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.css',
})
export class JobDetail {
  job$!: Observable<Job | null>;
  activeTab: 'overview' | 'prep' | 'mentors' | 'benefits' | 'compatibility' = 'overview';
  isAnalyzing = false;
  analysisProgress = 0;
  analysisScore = 0;
  analysisFeedback: string[] = [];

  // Resume Upload Scanner State
  isDragOver = false;
  uploadedFileName = '';
  resumeText = '';
  matchedKeywords: string[] = [];
  missingKeywords: string[] = [];
  formattingIssues: string[] = [];
  recommendations: string[] = [];
  isParsing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    public resumeService: ResumeService,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.job$ = this.jobService.getById(id).pipe(
      map((res) => {
        if (!res) return null;
        // 🔥 FIX SKILLS STRING → ARRAY
        return {
          ...res,
          skills: res.skills
            ? (res.skills as any)
              .toString()
              .split(',')
              .map((s: string) => s.trim())
            : [],
        };
      }),
    );
  }

  setTab(tab: 'overview' | 'prep' | 'mentors' | 'benefits' | 'compatibility') {
    this.activeTab = tab;
  }

  // Determine a stable company rating based on company name
  getCompanyRating(company: string | undefined): string {
    if (!company || company === 'Unknown') return '4.1';
    let sum = 0;
    for (let i = 0; i < company.length; i++) {
      sum += company.charCodeAt(i);
    }
    return (4.0 + (sum % 9) / 10).toFixed(1);
  }

  // Get stable simulated profile match score
  getMatchScore(title: string | undefined): number {
    if (!title) return 88;
    let sum = 0;
    for (let i = 0; i < title.length; i++) {
      sum += title.charCodeAt(i);
    }
    return 85 + (sum % 14);
  }

  formatSalaryValue(salary: string | undefined): string {
    if (!salary || salary === 'Not Disclosed' || salary.toLowerCase() === 'salary not disclosed') {
      return '₹3.0 - ₹6.0 L.P.A';
    }

    if (salary.toLowerCase().includes('l.p.a') && !salary.includes('000') && !salary.includes(',')) {
      return salary;
    }

    const numRegex = /\d[\d,]*/g;
    const matches = salary.match(numRegex);
    if (!matches || matches.length === 0) {
      return salary;
    }

    let formatted = salary;
    for (const match of matches) {
      const cleanNumStr = match.replace(/,/g, '');
      const num = parseFloat(cleanNumStr);
      if (!isNaN(num) && num >= 100000) {
        const lpa = Math.floor((num / 1000000) * 10) / 10;
        formatted = formatted.replace(match, `${lpa}`);
      }
    }

    formatted = formatted.replace(/L\.P\.A/gi, '')
      .replace(/LPA/gi, '')
      .replace(/lpa/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (formatted.includes(' - ') && !formatted.includes(' - ₹')) {
      formatted = formatted.replace(' - ', ' - ₹');
    }

    if (!formatted.startsWith('₹')) {
      formatted = '₹' + formatted;
    }

    return `${formatted} L.P.A`;
  }

  getSimulatedSalary(job: Job): string {
    if (job.salary && job.salary !== 'Not Disclosed' && job.salary.toLowerCase() !== 'salary not disclosed' && job.salary.trim() !== '') {
      return this.formatSalaryValue(job.salary);
    }
    const id = job.id || 1;
    const title = (job.title || '').toLowerCase();
    let min = 6;
    let max = 12;
    if (title.includes('senior') || title.includes('sr') || title.includes('lead')) {
      min = 14 + (id % 5);
      max = 24 + (id % 8);
    } else if (title.includes('intern')) {
      return `₹25,000 - ₹45,000 / month`;
    } else if (title.includes('junior') || title.includes('fresher') || (job.experience && job.experience.startsWith('0'))) {
      min = 4 + (id % 3);
      max = 7 + (id % 4);
    } else {
      min = 8 + (id % 4);
      max = 14 + (id % 6);
    }
    return `₹${min}.0 - ₹${max}.0 L.P.A`;
  }

  runCompatibilityTest(title: string | undefined) {
    this.isAnalyzing = true;
    this.analysisProgress = 0;

    const interval = setInterval(() => {
      this.analysisProgress += 10;
      if (this.analysisProgress >= 100) {
        clearInterval(interval);
        this.isAnalyzing = false;

        // Calculate simulated score based on title
        this.analysisScore = this.getMatchScore(title);

        this.analysisFeedback = [
          'Excellent keyword alignment in core required technologies.',
          'Optimal structure detected matching target ATS parameters.',
          'Recommendation: Explicitly add 2+ bullet points on modern cloud deployment to achieve a 95%+ match score.'
        ];
      }
    }, 120);
  }

  // 🔥 APPLY BUTTON FIX
  openApply(link?: string) {
    if (!link || link === '#') {
      alert('No apply link available');
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  getPostedAgo(postedAt: string): string {
    if (!postedAt) return 'Recently';
    const safe = postedAt.split('.')[0]; // 🔥 fix microseconds bug
    const diff = Date.now() - new Date(safe).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  // Resume Upload Event Handlers
  async onFileSelected(event: any, job: Job) {
    const file = event.target.files[0];
    if (!file) return;
    await this.processResumeFile(file, job);
  }

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

  async onDrop(event: DragEvent, job: Job) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      await this.processResumeFile(file, job);
    }
  }

  async processResumeFile(file: File, job: Job) {
    this.isParsing = true;
    this.uploadedFileName = file.name;
    const fileName = file.name.toLowerCase();

    try {
      let text = '';
      if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.resumeService.extractTextFromPdf(arrayBuffer);
      } else if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.resumeService.extractTextFromDocx(arrayBuffer);
      } else if (fileName.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        text = this.resumeService.extractTextFromDoc(arrayBuffer);
      } else if (fileName.endsWith('.odt') || fileName.endsWith('.odf')) {
        const arrayBuffer = await file.arrayBuffer();
        text = await this.resumeService.extractTextFromOdt(arrayBuffer);
      } else {
        // Plain text file (e.g. .txt, .md, .json)
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read text file'));
          reader.readAsText(file);
        });
      }

      this.resumeText = text;
      this.isParsing = false;

      // Run matching scorer analysis
      this.runMatchingAnalysis(text, job);

    } catch (err: any) {
      this.isParsing = false;
      this.uploadedFileName = '';
      alert(err.message || 'Error parsing the document. Please try a different format.');
    }
  }

  getJobKeywords(job: Job): string[] {
    const list = new Set<string>();

    // 1. Add skills from job.skills
    if (job.skills && job.skills.length > 0) {
      job.skills.forEach(s => {
        if (s && s.trim()) list.add(s.trim());
      });
    }

    // 2. Scan job title and description for common tech keywords
    const searchSource = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    const commonTechList = [
      'Java', 'Spring Boot', 'Spring', 'Hibernate', 'Microservices', 'REST API', 'APIs',
      'Angular', 'React', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind',
      'Python', 'Django', 'Flask', 'FastAPI', 'Machine Learning', 'AI', 'Data Science',
      'C++', 'C#', '.NET', 'ASP.NET', 'Go', 'Golang', 'Rust', 'PHP', 'Ruby', 'Rails',
      'SQL', 'MySQL', 'PostgreSQL', 'Postgres', 'MongoDB', 'Redis', 'Oracle', 'NoSQL',
      'AWS', 'Azure', 'GCP', 'Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform',
      'Git', 'GitHub', 'Linux', 'DevOps', 'Agile', 'Scrum', 'Testing', 'QA', 'Selenium'
    ];

    commonTechList.forEach(tech => {
      const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escaped + '\\b', 'i');
      if (regex.test(searchSource)) {
        list.add(tech);
      }
    });

    return Array.from(list);
  }

  runMatchingAnalysis(resumeText: string, job: Job) {
    this.isAnalyzing = true;
    this.analysisProgress = 0;

    const interval = setInterval(() => {
      this.analysisProgress += 10;
      if (this.analysisProgress >= 100) {
        clearInterval(interval);
        this.isAnalyzing = false;

        const lowerResume = resumeText.toLowerCase();

        // 1. Skill Matches (50% score weight)
        const requiredSkills = this.getJobKeywords(job);
        this.matchedKeywords = [];
        this.missingKeywords = [];

        requiredSkills.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill) {
            const escaped = cleanSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp('\\b' + escaped + '(s|es)?\\b', 'i');
            if (regex.test(lowerResume)) {
              this.matchedKeywords.push(cleanSkill);
            } else {
              this.missingKeywords.push(cleanSkill);
            }
          }
        });

        let skillsScore = 0;
        if (requiredSkills.length > 0) {
          skillsScore = (this.matchedKeywords.length / requiredSkills.length) * 50;
        } else {
          skillsScore = 40;
        }

        // 2. Job Title Matches (20% score weight)
        const jobTitle = (job.title || '').toLowerCase();
        const stopWords = ['senior', 'sr', 'junior', 'jr', 'lead', 'developer', 'engineer', 'intern', 'executive', 'role', 'specialist', 'associate', 'hiring', 'immediate', 'ii', 'iii', 'staff', 'principal'];
        const titleKeywords = jobTitle.split(/[\s\-/]+/).filter(w => w.length > 2 && !stopWords.includes(w));

        let titleMatches = 0;
        titleKeywords.forEach(kw => {
          if (lowerResume.includes(kw)) {
            titleMatches++;
          }
        });

        let titleScore = 20;
        if (titleKeywords.length > 0) {
          titleScore = (titleMatches / titleKeywords.length) * 20;
        }

        // 3. Contextual Keyword matches (30% score weight)
        const rawDesc = (job.description || '').toLowerCase().replace(/<[^>]*>/g, ' ');
        const commonTech = ['javascript', 'typescript', 'angular', 'react', 'vue', 'nodejs', 'python', 'java', 'springboot', 'aws', 'docker', 'kubernetes', 'cloud', 'git', 'sql', 'mongodb', 'rest api', 'microservices', 'html', 'css', 'ci/cd', 'agile', 'scrum'];
        let descKeywords = commonTech.filter(tech => rawDesc.includes(tech));

        let descMatches = 0;
        descKeywords.forEach(kw => {
          if (lowerResume.includes(kw)) {
            descMatches++;
          }
        });

        let descScore = 30;
        if (descKeywords.length > 0) {
          descScore = (descMatches / descKeywords.length) * 30;
        }

        const totalRaw = skillsScore + titleScore + descScore;
        this.analysisScore = Math.min(100, Math.max(15, Math.round(totalRaw)));

        // 4. Formatting checks
        this.formattingIssues = [];
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
        if (!emailRegex.test(lowerResume)) {
          this.formattingIssues.push('Contact email address not found in resume text.');
        }

        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/;
        if (!phoneRegex.test(lowerResume)) {
          this.formattingIssues.push('Phone number is missing or format is unrecognized.');
        }

        const fileExt = this.uploadedFileName.split('.').pop()?.toLowerCase();
        if (fileExt !== 'pdf' && fileExt !== 'docx') {
          this.formattingIssues.push(`Resume format (.${fileExt}) might not parse well on all ATS systems. PDF or DOCX is recommended.`);
        }

        // 5. Actions & Feedback suggestions
        this.recommendations = [];
        if (this.missingKeywords.length > 0) {
          this.recommendations.push(`Incorporate these missing required competencies: ${this.missingKeywords.slice(0, 3).join(', ')}.`);
        }

        if (titleMatches === 0 && titleKeywords.length > 0) {
          this.recommendations.push(`Explicitly mention target title keyword "${titleKeywords[0]}" in your profile summary.`);
        }

        if (this.formattingIssues.length > 0) {
          this.recommendations.push('Fix highlighted contact information omissions to prevent automated parser failures.');
        }

        if (this.analysisScore >= 75) {
          this.recommendations.push('Excellent keyword density. Tailor your project accomplishments with action verbs before applying.');
        } else {
          this.recommendations.push('Consider optimizing resume bullet points by matching them with the role description requirements.');
        }
      }
    }, 120);
  }

  resetScanner() {
    this.analysisScore = 0;
    this.uploadedFileName = '';
    this.resumeText = '';
    this.matchedKeywords = [];
    this.missingKeywords = [];
    this.formattingIssues = [];
    this.recommendations = [];
    this.analysisProgress = 0;
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }
}