import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, Observable, switchMap, map } from 'rxjs';
import { Job, JobService, PageResponse } from '../../services/job';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs implements OnInit {
  jobs$!: Observable<PageResponse>;
  searchText = '';
  page = 0;
  totalPages = 0;
  loading = true;
  filters = {
    location: [] as string[],
    experience: [] as string[],
    skill: [] as string[],
    company: [] as string[],
    remote: false,
    sort: 'latest',
    date: '', // 🔥 IMPORTANT
    jobType: '',
  };
  selectedFilters: string[] = [];
  activeSegment = 'all';
  manualTab = 'search';

  // 🔥 Premium UI Redesign Features
  viewMode: 'grid' | 'list' = 'grid';
  selectedJob: Job | null = null;
  drawerTab: 'details' | 'company' | 'benefits' | 'apply' = 'details';
  trendingSearches = ['Java', 'React', 'Angular', 'Python', 'Remote', 'Spring Boot', 'Hyderabad', 'Bangalore'];
  isApplying = false;
  applySuccess = false;
  applicantEmail = '';
  applicantName = '';
  trigger$ = new Subject<void>();

  // Horizontal filters state
  activeDropdown: string | null = null;
  toggleDropdown(pane: string) {
    this.activeDropdown = this.activeDropdown === pane ? null : pane;
    this.cd.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.filter-dropdown-container');
    if (!isInsideDropdown) {
      this.activeDropdown = null;
      this.cd.detectChanges();
    }
  }

  // 🔥 Interactive Match Wizard Console & Spotlight
  isMatchingActive = false;
  matchingProgress = 0;
  matchingStatusText = '';
  matchLocation = '';
  matchSkill = '';
  spotlightJobs: Job[] = [];

  // 🔥 Placement Readiness Calculator State
  calculatorExp = 1;
  calculatorSkillsSelected: { [key: string]: boolean } = {
    'Java': true,
    'React': false,
    'Angular': false,
    'Python': false,
    'Spring Boot': true,
    'SQL': true,
    'Docker': false,
    'AWS': false
  };
  calculatorCertifications = false;
  calculatorMockRounds = 0;
  calculatedPlacementScore = 65;

  // 🔥 ATS Resume Scanner Simulator State
  isSimulatingScan = false;
  scanPercentage = 0;
  scanResultScore = 0;
  scanFeedback: string[] = [];

  updateCalculatorScore() {
    let score = 30; // base score
    // Experience factor
    if (this.calculatorExp >= 3) {
      score += 20;
    } else if (this.calculatorExp >= 1) {
      score += 12;
    } else {
      score += 5; // entry level
    }

    // Skills factor
    let skillCount = 0;
    for (const key in this.calculatorSkillsSelected) {
      if (this.calculatorSkillsSelected[key]) {
        skillCount++;
      }
    }
    score += skillCount * 6;

    // Certifications factor
    if (this.calculatorCertifications) {
      score += 15;
    }

    // Mock rounds factor
    if (this.calculatorMockRounds > 0) {
      score += Math.min(this.calculatorMockRounds * 8, 25);
    }

    this.calculatedPlacementScore = Math.min(score, 100);
    this.cd.detectChanges();
  }

  toggleCalculatorSkill(skill: string) {
    this.calculatorSkillsSelected[skill] = !this.calculatorSkillsSelected[skill];
    this.updateCalculatorScore();
  }

  triggerScanSimulation() {
    this.isSimulatingScan = true;
    this.scanPercentage = 0;
    this.cd.detectChanges();

    const interval = setInterval(() => {
      this.scanPercentage += 10;
      if (this.scanPercentage >= 100) {
        clearInterval(interval);
        this.isSimulatingScan = false;

        let skillsCount = 0;
        for (const key in this.calculatorSkillsSelected) {
          if (this.calculatorSkillsSelected[key]) {
            skillsCount++;
          }
        }
        
        // Calculate simulated score based on inputs
        this.scanResultScore = 65 + (skillsCount * 4) + (this.calculatorCertifications ? 8 : 0);
        if (this.scanResultScore > 99) this.scanResultScore = 99;

        this.scanFeedback = [];
        if (!this.calculatorSkillsSelected['Java'] && !this.calculatorSkillsSelected['React']) {
          this.scanFeedback.push('Consider adding core backend (Java/Python) or frontend (React/Angular) libraries.');
        }
        if (!this.calculatorCertifications) {
          this.scanFeedback.push('Include certified cloud competencies (AWS/Azure) to raise index score above 85.');
        }
        if (this.calculatorExp === 0) {
          this.scanFeedback.push('For entry levels, detail project architectures and internship experiences clearly.');
        }
        if (this.scanFeedback.length === 0) {
          this.scanFeedback.push('Optimal keyword configuration! Your resume aligns highly with active listings.');
        }
        this.cd.detectChanges();
      }
      this.cd.detectChanges();
    }, 120);
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

  // Get stable simulated applicant counts
  getApplicantsCount(id: number | undefined): number {
    if (!id) return 15;
    return (id * 17) % 45 + 12;
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

    // Check if it's already formatted
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

    // Strip out existing lpa/L.P.A/LPA markers so we can format it uniformly
    formatted = formatted.replace(/L\.P\.A/gi, '')
                         .replace(/LPA/gi, '')
                         .replace(/lpa/gi, '')
                         .replace(/\s+/g, ' ')
                         .trim();

    // Ensure all numbers in the format have ₹ prefix if they represent values
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
    // Generate simulated salary based on ID & Experience/Title
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

  setDrawerTab(tab: 'details' | 'company' | 'benefits' | 'apply') {
    this.drawerTab = tab;
    this.cd.detectChanges();
  }

  setManualTab(tab: string) {
    this.manualTab = tab;
    this.cd.detectChanges();
  }

  locations = ['India', 'Remote', 'Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon', 'Mumbai', 'Chennai'];
  companies: string[] = [];
  locationsWithCount: { name: string; count: number }[] = [];
  skillsWithCount: { name: string; count: number }[] = [];
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
  totalConfiguredNodes = 39;

  showSort = true;
  showDate = true;
  showLocation = true;
  showRemote = true;
  showCompanyDropdown = true;
  showExperience = true;
  showSkills = true;
  companySearch: string = '';
  companiesWithCount: { name: string; count: number }[] = [];
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private jobService: JobService,
  ) { }
  ngOnInit() {
    console.log('🔥 Jobs Component Loaded');

    this.updateCalculatorScore();

    this.currentLiveLog = this.liveScrapeLogs[0];
    setInterval(() => {
      this.liveLogIndex = (this.liveLogIndex + 1) % this.liveScrapeLogs.length;
      this.currentLiveLog = this.liveScrapeLogs[this.liveLogIndex];
      this.cd.detectChanges();
    }, 4000);

    // ✅ LOAD FILTERS ONLY ONCE
    this.jobService.getFilters().subscribe((res) => {
      console.log('FILTERS RAW:', res);
      this.companiesWithCount = res.companies || [];
      this.companies = this.companiesWithCount.map((c) => c.name);

      this.locationsWithCount = res.locations?.length ? res.locations : [
        { name: 'Bengaluru', count: 0 },
        { name: 'Hyderabad', count: 0 },
        { name: 'Pune', count: 0 },
        { name: 'Noida', count: 0 },
        { name: 'Gurgaon', count: 0 },
        { name: 'Chennai', count: 0 },
        { name: 'Remote', count: 0 }
      ];
      this.skillsWithCount = res.skills?.length ? res.skills : [
        { name: 'Java', count: 0 },
        { name: 'React', count: 0 },
        { name: 'Angular', count: 0 },
        { name: 'Python', count: 0 },
        { name: 'Spring Boot', count: 0 }
      ];
      this.cd.detectChanges();
    });
    // ✅ JOBS STREAM (FIXED PIPELINE)
    this.jobs$ = this.trigger$.pipe(
      debounceTime(200),
      switchMap(() => {
        console.log('🚀 API CALL');
        this.loading = true;
        return this.jobService.getAdvanced(
          {
            search: this.searchText,
            location: this.filters.location,
            skill: this.filters.skill,
            company: this.filters.company,
            experience: this.filters.experience,
            remote: this.filters.remote,
            date: this.filters.date,
            sort: this.filters.sort,
            jobType: this.filters.jobType,
          },
          this.page,
        );
      }),
      // 🔥 HANDLE FALLBACK PROPERLY
      switchMap((res: PageResponse) => {
        console.log('✅ RESPONSE:', res);
        // 👉 if empty + date filter → retry without date
        if (res?.content?.length === 0 && this.filters.date) {
          console.log('⚠️ No jobs with date filter → retry without date');
          return this.jobService.getAdvanced(
            {
              search: this.searchText,
              location: this.filters.location,
              skill: this.filters.skill,
              company: this.filters.company,
              experience: this.filters.experience,
              remote: this.filters.remote,
              date: '', // 🔥 REMOVE DATE
              sort: this.filters.sort,
              jobType: this.filters.jobType,
            },
            this.page,
          );
        }
        return [res]; // 🔥 wrap as observable
      }),
      map((res: PageResponse) => {
        this.loading = false;
        if (!res || !res.content) {
          return {
            content: [],
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
          };
        }
        // ✅ CLEAN DATA
        const cleaned = this.cleanJobs(res.content);
        this.totalJobs = res.totalElements || 0;
        this.totalPages = res.totalPages || 1;
        if (cleaned && cleaned.length > 0) {
          this.spotlightJobs = cleaned.slice(0, 3);
        }
        return {
          ...res,
          content: cleaned,
        };
      }),
    );
    // ✅ INITIAL LOAD
    setTimeout(() => this.trigger$.next(), 0);
  }
  toggleSection(section: string) {
    (this as any)[section] = !(this as any)[section];
  }
  // ===== APPLY BUTTON =====
  applyAll() {
    console.log('🔥 APPLY CLICKED', this.filters);
    this.page = 0;
    this.cd.detectChanges();
    this.trigger$.next();
  }
  // ===== CLEAN =====
  cleanJobs(data: any[]): Job[] {
    return data.map((j) => ({
      ...j,
      companyName: j.companyName || j.company || 'Unknown',
    }));
  }
  // ===== DATE PARSING =====
  parseDate(dateStr: string): number {
    if (!dateStr) return 0;
    // 🔥 fix microseconds issue
    const safe = dateStr.split('.')[0];
    return new Date(safe).getTime();
  }
  // ===== FILTER =====
  toggleFilter(type: string, value: string) {
    if (!value || value === 'Unknown') return;
    const arr = (this.filters as any)[type] as string[];
    if (arr.includes(value)) {
      (this.filters as any)[type] = arr.filter((v: string) => v !== value);
    } else {
      (this.filters as any)[type] = [...arr, value];
    }
    this.updateTags();
    this.applyAll(); // 🔥 AUTO APPLY FOR INSTANT FILTER FEEDBACK
  }

  removeFilterTag(tag: string) {
    this.filters.location = this.filters.location.filter(v => v !== tag);
    this.filters.skill = this.filters.skill.filter(v => v !== tag);
    this.filters.company = this.filters.company.filter(v => v !== tag);
    this.filters.experience = this.filters.experience.filter(v => v !== tag);
    if (tag === 'Remote') this.filters.remote = false;
    if (this.filters.date === tag) this.filters.date = '';
    
    this.updateTags();
    this.applyAll();
  }

  runMatchFinder() {
    if (!this.matchLocation && !this.matchSkill) return;
    this.isMatchingActive = true;
    this.matchingProgress = 0;
    this.matchingStatusText = 'Initializing Vidhura Job Matcher...';
    this.cd.detectChanges();

    const interval = setInterval(() => {
      this.matchingProgress += 10;
      if (this.matchingProgress === 30) {
        this.matchingStatusText = 'Filtering active job listings...';
      } else if (this.matchingProgress === 60) {
        this.matchingStatusText = 'Analyzing matching skills and experiences...';
      } else if (this.matchingProgress === 90) {
        this.matchingStatusText = 'Sorting compatibility weights...';
      } else if (this.matchingProgress >= 100) {
        clearInterval(interval);
        this.isMatchingActive = false;
        
        // Apply matched filters!
        if (this.matchLocation) {
          this.filters.location = [this.matchLocation];
        }
        if (this.matchSkill) {
          this.filters.skill = [this.matchSkill];
        }
        this.updateTags();
        this.applyAll();
      }
      this.cd.detectChanges();
    }, 200);
  }
  get filteredCompanies() {
    if (!this.companySearch) return this.companiesWithCount;
    return this.companiesWithCount.filter((c) =>
      c.name.toLowerCase().includes(this.companySearch.toLowerCase()),
    );
  }
  updateTags() {
    this.selectedFilters = [
      ...this.filters.location,
      ...this.filters.skill,
      ...this.filters.experience,
      ...this.filters.company,
      ...(this.filters.remote ? ['Remote'] : []),
      ...(this.filters.date ? [this.filters.date] : []),
    ];
  }
  clearFilters() {
    this.filters = {
      location: [],
      experience: [],
      skill: [],
      company: [],
      remote: false,
      sort: 'latest',
      date: '',
      jobType: '',
    };
    this.searchText = '';
    this.page = 0;
    this.selectedFilters = [];
    this.activeSegment = 'all';
    this.trigger$.next(); // 🔥 reload fresh data
  }

  setQuickSegment(segment: string) {
    this.activeSegment = segment;
    this.page = 0;

    // Reset segment filters
    this.filters.jobType = '';
    this.filters.experience = this.filters.experience.filter(e => e !== '0');

    if (segment === 'internship') {
      this.filters.jobType = 'Internship';
    } else if (segment === 'walkin') {
      this.filters.jobType = 'Walk-in';
    } else if (segment === 'fresher') {
      this.filters.jobType = 'Fresher';
      if (!this.filters.experience.includes('0')) {
        this.filters.experience.push('0');
      }
    }

    this.updateTags();
    this.applyAll();
  }
  loadFilters() {
    this.jobService.getFilters().subscribe((res) => {
      this.companiesWithCount = res.companies || [];
    });
  }
  // ===== PAGINATION =====
  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.trigger$.next();
    }
  }
  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.trigger$.next();
    }
  }
  pageSize = 15;
  // 🔥 TOTAL JOBS (store from backend)
  totalJobs = 0;
  // 🔥 TOTAL RANGE TEXT
  getStartIndex() {
    return this.page * this.pageSize + 1;
  }
  getEndIndex() {
    return Math.min((this.page + 1) * this.pageSize, this.totalJobs);
  }
  // ===== NAVIGATION =====
  goToDetail(id: number | undefined) {
    if (!id) {
      console.warn('❌ Invalid Job ID:', id);
      return;
    }
    this.router.navigate(['/jobs', id]);
  }
  goToPage(i: number) {
    this.page = i;
    this.trigger$.next();
  }
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
  getVisiblePages(): number[] {
    const range = 2;
    const start = Math.max(0, this.page - range);
    const end = Math.min(this.totalPages, this.page + range + 1);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }
  // ===== UTIL =====
  getCompanyLogo(company: string | undefined): string {
    if (!company || company === 'Unknown') {
      return 'https://ui-avatars.com/api/?name=?&background=2563eb&color=fff';
    }
    const clean = company.toLowerCase().replace(/\s+/g, '');
    // 🔥 2. Fallback (Google favicon API)
    const google = `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
    // 🔥 3. Fallback initials
    const initials = company
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
    return google;
  }
  onLogoError(event: any, company: string) {
    const clean = company?.toLowerCase().replace(/\s+/g, '');
    // 🔁 fallback 1 → google favicon
    if (!event.target.dataset.fallback) {
      event.target.dataset.fallback = '1';
      event.target.src = `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
      return;
    }
    // 🔁 fallback 2 → initials avatar
    const initials = company
      ?.split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
    event.target.src = `https://ui-avatars.com/api/?name=${initials}&background=2563eb&color=fff&bold=true`;
  }
  getPostedAgo(postedAt: string): string {
    if (!postedAt) return 'Recently';
    const diff = Date.now() - new Date(postedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  }

  isPostedToday(postedAt: string): boolean {
    if (!postedAt) return false;
    const diff = Date.now() - new Date(postedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0;
  }

  // ===== NEW PREMIUM HANDLERS =====
  changeViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.cd.detectChanges();
  }

  selectTrendingSearch(term: string) {
    this.searchText = term;
    this.page = 0;
    this.applyAll();
  }

  openQuickView(job: Job, event: Event) {
    event.stopPropagation();
    this.selectedJob = job;
    this.drawerTab = 'details';
    this.applySuccess = false;
    this.isApplying = false;
    this.cd.detectChanges();
  }

  closeQuickView() {
    this.selectedJob = null;
    this.applicantName = '';
    this.applicantEmail = '';
    this.applySuccess = false;
    this.isApplying = false;
    this.cd.detectChanges();
  }

  submitQuickApply(event: Event) {
    event.preventDefault();
    if (!this.applicantName || !this.applicantEmail) return;

    this.isApplying = true;
    this.cd.detectChanges();

    setTimeout(() => {
      this.isApplying = false;
      this.applySuccess = true;
      this.cd.detectChanges();

      // Clear input fields and auto close after a delay
      setTimeout(() => {
        this.closeQuickView();
      }, 2500);
    }, 1200);
  }
}
