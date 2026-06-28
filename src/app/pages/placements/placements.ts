// Verified Placements Component
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal';
import { Job, JobService } from '../../services/job';
import { AuthService } from '../../features/auth/services/auth.service';
@Component({
  selector: 'app-placements',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './placements.html',
  styleUrl: './placements.css',
})
export class Placements implements OnInit {
  goToJobDetail(id: number) {
    this.router.navigate(['/jobs', id]);
  }
  loading = true;
  placedStudents = 0;
  hiringCompanies = 0;
  successRate = 95;
  interviewsScheduled = 0;
  recentPlacements: Job[] = [];
  companies: any[] = [];
  process = [
    {
      step: '01',
      title: 'Skill Development',
      desc: 'Industry-level training with real-time projects and coding practice.',
      icon: 'fa-laptop-code',
      route: '/explore-tracks',
      glowClass: 'bg-glow-blue',
      iconClass: 'blue'
    },
    {
      step: '02',
      title: 'Resume Building',
      desc: 'Professional ATS-friendly resumes aligned with company hiring.',
      icon: 'fa-file-invoice',
      route: '/resume',
      glowClass: 'bg-glow-cyan',
      iconClass: 'cyan'
    },
    {
      step: '03',
      title: 'Mock Interviews',
      desc: 'Technical + HR interview simulations with expert feedback.',
      icon: 'fa-comments',
      route: '/preparation',
      glowClass: 'bg-glow-violet',
      iconClass: 'violet'
    },
    {
      step: '04',
      title: 'Placement Support',
      desc: 'Daily job updates and continuous placement guidance.',
      icon: 'fa-briefcase',
      route: '/jobs',
      glowClass: 'bg-glow-emerald',
      iconClass: 'emerald'
    }
  ];
  highlights = [
    'Daily Real-Time Job Updates',
    'Direct Apply Links',
    'Mock Interviews',
    'Resume Reviews',
    'Live Coding Sessions',
    'HR Preparation',
    'GitHub Portfolio Guidance',
    'Career Mentorship'
  ];
  constructor(
    private jobService: JobService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private router: Router,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
    this.loadPlacementData();
  }
  loadPlacementData() {
    this.loading = true;
    this.jobService.getAdvanced({ size: 40 }, 0).subscribe({
      next: (res) => {
        this.processLoadedPlacementJobs(res.content || []);
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  private processLoadedPlacementJobs(rawJobs: Job[]) {
    // Clean and normalize jobs first
    const cleanedJobs = rawJobs.map(job => {
      let skillArr: string[] = [];
      const skillsVal: any = job.skills;
      if (skillsVal) {
        if (Array.isArray(skillsVal)) {
          skillArr = skillsVal.map((s: string) => s.trim());
        } else {
          skillArr = skillsVal.toString().split(',').map((s: string) => s.trim());
        }
      }
      return {
        ...job,
        companyName: job.companyName || 'Unknown',
        skills: skillArr
      };
    });

    this.placedStudents = Math.max(180, cleanedJobs.length * 12);
    this.interviewsScheduled = Math.max(600, cleanedJobs.length * 40);
    
    const dbCompanyCount = new Set(cleanedJobs.map(j => j.companyName)).size;
    this.hiringCompanies = Math.max(45, dbCompanyCount * 3);

    const retrievedCompanies = [...new Set(cleanedJobs.map(j => j.companyName))].filter(Boolean);
    const defaultPartners = ['Google Partner', 'Amazon Direct', 'Deloitte', 'Cognizant', 'Accenture', 'TCS', 'Infosys', 'Capgemini'];
    const allCompanies = [...new Set([...retrievedCompanies, ...defaultPartners])];
    this.companies = allCompanies.map(name => ({ name }));

    // Filter to prefer unique companies first
    const distinctJobs: Job[] = [];
    const seenCompanies = new Set<string>();
    for (const job of cleanedJobs) {
      const company = job.companyName.trim().toLowerCase();
      if (company && company !== 'unknown' && !seenCompanies.has(company)) {
        seenCompanies.add(company);
        job.title = this.cleanJobTitle(job.title, job.companyName);
        distinctJobs.push(job);
      }
    }

    // Fill remaining slots up to 6 with other listings (duplicates are allowed if unique ones are fewer than 6)
    if (distinctJobs.length < 6) {
      for (const job of cleanedJobs) {
        if (!distinctJobs.some(j => j.id === job.id)) {
          job.title = this.cleanJobTitle(job.title, job.companyName);
          distinctJobs.push(job);
        }
        if (distinctJobs.length >= 6) break;
      }
    }

    this.recentPlacements = distinctJobs.slice(0, 6);

    this.loading = false;
    this.cd.detectChanges();
  }
  openEnrollModal() {
    this.modalService.open({
      course: 'Placement Assistance Program'
    });
  }
  goToJobsHome() {
    this.router.navigate(['/jobs-home']);
  }
  goToJobs() {
    this.handleJobsNavigation();
  }
  private handleJobsNavigation() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/jobs']);
    } else {
      this.router.navigate(['/jobs-home']);
    }
  }
  getCompanyLogo(company: string | undefined): string {
    if (!company) {
      return 'https://ui-avatars.com/api/?name=?';
    }
    const clean = company
      .toLowerCase()
      .replace(/\s+/g, '');
    return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
  }
  onImgError(event: any) {
    event.target.src =
      'https://ui-avatars.com/api/?name=Company';
  }
  cleanJobTitle(title: string, companyName?: string): string {
    if (!title) return '';
    let t = title.replace(/_/g, ' ');
    
    // Remove typical code prefixes (e.g. 2024, MS, EDE3, XC, SRE, etc.)
    const words = t.split(' ');
    const cleanWords = words.filter(word => {
      const upper = word.toUpperCase();
      if (/^\d+$/.test(word)) return false;
      if (['EDE3', 'XC', 'MS', 'IN', 'EDE', 'TS', 'IN_'].includes(upper)) return false;
      return true;
    });
    
    let result = cleanWords.join(' ').trim();
    if (!result) {
      result = t;
    }
    
    if (companyName) {
      const escCompany = companyName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escCompany + '\\b', 'gi');
      result = result.replace(regex, '');
      
      const parts = companyName.split(/\s+/);
      if (parts.length > 1) {
        parts.forEach(part => {
          if (part.length > 2) {
            const partRegex = new RegExp('\\b' + part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
            result = result.replace(partRegex, '');
          }
        });
      }
    }

    result = result.replace(/^[\s\-\/\\\|]+|[\s\-\/\\\|]+$/g, '').trim();
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    return result
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim() || title;
  }

  getPostedAgo(postedAt: string): string {
    if (!postedAt) return 'Recently';
    const safe = postedAt.split('.')[0];
    const diff =
      Date.now() - new Date(safe).getTime();
    const days = Math.floor(
      diff / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }
}