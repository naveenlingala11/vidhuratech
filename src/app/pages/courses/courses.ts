import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';
import { BatchService } from '../../features/lms/batch/services/batch';
import { PublicCourseService } from './service/public-course';
import { COURSES } from '../../data/courses.data';

type ViewMode = 'GRID' | 'LIST';
type SortMode = 'FEATURED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'DURATION' | 'TITLE' | 'LIVE';
type PriceFilter = '' | 'FREE' | 'LOW' | 'MID' | 'PREMIUM';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: any[] = [];
  filteredCourses: any[] = [];
  activeCourse: any = null;

  loading = false;
  error = '';
  toast = '';

  keyword = '';
  selectedLevel = '';
  selectedMode = '';
  selectedPrice: PriceFilter = '';
  sortMode: SortMode = 'FEATURED';
  viewMode: ViewMode = 'GRID';

  page = 1;
  pageSize = 6;

  isLoggedIn = false;
  isAdmin = false;

  selectedCurriculum: any = null;
  showCurriculum = false;

  savedCourseIds = new Set<number>();
  compareCourseIds = new Set<number>();
  showComparisonDashboard = false;
  comparisonCourses: any[] = [];

  levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  priceFilters = [
    { label: 'Free', value: 'FREE' },
    { label: 'Under Rs. 5k', value: 'LOW' },
    { label: 'Rs. 5k - 15k', value: 'MID' },
    { label: 'Premium', value: 'PREMIUM' },
  ];

  private authSub?: Subscription;

  constructor(
    private courseService: PublicCourseService,
    private batchService: BatchService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role');
    this.isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    this.authSub = this.auth.authState.subscribe((isLogged) => {
      this.isLoggedIn = isLogged;
      if (this.courses.length) this.attachEnrollmentStatuses();
    });

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.courseService.getCourses(this.isAdmin).subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        const mapped = list.map((c: any) => this.mapCourse(c));

        if (!mapped.length) {
          this.courses = [];
          this.filteredCourses = [];
          this.activeCourse = null;
          this.loading = false;
          return;
        }

        const requests: Observable<any>[] = mapped.map((course: any) =>
          this.batchService.getActiveBatch(course.id).pipe(
            map((batchRes: any) => ({
              ...course,
              batch: batchRes?.data || null,
            })),
            catchError(() => of({ ...course, batch: null })),
          ),
        );

        forkJoin(requests).subscribe({
          next: (courses: any[]) => {
            this.courses = courses;
            this.activeCourse =
              courses.find((c) => c.batch?.status === 'ACTIVE') || courses[0] || null;

            this.attachEnrollmentStatuses();
            this.applyFilters();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load course batches';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Failed to load courses';
        this.loading = false;
      },
    });
  }

  mapCourse(c: any): any {
    let meta: any = {};

    try {
      meta = c.metadataJson ? JSON.parse(c.metadataJson) : {};
    } catch {
      meta = {};
    }

    return {
      id: c.id,
      code: c.code,
      title: c.title,
      desc: c.description || '',
      duration: `${c.durationHours || 0} hrs`,
      durationHours: Number(c.durationHours || 0),
      level: c.level || 'BEGINNER',
      status: c.status,
      price: Number(c.price || 0),
      oldPrice: meta.oldPrice || null,
      discountLabel: meta.discountLabel || '',
      startDate: c.startDate || null,
      endDate: c.endDate || null,
      thumbnailUrl: c.thumbnailUrl,
      slug: this.getCourseSlug(c),
      batch: null,
      isEnrolled: false,
      highlights: Array.isArray(meta.highlights) ? meta.highlights : [],
      syllabus: Array.isArray(meta.syllabus) ? meta.syllabus : [],
      outcomes: Array.isArray(meta.outcomes) ? meta.outcomes : [],
      tools: Array.isArray(meta.tools) ? meta.tools : [],
    };
  }

  attachEnrollmentStatuses(): void {
    const role = localStorage.getItem('role');

    if (!this.auth.isLoggedIn() || role !== 'STUDENT') return;

    this.courses.forEach((course) => {
      if (!course.batch?.id) return;

      this.http
          .get(`${environment.apiUrl}/api/lms/batches/${course.batch.id}/is-enrolled`)
          .subscribe({
            next: (res: any) => {
              course.isEnrolled = !!res?.data;
              this.applyFilters(false);
              this.cdr.detectChanges();
            },
          });
    });
  }

  applyFilters(resetPage = true): void {
    const term = this.keyword.trim().toLowerCase();

    let data = [...this.courses];

    if (term) {
      data = data.filter((c) =>
          [
            c.title,
            c.code,
            c.desc,
            c.level,
            c.batch?.name,
            ...(c.highlights || []),
            ...(c.outcomes || []),
            ...(c.tools || []),
          ]
              .join(' ')
              .toLowerCase()
              .includes(term),
      );
    }

    if (this.selectedLevel) data = data.filter((c) => c.level === this.selectedLevel);

    if (this.selectedMode === 'LIVE') data = data.filter((c) => c.batch?.status === 'ACTIVE');
    if (this.selectedMode === 'UPCOMING') data = data.filter((c) => c.batch?.status !== 'ACTIVE');
    if (this.selectedMode === 'ENROLLED') data = data.filter((c) => c.isEnrolled);

    if (this.selectedPrice) {
      data = data.filter((c) => {
        if (this.selectedPrice === 'FREE') return c.price === 0;
        if (this.selectedPrice === 'LOW') return c.price > 0 && c.price <= 5000;
        if (this.selectedPrice === 'MID') return c.price > 5000 && c.price <= 15000;
        return c.price > 15000;
      });
    }

    data.sort((a, b) => this.sortCourses(a, b));

    this.filteredCourses = data;
    if (resetPage) this.page = 1;
    this.page = Math.min(this.page, this.totalPages);

    if (!this.activeCourse && this.filteredCourses.length) {
      this.activeCourse = this.filteredCourses[0];
    }
  }

  resetFilters(): void {
    this.keyword = '';
    this.selectedLevel = '';
    this.selectedMode = '';
    this.selectedPrice = '';
    this.sortMode = 'FEATURED';
    this.pageSize = 6;
    this.applyFilters();
  }

  setLevel(level: string): void {
    this.selectedLevel = this.selectedLevel === level ? '' : level;
    this.applyFilters();
  }

  setActiveCourse(course: any): void {
    this.activeCourse = course;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSaved(course: any, event?: Event): void {
    event?.stopPropagation();
    this.savedCourseIds.has(course.id)
        ? this.savedCourseIds.delete(course.id)
        : this.savedCourseIds.add(course.id);

    this.showToast(
        this.savedCourseIds.has(course.id) ? 'Saved to shortlist' : 'Removed from shortlist',
    );
  }

  toggleCompare(course: any, event?: Event): void {
    event?.stopPropagation();

    if (!this.compareCourseIds.has(course.id) && this.compareCourseIds.size >= 2) {
      this.showToast('Please select exactly 2 courses to compare');
      return;
    }

    this.compareCourseIds.has(course.id)
        ? this.compareCourseIds.delete(course.id)
        : this.compareCourseIds.add(course.id);
  }

  isSaved(course: any): boolean {
    return this.savedCourseIds.has(course.id);
  }

  isCompared(course: any): boolean {
    return this.compareCourseIds.has(course.id);
  }

  clearCompare(): void {
    this.compareCourseIds.clear();
  }

  openComparisonDashboard(): void {
    if (this.compareCourseIds.size !== 2) {
      this.showToast('Please select exactly 2 courses to compare');
      return;
    }

    const selected = this.courses.filter((c) => this.compareCourseIds.has(c.id));
    this.comparisonCourses = selected.map((course) => {
      const details = this.getCourseCompareDetails(course);
      return {
        ...course,
        compareDetails: details
      };
    });

    this.showComparisonDashboard = true;
  }

  closeComparisonDashboard(): void {
    this.showComparisonDashboard = false;
  }

  getCourseCompareDetails(course: any): any {
    const title = (course?.title || '').toLowerCase();
    const code = (course?.code || '').toLowerCase();

    // 1. DevOps & Cloud
    if (title.includes('devops') || title.includes('aws') || title.includes('cloud') || code.includes('devops') || code.includes('aws')) {
      return {
        pros: [
          'Commands some of the highest salaries in the IT sector due to platform expertise.',
          'Crucial for modern SaaS businesses, bridging developer speed with infrastructure reliability.',
          'Skills are highly transferable across diverse public clouds (AWS, Azure, GCP).'
        ],
        cons: [
          'Broad learning scope requiring understanding of networking, security, OS, and cloud.',
          'High-responsibility role; deployment outages carry significant business risks.'
        ],
        growth: 'Top priority for digital-first enterprises. Cloud adoption and Infrastructure-as-Code (IaC) drives 25% YoY increase in DevOps engineering roles.',
        salary: '₹5.5 LPA - ₹20 LPA (Avg: ₹10.5 LPA)',
        targetRoles: ['DevOps Engineer', 'Cloud Solutions Architect', 'SRE (Site Reliability Engineer)', 'Platform Systems Lead'],
        techStack: ['AWS Cloud', 'Docker Containers', 'Kubernetes Orchestration', 'Terraform IaC', 'GitHub Actions / Jenkins'],
        difficulty: 'Advanced'
      };
    }

    // 2. Java / Spring Boot
    if (title.includes('java') || code.includes('java') || code.includes('spring')) {
      return {
        pros: [
          'Extremely high market demand; cornerstone of enterprise backend applications.',
          'Rich ecosystem with Spring Boot, robust security, and deep database integrations.',
          'Vast community support and long-term career stability in MNCs & tech giants.'
        ],
        cons: [
          'Steep learning curve due to rigid syntax rules and object-oriented boilerplate.',
          'Slower initial setup and execution overhead compared to lighter scripting runtimes.'
        ],
        growth: 'Consistently stable and expanding. Enterprise adoption of microservices architecture and cloud-native systems ensures 15%+ YoY job opening growth.',
        salary: '₹4.5 LPA - ₹16 LPA (Avg: ₹8.5 LPA)',
        targetRoles: ['Java Backend Developer', 'Spring Boot Engineer', 'Enterprise Systems Analyst', 'Software Development Engineer (SDE)'],
        techStack: ['Java 17+', 'Spring Boot Framework', 'Hibernate ORM', 'Microservices Architecture', 'PostgreSQL / Oracle'],
        difficulty: 'Intermediate to Advanced'
      };
    }

    // 3. Python & Data Science
    if (title.includes('python') || code.includes('python') || title.includes('data')) {
      return {
        pros: [
          'Clean, readable syntax that is extremely beginner-friendly and fast to write.',
          'De facto standard language for Data Science, Machine Learning, and GenAI applications.',
          'Vast library ecosystem (Pandas, NumPy, Scikit-Learn) for math and statistical modeling.'
        ],
        cons: [
          'Slower execution speed (interpreted nature) makes it less suitable for high-performance systems.',
          'Dynamic typing can lead to runtime issues in large-scale enterprise deployments if untested.'
        ],
        growth: 'Explosive growth due to the Generative AI and Big Data wave. The demand for Python-savvy professionals has grown by over 30% YoY.',
        salary: '₹4.0 LPA - ₹15 LPA (Avg: ₹7.8 LPA)',
        targetRoles: ['Python Developer', 'Data Scientist', 'Data Analyst', 'Machine Learning Engineer'],
        techStack: ['Python 3', 'Pandas & NumPy', 'Jupyter Notebooks', 'Django / FastAPI', 'Scikit-Learn'],
        difficulty: 'Beginner to Intermediate'
      };
    }

    // 4. React / Front-End / Web
    if (title.includes('react') || title.includes('front') || title.includes('angular') || title.includes('web') || code.includes('react') || code.includes('angular') || code.includes('ui_ux')) {
      return {
        pros: [
          'Instant visual feedback makes the learning process engaging and satisfying.',
          'Dominant library for modern web interfaces; backed by Meta and huge open-source contribution.',
          'High demand in startups and tech companies looking to build fast, interactive single-page apps.'
        ],
        cons: [
          'Fast-paced ecosystem where packages, state managers, and standards change frequently.',
          'SEO optimization requires server-side framework setup (Next.js/Remix) adding configuration layer.'
        ],
        growth: 'Highly active. Startups to enterprises continue migrating legacy portals to React/NextJS, sustaining 18% YoY growth in front-end talent demand.',
        salary: '₹3.8 LPA - ₹12 LPA (Avg: ₹6.5 LPA)',
        targetRoles: ['Front-End Engineer', 'React Developer', 'UI Developer', 'Full-Stack Web Engineer'],
        techStack: ['ReactJS Library', 'JavaScript (ES6+) / TypeScript', 'Tailwind CSS / Sass', 'Next.js Framework', 'HTML5 & CSS3'],
        difficulty: 'Beginner to Intermediate'
      };
    }

    // 5. Node.js / Express / Backend
    if (title.includes('node') || code.includes('node') || title.includes('backend') || title.includes('express')) {
      return {
        pros: [
          'Allows developers to build full-stack apps using only JavaScript across front & back end.',
          'High asynchronous scalability with event-driven non-blocking I/O model.',
          'Rapid development cycles using npm registry with thousands of pre-built packages.'
        ],
        cons: [
          'Single-threaded loop makes it ill-suited for heavy CPU computing tasks like image processing.',
          'Vulnerability to dependency bloating and security vulnerability risks in external packages.'
        ],
        growth: 'Sustained by APIs and microservices. Node.js backend pipelines scale efficiently, yielding a 12% YoY demand expansion in JavaScript-centric backends.',
        salary: '₹4.0 LPA - ₹14 LPA (Avg: ₹7.2 LPA)',
        targetRoles: ['Node.js Developer', 'Backend API Engineer', 'Full-Stack JS Engineer', 'Backend Specialist'],
        techStack: ['Node.js runtime', 'Express.js Framework', 'MongoDB / Mongoose', 'REST API Design', 'JSON Web Tokens (JWT)'],
        difficulty: 'Intermediate'
      };
    }

    // 6. Generic fallback
    return {
      pros: [
        'Focused on building hands-on industry relevant projects and portfolio pieces.',
        'Designed around active mentor guidance to avoid tutorial hell.',
        'Provides fundamental technical foundations to transition into any coding path.'
      ],
      cons: [
        'Requires self-discipline to complete weekly assignments and coding challenges.',
        'Job placements depend on active execution and compilation of portfolio projects.'
      ],
      growth: 'Tech industries continue prioritizing skills over degrees, making structured courses highly valuable (10%+ growth YoY).',
      salary: '₹3.5 LPA - ₹11 LPA (Avg: ₹5.8 LPA)',
      targetRoles: ['Associate Software Engineer', 'QA Automation Engineer', 'Full Stack Intern', 'Support Systems Engineer'],
      techStack: ['Git & GitHub', 'Visual Studio Code', 'Data Structures & Algorithms', 'JSON API Integrations', 'Agile Principles'],
      difficulty: 'Beginner'
    };
  }
  viewDetails(course: any): void {
    this.router.navigate(['/courses', course.slug || this.getCourseSlug(course)]);
  }

  goToExploreTracks(): void {
    this.router.navigate(['/explore-tracks']);
  }

  goToCheckout(course: any): void {
    this.router.navigate(['/checkout'], {
      queryParams: {
        courseId: course.id,
        course: course.title,
        amount: course.price,
        batchId: course.batch?.id,
        batch: course.batch?.name,
      },
    });
  }

  goToLearning(course: any): void {
    if (!course.batch?.id) return;
    this.router.navigate(['/dashboard/student/lms', course.batch.id]);
  }

  loadStaticCurriculumFallback(course: any): void {
    const title = (course?.title || '').toLowerCase();
    let staticId = 'java';
    if (title.includes('python')) {
      staticId = 'python';
    } else if (title.includes('devops') || title.includes('cloud')) {
      staticId = 'devops';
    }
    const localCourse = COURSES.find(c => c.id === staticId) || COURSES[0];
    
    this.selectedCurriculum = {
      name: course?.title || localCourse.name,
      title: course?.title || localCourse.name,
      curriculum: JSON.parse(JSON.stringify(localCourse.curriculum)) // deep clone to prevent mutation
    };

    // If not logged in, limit preview to 2 weeks
    if (!this.auth.isLoggedIn()) {
      this.selectedCurriculum.curriculum = this.selectedCurriculum.curriculum.slice(0, 2);
    }

    this.selectedCurriculum.curriculum.forEach((m: any, index: number) => {
      m.open = index === 0;
    });

    this.showCurriculum = true;

    setTimeout(() => {
      document
        .getElementById('curriculum-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  viewCurriculum(course: any): void {
    const batchId = course?.batch?.id;

    if (!batchId) {
      this.loadStaticCurriculumFallback(course);
      return;
    }

    this.http
      .get<any>(`${environment.apiUrl}/api/trainer/public-curriculum`, {
        params: { batchId: batchId.toString() },
      })
      .subscribe({
        next: (res) => {
          const raw = res?.data;
          if (!raw) {
            this.loadStaticCurriculumFallback(course);
            return;
          }

          let full: any;
          try {
            full = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            this.loadStaticCurriculumFallback(course);
            return;
          }

          if (!full?.curriculum || !Array.isArray(full.curriculum)) {
            this.loadStaticCurriculumFallback(course);
            return;
          }

          this.selectedCurriculum = this.auth.isLoggedIn()
            ? full
            : { ...full, curriculum: full.curriculum.slice(0, 2) };

          this.selectedCurriculum.curriculum.forEach((m: any, index: number) => {
            m.open = index === 0;
          });

          this.showCurriculum = true;

          setTimeout(() => {
            document
              .getElementById('curriculum-section')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: () => {
          this.loadStaticCurriculumFallback(course);
        },
      });
  }

  closeCurriculum(): void {
    this.showCurriculum = false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }

  courseImage(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize));
  }

  get pagedCourses(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  get comparedCourses(): any[] {
    return this.courses.filter((c) => this.compareCourseIds.has(c.id));
  }

  get stats() {
    return {
      total: this.courses.length,
      live: this.courses.filter((c) => c.batch?.status === 'ACTIVE').length,
      saved: this.savedCourseIds.size,
      enrolled: this.courses.filter((c) => c.isEnrolled).length,
    };
  }

  get rangeLabel(): string {
    if (!this.filteredCourses.length) return '0 of 0';
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.filteredCourses.length);
    return `${start}-${end} of ${this.filteredCourses.length}`;
  }

  pages(): number[] {
    const start = Math.max(1, Math.min(this.page - 2, this.totalPages - 4));
    const safeStart = Math.max(1, start);
    const end = Math.min(this.totalPages, safeStart + 4);
    return Array.from({ length: end - safeStart + 1 }, (_, i) => safeStart + i);
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(page, 1), this.totalPages);
    window.scrollTo({ top: 520, behavior: 'smooth' });
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  getCourseSlug(course: any): string {
    const code = (course?.code || '').toUpperCase();

    const knownSlugs: Record<string, string> = {
      JAVA_FS_001: 'java-full-stack',
      JAVA_FS: 'java-full-stack',
      REACT: 'react-js',
      REACT_JS: 'react-js',
      DEVOPS: 'devops',
      PYTHON_DS: 'python-data-structures',
      ANGULAR_ENT: 'angular-enterprise',
      AWS_CLOUD: 'aws-cloud',
      SQL_DB: 'sql-database',
      POWER_BI: 'power-bi-analytics',
      NODE_BACKEND: 'nodejs-backend',
      SPRING_MICRO: 'spring-boot-microservices',
      UI_UX: 'ui-ux-design',
      CYBER_SEC: 'cyber-security',
      ML_AI: 'machine-learning',
      FLUTTER: 'flutter-mobile-apps',
      DATA_ENG: 'data-engineering',
    };

    if (knownSlugs[code]) return knownSlugs[code];

    return (course?.title || 'course')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private sortCourses(a: any, b: any): number {
    if (this.sortMode === 'PRICE_LOW') return a.price - b.price;
    if (this.sortMode === 'PRICE_HIGH') return b.price - a.price;
    if (this.sortMode === 'DURATION') return b.durationHours - a.durationHours;
    if (this.sortMode === 'TITLE') return String(a.title).localeCompare(String(b.title));
    if (this.sortMode === 'LIVE') {
      return Number(b.batch?.status === 'ACTIVE') - Number(a.batch?.status === 'ACTIVE');
    }

    return (
      Number(b.batch?.status === 'ACTIVE') - Number(a.batch?.status === 'ACTIVE') ||
      Number(b.highlights?.length || 0) - Number(a.highlights?.length || 0) ||
      Number(a.price || 0) - Number(b.price || 0)
    );
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }
}
