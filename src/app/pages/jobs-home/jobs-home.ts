import { ChangeDetectorRef, Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Job, JobService } from '../../services/job';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mode } from 'fs';
import { ModalService } from '../../services/modal';
@Component({
  selector: 'app-jobs-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs-home.html',
  styleUrl: './jobs-home.css',
})
export class JobsHome {
  jobs: Job[] = [];
  companies: any[] = [];
  searchText = '';
  selectedLocation = '';
  experience = '';
  totalJobs = 0;
  isLoading = true;
  skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  suggestions: string[] = [];
  allSuggestions: string[] = [
    'Java', 'Angular', 'React', 'Python', 'Fresher', 'Remote'
  ];

  // Live scraper logs for premium hero section console
  liveScrapeLogs = [
    'Connected to Razorpay board - imported 4 new roles (Bengaluru)',
    'Verified 2 Frontend Lead openings at Groww (Bengaluru)',
    'Crawl node connected to InMobi Greenhouse board - 2 new jobs',
    'Imported 3 Technical Architect roles at Postman (Bengaluru/Remote)',
    'Verified 1 Engineering Manager position at CRED (Pune)',
    'Crawl node checked Meesho Lever board - 3 new jobs',
    'Imported 2 Backend Developer roles at Zeta (Bengaluru)',
    'Crawl node connected to Coinbase - 1 new job',
    'Purged 2 expired roles from index'
  ];
  currentLiveLog = '';
  liveLogIndex = 0;
  private logInterval: any;

  constructor(
    private jobService: JobService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private modalService: ModalService
  ) { }
  ngOnInit() {
    this.loadJobs();
    this.loadFilters();

    this.currentLiveLog = this.liveScrapeLogs[0];
    this.logInterval = setInterval(() => {
      this.liveLogIndex = (this.liveLogIndex + 1) % this.liveScrapeLogs.length;
      this.currentLiveLog = this.liveScrapeLogs[this.liveLogIndex];
      this.cd.detectChanges();
    }, 4000);
  }
  ngOnDestroy() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
  }
  cleanJobTitle(title: string, companyName?: string): string {
    if (!title) return '';
    let t = title.replace(/_/g, ' ');
    
    // Remove typical code prefixes (e.g. 2024, MS, EDE3, XC, SRE, etc.)
    const words = t.split(' ');
    const cleanWords = words.filter(word => {
      const upper = word.toUpperCase();
      // Remove pure numbers
      if (/^\d+$/.test(word)) return false;
      // Remove common scrape tags and tracking codes
      if (['EDE3', 'XC', 'MS', 'IN', 'EDE', 'TS', 'IN_'].includes(upper)) return false;
      return true;
    });
    
    let result = cleanWords.join(' ').trim();
    if (!result) {
      result = t;
    }
    
    // Remove company name if repeating in title to avoid redundancy
    if (companyName) {
      const escCompany = companyName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escCompany + '\\b', 'gi');
      result = result.replace(regex, '');
      
      // Also remove parts of the company name if it has spaces
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

    // Clean up trailing/leading dashes, slashes, or spaces
    result = result.replace(/^[\s\-\/\\\|]+|[\s\-\/\\\|]+$/g, '').trim();
    // Split camel case if any
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Title Case Capitalization
    return result
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim() || title;
  }

  loadJobs() {
    this.isLoading = true;
    this.jobService.getAdvanced({ size: 40 }, 0).subscribe(res => {
      this.processLoadedJobs(res.content || []);
      this.totalJobs = res.totalElements;
    });
  }

  private processLoadedJobs(allJobs: Job[]) {
    // Clean and normalize jobs first
    const cleanedJobs = allJobs.map(job => {
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

    // Filter to prefer unique companies first
    const uniqueCompanyJobs: Job[] = [];
    const seenCompanies = new Set<string>();
    
    for (const job of cleanedJobs) {
      const company = job.companyName.trim().toLowerCase();
      if (company && company !== 'unknown' && !seenCompanies.has(company)) {
        seenCompanies.add(company);
        
        // Apply title cleaning
        job.title = this.cleanJobTitle(job.title, job.companyName);
        
        uniqueCompanyJobs.push(job);
      }
    }

    // Fill remaining slots up to 6 with other listings (duplicates are allowed if unique ones are fewer than 6)
    if (uniqueCompanyJobs.length < 6) {
      for (const job of cleanedJobs) {
        if (!uniqueCompanyJobs.some(j => j.id === job.id)) {
          job.title = this.cleanJobTitle(job.title, job.companyName);
          uniqueCompanyJobs.push(job);
        }
        if (uniqueCompanyJobs.length >= 6) break;
      }
    }

    this.jobs = uniqueCompanyJobs.slice(0, 6);
    this.isLoading = false;
    this.cd.detectChanges();
  }
  trendingSkills: { name: string; count: number; icon: string; color: string }[] = [];
  testimonials = [
    {
      quote: "The daily job feed completely transformed my search. Found a remote developer opening updated that very morning and received a callback in 48 hours!",
      author: "Anirudh K.",
      role: "Placed at Tech Mahindra",
      initials: "AK",
      rating: 5,
      avatarColor: 'indigo'
    },
    {
      quote: "No spam, direct application links, and updated daily. Excellent portal for graduates wanting to transition to tech hub roles in Bangalore.",
      author: "Shruti S.",
      role: "Placed at Deloitte India",
      initials: "SS",
      rating: 5,
      avatarColor: 'pink'
    }
  ];

  loadFilters() {
    this.jobService.getFilters().subscribe(res => {
      this.companies = res.companies || [];
      
      const rawSkills = res.skills || [];
      const topSkills = [...rawSkills]
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      const fallbackSkills = [
        { name: 'Angular', count: 12 },
        { name: 'React', count: 15 },
        { name: 'Spring Boot', count: 18 },
        { name: 'Python', count: 10 },
        { name: 'AWS', count: 8 }
      ];
      
      const skillsSource = topSkills.length ? topSkills : fallbackSkills;
      
      this.trendingSkills = skillsSource.map((s: any) => {
        const style = this.getIconAndColorForSkill(s.name);
        return {
          name: s.name,
          count: s.count,
          icon: style.icon,
          color: style.color
        };
      });

      this.cd.detectChanges();
    });
  }

  getIconAndColorForSkill(name: string): { icon: string; color: string } {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('angular')) {
      return { icon: 'bi-code-slash', color: 'text-coral' };
    }
    if (lowercaseName.includes('react')) {
      return { icon: 'bi-braces', color: 'text-sky' };
    }
    if (lowercaseName.includes('spring') || lowercaseName.includes('boot')) {
      return { icon: 'bi-terminal', color: 'text-emerald' };
    }
    if (lowercaseName.includes('python')) {
      return { icon: 'bi-server', color: 'text-amber' };
    }
    if (lowercaseName.includes('aws') || lowercaseName.includes('cloud')) {
      return { icon: 'bi-cloud', color: 'text-pink' };
    }
    if (lowercaseName.includes('java') && !lowercaseName.includes('script')) {
      return { icon: 'bi-cup-hot', color: 'text-primary' };
    }
    if (lowercaseName.includes('node') || lowercaseName.includes('express')) {
      return { icon: 'bi-node-plus', color: 'text-success' };
    }
    return { icon: 'bi-hash', color: 'text-muted' };
  }
  goToJobs() {
    this.router.navigate(['/jobs'], {
      queryParams: {
        search: this.searchText,
        location: this.selectedLocation,
        exp: this.experience
      }
    });
  }
  quickSearch(skill: string) {
    this.searchText = skill;
    this.goToJobs();
  }
  goToDetail(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/jobs', id]);
  }
  onSearchChange() {
    const val = this.searchText.toLowerCase();
    this.suggestions = this.allSuggestions.filter(s =>
      s.toLowerCase().includes(val)
    );
  }
  selectSuggestion(s: string) {
    this.searchText = s;
    this.suggestions = [];
  }
  getCompanyLogo(company: string | undefined): string {
    if (!company) {
      return 'https://ui-avatars.com/api/?name=?';
    }
    const clean = company.toLowerCase().replace(/\s+/g, '');
    return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
  }
  onImgError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=Company';
  }
  trackById(index: number, job: Job) {
    return job.id;
  }
  activeCourse = signal<'java' | 'python'>('python');
  openEnrollModal() {
    this.modalService.open({
      course: this.activeCourse() === 'java'
        ? 'Java Coming Soon'
        : 'Python Batch'
    });
  }
}