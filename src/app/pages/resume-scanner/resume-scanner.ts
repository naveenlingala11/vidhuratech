import { Component, inject, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { ResumePreview } from '../../components/resume-preview/resume-preview';

@Component({
  selector: 'app-resume-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResumePreview],
  templateUrl: './resume-scanner.html',
  styleUrl: './resume-scanner.css'
})
export class ResumeScanner implements OnInit {
  public service = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);
  activeMobileTab: string = 'editor';

  // Premium Custom Workspace parameters
  selectedAtsType: string = 'greenhouse';
  selectedIndustry: string = 'tech';
  selectedKeywordCategory: string = 'all';

  // AI Rewriter Assistant parameters
  selectedRewriterKeyword: string = '';
  aiRewriteSuggestions: string[] = [];
  customRewriteText: string = '';
  aiRewriteLoading: boolean = false;

  ngOnInit() {
    this.service.activeTab = 'scanner';
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (body) {
        body.classList.add('resume-page-active');
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.service.showPdfMenu = false;
    this.service.showTemplateDropdown = false;
  }

  togglePdfMenu(event: Event) {
    event.stopPropagation();
    this.service.showPdfMenu = !this.service.showPdfMenu;
  }

  selectTab(tab: string, section?: string) {
    this.service.selectWorkspaceTab(tab, section);
    this.service.showPdfMenu = false;
  }

  /* ================= PRE-OPTIMIZATION & COMPLIANCE METRICS ================= */
  isHardSkill(skill: string): boolean {
    const s = skill.toLowerCase();
    const hardWords = ['angular', 'react', 'node', 'python', 'java', 'typescript', 'c++', 'c#', 'rust', 'go', 'php', 'ruby', 'rxjs', 'html', 'css', 'javascript', 'sql', 'mongodb', 'database', 'rest', 'api', 'development', 'programming', 'engineering', 'frontend', 'backend', 'fullstack', 'architecture', 'swift', 'kotlin', 'flutter'];
    return hardWords.some(w => s.includes(w));
  }

  isSoftSkill(skill: string): boolean {
    const s = skill.toLowerCase();
    const softWords = ['communication', 'leadership', 'agile', 'scrum', 'team', 'collaboration', 'management', 'negotiation', 'problem-solving', 'analytical', 'mentoring', 'organization', 'interpersonal', 'strategic', 'planning', 'creativity', 'adaptability', 'critical thinking'];
    return softWords.some(w => s.includes(w));
  }

  getFilteredMatchedSkills(): string[] {
    const matched = this.service.jdMatchedSkills || [];
    if (this.selectedKeywordCategory === 'all') return matched;
    if (this.selectedKeywordCategory === 'hard') return matched.filter(s => this.isHardSkill(s));
    if (this.selectedKeywordCategory === 'soft') return matched.filter(s => this.isSoftSkill(s));
    if (this.selectedKeywordCategory === 'tools') return matched.filter(s => !this.isHardSkill(s) && !this.isSoftSkill(s));
    return matched;
  }

  getFilteredMissingSkills(): string[] {
    const missing = this.service.jdMissingSkills || [];
    if (this.selectedKeywordCategory === 'all') return missing;
    if (this.selectedKeywordCategory === 'hard') return missing.filter(s => this.isHardSkill(s));
    if (this.selectedKeywordCategory === 'soft') return missing.filter(s => this.isSoftSkill(s));
    if (this.selectedKeywordCategory === 'tools') return missing.filter(s => !this.isHardSkill(s) && !this.isSoftSkill(s));
    return missing;
  }

  getHardSkillsMatch(): number {
    const matched = (this.service.jdMatchedSkills || []).filter(s => this.isHardSkill(s)).length;
    const missing = (this.service.jdMissingSkills || []).filter(s => this.isHardSkill(s)).length;
    const total = matched + missing;
    return total > 0 ? Math.round((matched / total) * 100) : 80;
  }

  getSoftSkillsMatch(): number {
    const matched = (this.service.jdMatchedSkills || []).filter(s => this.isSoftSkill(s)).length;
    const missing = (this.service.jdMissingSkills || []).filter(s => this.isSoftSkill(s)).length;
    const total = matched + missing;
    return total > 0 ? Math.round((matched / total) * 100) : 85;
  }

  getReadabilityScore(): number {
    // Simulated readable layout checks
    let base = 90;
    if (this.service.lineSpacing < 1.1) base -= 5;
    if (this.service.bodySize < 10) base -= 5;
    if (this.service.pageMargin < 20) base -= 5;
    return Math.max(70, Math.min(98, base));
  }

  /* ================= CONTENT AUDIT SYSTEM LOGIC ================= */
  getContactAudit() {
    const data = this.service.data;
    const issues: string[] = [];
    if (!data.name) issues.push('Full name is missing in contact details.');
    else if (data.name.trim().split(/\s+/).length < 2) issues.push('Add both first and last name for professional presentation.');
    
    if (!data.email) issues.push('Email address is missing.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) issues.push('Email address format is invalid.');
    
    if (!data.phone) issues.push('Phone number is missing.');
    else if (data.phone.length < 10) issues.push('Phone number is too short or invalid.');
    
    if (!data.personal?.linkedin) issues.push('LinkedIn URL is missing. Adding it increases recruiter engagement.');
    if (!data.personal?.github) issues.push('GitHub profile link is missing (recommended for developer portfolios).');
    
    return {
      status: issues.length === 0 ? 'good' : (issues.length <= 2 ? 'warning' : 'danger'),
      label: issues.length === 0 ? 'Ready' : (issues.length <= 2 ? 'Needs Work' : 'Critical'),
      issues
    };
  }

  getSummaryAudit() {
    const summary = this.service.data?.summary || '';
    const wordCount = summary.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const issues: string[] = [];
    if (wordCount === 0) {
      issues.push('Profile summary is empty. Add a brief elevator pitch.');
    } else {
      if (wordCount < 20) issues.push('Too brief. A strong summary should be between 20 to 65 words.');
      if (wordCount > 80) issues.push('Too long. Keep it concise (under 80 words) to avoid reader fatigue.');
      
      const actionVerbs = ['developed', 'architected', 'optimized', 'led', 'implemented', 'designed', 'deployed', 'integrated', 'spearheaded', 'managed', 'improved'];
      const textLower = summary.toLowerCase();
      const hasVerb = actionVerbs.some(v => textLower.includes(v));
      if (!hasVerb) issues.push('Add action verbs like "Led", "Architected", or "Optimized" to summary.');
    }

    return {
      status: issues.length === 0 ? 'good' : (wordCount === 0 || issues.length > 1 ? 'danger' : 'warning'),
      label: issues.length === 0 ? 'Ready' : (wordCount === 0 ? 'Empty' : 'Needs Work'),
      issues,
      wordCount
    };
  }

  getExperienceAudit() {
    const items = this.service.data?.employment || [];
    const issues: string[] = [];
    let bulletCount = 0;
    let strongCount = 0;
    let weakCount = 0;
    
    if (items.length === 0) {
      issues.push('No work experience listed. Work history is critical for ATS parsing.');
    } else {
      items.forEach((e: any, idx: number) => {
        const company = e.company || `Company #${idx + 1}`;
        if (!e.role) issues.push(`Role designation is missing for ${company}.`);
        if (!e.start) issues.push(`Start date is missing for ${company}.`);
        if (!e.responsibilities) {
          issues.push(`Responsibilities/accomplishments details are empty for ${company}.`);
        } else {
          const bullets = e.responsibilities.split('\n').filter((l: string) => l.trim().length > 0);
          bulletCount += bullets.length;
          bullets.forEach((b: string) => {
            const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase() || '';
            const strongVerbs = ['developed', 'architected', 'optimized', 'led', 'implemented', 'designed', 'deployed', 'integrated', 'refactored', 'automated', 'streamlined', 'spearheaded', 'mentored', 'delivered', 'built', 'created', 'managed', 'improved', 'reduced', 'increased'];
            const hasVerb = strongVerbs.some(v => firstWord.startsWith(v));
            const hasQuantity = /\d+%|\d+x|\d+\+|\$\d+|reduced|increased|improved/.test(b);
            
            if (hasVerb && hasQuantity) {
              strongCount++;
            } else {
              weakCount++;
            }
          });
        }
      });
      
      if (bulletCount < 3) {
        issues.push('Add more bullet points (at least 3-5 total) to showcase your experience.');
      }
      if (weakCount > 0) {
        issues.push(`${weakCount} bullet point(s) could be strengthened with action verbs and metrics.`);
      }
    }

    return {
      status: issues.length === 0 ? 'good' : (items.length === 0 ? 'danger' : 'warning'),
      label: issues.length === 0 ? 'Ready' : (items.length === 0 ? 'Empty' : 'Needs Work'),
      issues,
      strongCount,
      totalBullets: bulletCount
    };
  }

  getProjectsAudit() {
    const items = this.service.data?.projects || [];
    const issues: string[] = [];
    if (items.length === 0) {
      issues.push('No projects listed. Adding projects demonstrates practical skills.');
    } else {
      items.forEach((p: any, idx: number) => {
        const title = p.title || `Project #${idx + 1}`;
        if (!p.tech) issues.push(`Tech stack is missing for project "${title}".`);
        if (!p.desc) issues.push(`Description is missing for project "${title}".`);
      });
    }

    return {
      status: issues.length === 0 ? 'good' : (items.length === 0 ? 'danger' : 'warning'),
      label: issues.length === 0 ? 'Ready' : (items.length === 0 ? 'Empty' : 'Needs Work'),
      issues
    };
  }

  getSkillsAudit() {
    const skills = this.service.selectedSkills || [];
    const issues: string[] = [];
    if (skills.length === 0) {
      issues.push('Key Skills list is empty. Add core skills to pass keyword parsing filters.');
    } else if (skills.length < 6) {
      issues.push(`Only ${skills.length} skills listed. Add at least 6-10 skills for better matching.`);
    }

    return {
      status: skills.length >= 8 ? 'good' : (skills.length === 0 ? 'danger' : 'warning'),
      label: skills.length >= 8 ? 'Ready' : (skills.length === 0 ? 'Empty' : 'Needs Work'),
      issues
    };
  }

  getEducationAudit() {
    const education = this.service.data?.education || [];
    const issues: string[] = [];
    if (education.length === 0) {
      issues.push('Education details are missing.');
    } else {
      education.forEach((ed: any, idx: number) => {
        const degree = ed.degree || `Education #${idx + 1}`;
        if (!ed.college) issues.push(`College name is missing for "${degree}".`);
        if (!ed.year) issues.push(`Graduation year is missing for "${degree}".`);
      });
    }

    return {
      status: issues.length === 0 ? 'good' : (education.length === 0 ? 'danger' : 'warning'),
      label: issues.length === 0 ? 'Ready' : (education.length === 0 ? 'Empty' : 'Needs Work'),
      issues
    };
  }

  getReadinessGrid() {
    return [
      { name: 'Contact Info', key: 'contact', icon: 'fa-address-card', audit: this.getContactAudit() },
      { name: 'Profile Summary', key: 'summary', icon: 'fa-user-tie', audit: this.getSummaryAudit() },
      { name: 'Key Skills', key: 'skills', icon: 'fa-screwdriver-wrench', audit: this.getSkillsAudit() },
      { name: 'Work Experience', key: 'experience', icon: 'fa-briefcase', audit: this.getExperienceAudit() },
      { name: 'Featured Projects', key: 'projects', icon: 'fa-folder-open', audit: this.getProjectsAudit() },
      { name: 'Education History', key: 'education', icon: 'fa-graduation-cap', audit: this.getEducationAudit() }
    ];
  }

  /* ================= AI REWRITER ASSISTANT SYSTEM ================= */
  selectKeywordForRewriter(keyword: string) {
    this.aiRewriteLoading = true;
    this.selectedRewriterKeyword = keyword;
    this.aiRewriteSuggestions = [];
    this.customRewriteText = '';

    setTimeout(() => {
      const kw = keyword.trim();
      this.aiRewriteSuggestions = [
        `Spearheaded key development modules utilizing ${kw} best practices, yielding a 20% reduction in response latencies.`,
        `Collaborated dynamically in cross-functional agile teams to deploy high-grade ${kw} components, bolstering client retention.`,
        `Leveraged hands-on engineering experience in ${kw} to design, develop, and maintain secure scalable microservices.`
      ];
      this.customRewriteText = this.aiRewriteSuggestions[0];
      this.aiRewriteLoading = false;
      this.cdr.detectChanges();
    }, 350);
  }

  selectSuggestion(suggestion: string) {
    this.customRewriteText = suggestion;
  }

  insertCustomRewrite(destination: 'experience' | 'projects') {
    if (!this.customRewriteText) return;

    if (destination === 'experience') {
      if (this.service.data.employment && this.service.data.employment.length > 0) {
        const responsibilities = this.service.data.employment[0].responsibilities || '';
        const lines = responsibilities.split('\n').filter((l: string) => l.trim().length > 0);
        lines.push(this.customRewriteText);
        this.service.data.employment[0].responsibilities = lines.join('\n');
      } else {
        // Fallback: create an experience entry
        this.service.data.employment = [{
          role: 'Software Engineer',
          company: 'Tech Enterprise',
          location: 'Remote',
          start: '2024-01-01',
          end: '',
          current: true,
          responsibilities: this.customRewriteText
        }];
      }
    } else if (destination === 'projects') {
      if (this.service.data.projects && this.service.data.projects.length > 0) {
        const desc = this.service.data.projects[0].desc || '';
        const lines = desc.split('\n').filter((l: string) => l.trim().length > 0);
        lines.push(this.customRewriteText);
        this.service.data.projects[0].desc = lines.join('\n');
      } else {
        // Fallback: create a project entry
        this.service.data.projects = [{
          title: 'Premium Web App',
          role: 'Lead Developer',
          tech: this.selectedRewriterKeyword || 'TypeScript',
          link: '',
          desc: this.customRewriteText
        }];
      }
    }

    // Auto add keyword to selection to make it count as matched
    if (this.selectedRewriterKeyword && !this.service.selectedSkills.includes(this.selectedRewriterKeyword)) {
      this.service.selectedSkills.push(this.selectedRewriterKeyword);
    }

    // Recalculate match and score
    this.service.scanJdAndResume(false);

    // Reset selection state
    this.selectedRewriterKeyword = '';
    this.aiRewriteSuggestions = [];
    this.customRewriteText = '';
    this.cdr.detectChanges();
  }
}
