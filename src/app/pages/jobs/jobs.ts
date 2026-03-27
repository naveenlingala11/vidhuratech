import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  };

  selectedFilters: string[] = [];

  trigger$ = new Subject<void>();

  locations = ['India', 'Remote', 'USA', 'UK', 'Bangalore', 'Hyderabad', 'Pune'];

  companies: string[] = [];
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
  ) {}

  ngOnInit() {
    console.log('🔥 Jobs Component Loaded');

    // ✅ LOAD FILTERS ONLY ONCE
    this.jobService.getFilters().subscribe((res) => {
      console.log('COMPANIES RAW:', res.companies);

      this.companiesWithCount = res.companies || [];
      this.companies = this.companiesWithCount.map((c) => c.name);

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
      // 🔥 create new array (VERY IMPORTANT)
      (this.filters as any)[type] = [...arr, value];
    }

    this.updateTags();
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
    };

    this.searchText = '';
    this.page = 0;

    this.selectedFilters = [];

    this.trigger$.next(); // 🔥 reload fresh data
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
}
