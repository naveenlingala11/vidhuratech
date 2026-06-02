import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPlanAccessService } from '../../services/admin-plan-access';

type StatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'EXPIRED';

@Component({
  selector: 'app-admin-plan-access',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './plan-access.html',
  styleUrls: ['./plan-access.css'],
})
export class AdminPlanAccessComponent implements OnInit {
  loading = false;
  saving = false;
  toast = '';

  search = '';
  statusFilter: StatusFilter = 'ALL';
  planFilter = 'ALL';

  grants: any[] = [];
  selectedGrant: any = null;
  form = this.emptyForm();

  readonly statusFilters: StatusFilter[] = ['ALL', 'ACTIVE', 'PAUSED', 'REVOKED', 'EXPIRED'];
  activeTab: 'ACCESS' | 'PEOPLE' | 'PRICING' | 'DISCOUNTS' | 'CONTROLS' = 'ACCESS';

  people: any[] = [];
  pricingPlans: any[] = [];
  discounts: any[] = [];
  projectControls: any[] = [];

  discountForm = {
    code: '',
    title: '',
    discountType: 'PERCENT',
    discountValue: 10,
    planCode: '',
    maxUses: 100,
    active: true,
  };

  featureGroups = [
    {
      title: 'Practice Suite',
      info: 'Controls all public practice items. Mock Tests unlock assessments, Premium Challenges unlock paid coding contests, Interviews unlock interview question practice, and Company Practice controls company-wise bundles.',
      items: [
        {
          key: 'accessMockTests',
          label: 'Mock Tests',
          icon: 'bi bi-clipboard-check',
          tone: 'blue',
          description: 'Public assessments, company mock tests, placement readiness tests.',
        },
        {
          key: 'accessPremiumChallenges',
          label: 'Premium Challenges',
          icon: 'bi bi-code-slash',
          tone: 'violet',
          description: 'Paid coding contests, premium challenges, leaderboard attempts.',
        },
        {
          key: 'accessInterviews',
          label: 'Interview Practice',
          icon: 'bi bi-chat-square-text',
          tone: 'green',
          description: 'Interview questions, answers, role-wise preparation.',
        },
        {
          key: 'accessPracticeCompanies',
          label: 'Company Practice',
          icon: 'bi bi-buildings',
          tone: 'amber',
          description: 'Company-wise bundles and restricted practice company access.',
        },
      ],
    },
    {
      title: 'Learning Suite',
      info: 'Controls paid learning resources. Courses unlock premium course pages, Videos unlock recorded lessons, Live Classes unlock batch/live access, Notes and Materials unlock downloadable resources.',
      items: [
        {
          key: 'accessCourses',
          label: 'Courses',
          icon: 'bi bi-journal-bookmark',
          tone: 'blue',
          description: 'Premium courses, structured learning paths, paid course bundles.',
        },
        {
          key: 'accessVideos',
          label: 'Videos',
          icon: 'bi bi-play-btn',
          tone: 'rose',
          description: 'Recorded lessons, premium video modules, course playback access.',
        },
        {
          key: 'accessLiveClasses',
          label: 'Live Classes',
          icon: 'bi bi-camera-video',
          tone: 'green',
          description: 'Live class links, batch sessions, mentor-led class access.',
        },
        {
          key: 'accessNotes',
          label: 'Notes',
          icon: 'bi bi-journal-text',
          tone: 'amber',
          description: 'Premium notes, revision sheets, concept summaries.',
        },
        {
          key: 'accessMaterials',
          label: 'Materials',
          icon: 'bi bi-folder2-open',
          tone: 'violet',
          description: 'PDFs, downloadable files, preparation resources.',
        },
      ],
    },
  ];

  planPresets = [
    {
      code: 'STARTER',
      title: 'Starter',
      subtitle: 'Free/low-cost practice bundle',
      days: 30,
      companyLimit: 5,
      icon: 'bi bi-lightning-charge',
      action: () => this.enableStarter(),
    },
    {
      code: 'PRO',
      title: 'Pro',
      subtitle: 'Premium challenges + learning',
      days: 30,
      companyLimit: 15,
      icon: 'bi bi-stars',
      action: () => this.enablePro(),
    },
    {
      code: 'ELITE',
      title: 'Elite',
      subtitle: 'Complete unlimited bundle',
      days: 180,
      companyLimit: 999,
      icon: 'bi bi-gem',
      action: () => this.enableElite(),
    },
  ];

  constructor(private service: AdminPlanAccessService) {}

  ngOnInit(): void {
    this.loadGrants();
  }

  switchTab(tab: any): void {
    this.activeTab = tab;

    if (tab === 'PEOPLE') this.loadPeople();
    if (tab === 'PRICING') this.loadPricing();
    if (tab === 'DISCOUNTS') this.loadDiscounts();
    if (tab === 'CONTROLS') this.loadProjectControls();
  }

  loadPeople(): void {
    this.service.people(this.search).subscribe({
      next: (res) => (this.people = res?.data || []),
      error: () => this.showToast('Unable to load people directory'),
    });
  }

  loadPricing(): void {
    this.service.pricing().subscribe({
      next: (res) => (this.pricingPlans = res?.data || []),
      error: () => this.showToast('Unable to load pricing controls'),
    });
  }

  savePricing(plan: any): void {
    this.service.updatePricing(plan.planCode, plan).subscribe({
      next: () => this.showToast('Pricing updated'),
      error: () => this.showToast('Unable to update pricing'),
    });
  }

  loadDiscounts(): void {
    this.service.discounts().subscribe({
      next: (res) => (this.discounts = res?.data || []),
      error: () => this.showToast('Unable to load discounts'),
    });
  }

  saveDiscount(): void {
    this.service.saveDiscount(this.discountForm).subscribe({
      next: () => {
        this.showToast('Discount saved');
        this.loadDiscounts();
      },
      error: () => this.showToast('Unable to save discount'),
    });
  }

  loadProjectControls(): void {
    this.service.projectControls().subscribe({
      next: (res) => (this.projectControls = res?.data || []),
      error: () => this.showToast('Unable to load project controls'),
    });
  }

  toggleProjectControl(control: any): void {
    this.service.updateProjectControl(control.controlKey, { enabled: control.enabled }).subscribe({
      next: () => this.showToast('Project control updated'),
      error: () => this.showToast('Unable to update control'),
    });
  }

  grantFromPerson(person: any): void {
    this.selectedGrant = null;
    this.form = this.emptyForm();
    this.form.email = person.email || '';
    this.enablePro();
    this.activeTab = 'ACCESS';
  }

  emptyForm(): any {
    return {
      email: '',
      planCode: 'ADMIN_CUSTOM',
      planName: 'Admin Custom Access',
      status: 'ACTIVE',
      durationDays: 30,
      companyLimit: 999,
      accessCourses: false,
      accessMockTests: false,
      accessInterviews: false,
      accessNotes: false,
      accessMaterials: false,
      accessVideos: false,
      accessLiveClasses: false,
      accessPracticeCompanies: false,
      accessPremiumChallenges: false,
    };
  }

  get filteredGrants(): any[] {
    return this.grants.filter((grant) => {
      const term = this.search.trim().toLowerCase();
      const searchable = [
        grant.buyerName,
        grant.buyerEmail,
        grant.buyerPhone,
        grant.planCode,
        grant.planName,
        grant.status,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (this.statusFilter === 'ALL' || this.displayStatus(grant) === this.statusFilter) &&
        (this.planFilter === 'ALL' ||
          String(grant.planCode || '').toUpperCase() === this.planFilter)
      );
    });
  }

  get planOptions(): string[] {
    return Array.from(
      new Set(
        this.grants.map((grant) => String(grant.planCode || '').toUpperCase()).filter(Boolean),
      ),
    );
  }

  get stats(): any {
    const active = this.grants.filter((grant) => this.displayStatus(grant) === 'ACTIVE').length;
    const paused = this.grants.filter((grant) => this.displayStatus(grant) === 'PAUSED').length;
    const expired = this.grants.filter((grant) => this.displayStatus(grant) === 'EXPIRED').length;
    const revoked = this.grants.filter((grant) => this.displayStatus(grant) === 'REVOKED').length;
    const premium = this.grants.filter(
      (grant) => this.displayStatus(grant) === 'ACTIVE' && grant.accessPremiumChallenges,
    ).length;

    return {
      total: this.grants.length,
      active,
      paused,
      expired,
      revoked,
      premium,
    };
  }

  get selectedFeatureCount(): number {
    return this.allFeatureItems().filter((item) => this.form[item.key]).length;
  }

  get selectedFeatureNames(): string {
    const names = this.allFeatureItems()
      .filter((item) => this.form[item.key])
      .map((item) => item.label);

    return names.length ? names.join(', ') : 'No features selected';
  }

  allFeatureItems(): any[] {
    return this.featureGroups.flatMap((group) => group.items);
  }

  loadGrants(): void {
    this.loading = true;

    this.service.list('').subscribe({
      next: (res: any) => {
        this.grants = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load access grants');
      },
    });
  }

  resetForm(): void {
    this.selectedGrant = null;
    this.form = this.emptyForm();
  }

  selectGrant(grant: any): void {
    this.selectedGrant = grant;

    this.form = {
      email: grant.buyerEmail || '',
      planCode: grant.planCode || 'ADMIN_CUSTOM',
      planName: grant.planName || 'Admin Custom Access',
      status: this.displayStatus(grant),
      durationDays: '',
      companyLimit: grant.companyLimit || 999,
      accessCourses: !!grant.accessCourses,
      accessMockTests: !!grant.accessMockTests,
      accessInterviews: !!grant.accessInterviews,
      accessNotes: !!grant.accessNotes,
      accessMaterials: !!grant.accessMaterials,
      accessVideos: !!grant.accessVideos,
      accessLiveClasses: !!grant.accessLiveClasses,
      accessPracticeCompanies: !!grant.accessPracticeCompanies,
      accessPremiumChallenges: !!grant.accessPremiumChallenges,
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  duplicateGrant(grant: any): void {
    this.selectedGrant = null;

    this.form = {
      ...this.emptyForm(),
      email: grant.buyerEmail || '',
      planCode: grant.planCode || 'ADMIN_CUSTOM',
      planName: `${grant.planName || 'Admin Access'} Renewal`,
      durationDays: 30,
      companyLimit: grant.companyLimit || 999,
      accessCourses: !!grant.accessCourses,
      accessMockTests: !!grant.accessMockTests,
      accessInterviews: !!grant.accessInterviews,
      accessNotes: !!grant.accessNotes,
      accessMaterials: !!grant.accessMaterials,
      accessVideos: !!grant.accessVideos,
      accessLiveClasses: !!grant.accessLiveClasses,
      accessPracticeCompanies: !!grant.accessPracticeCompanies,
      accessPremiumChallenges: !!grant.accessPremiumChallenges,
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  enableStarter(): void {
    Object.assign(this.form, {
      planCode: 'STARTER',
      planName: 'Starter Manual Access',
      durationDays: 30,
      companyLimit: 5,
      accessCourses: false,
      accessMockTests: true,
      accessInterviews: true,
      accessNotes: true,
      accessMaterials: true,
      accessVideos: false,
      accessLiveClasses: false,
      accessPracticeCompanies: true,
      accessPremiumChallenges: false,
    });
  }

  enablePro(): void {
    Object.assign(this.form, {
      planCode: 'PRO',
      planName: 'Pro Manual Access',
      durationDays: 30,
      companyLimit: 15,
      accessCourses: true,
      accessMockTests: true,
      accessInterviews: true,
      accessNotes: true,
      accessMaterials: true,
      accessVideos: true,
      accessLiveClasses: true,
      accessPracticeCompanies: true,
      accessPremiumChallenges: true,
    });
  }

  enableElite(): void {
    Object.assign(this.form, {
      planCode: 'ELITE',
      planName: 'Elite Manual Access',
      durationDays: 180,
      companyLimit: 999,
      accessCourses: true,
      accessMockTests: true,
      accessInterviews: true,
      accessNotes: true,
      accessMaterials: true,
      accessVideos: true,
      accessLiveClasses: true,
      accessPracticeCompanies: true,
      accessPremiumChallenges: true,
    });
  }

  enableTrial(): void {
    Object.assign(this.form, {
      planCode: 'TRIAL',
      planName: '7 Day Trial Access',
      durationDays: 7,
      companyLimit: 3,
      accessCourses: false,
      accessMockTests: true,
      accessInterviews: true,
      accessNotes: true,
      accessMaterials: false,
      accessVideos: false,
      accessLiveClasses: false,
      accessPracticeCompanies: true,
      accessPremiumChallenges: false,
    });
  }

  enableEverything(): void {
    this.allFeatureItems().forEach((item) => (this.form[item.key] = true));
  }

  clearFeatures(): void {
    this.allFeatureItems().forEach((item) => (this.form[item.key] = false));
  }

  setDuration(days: number): void {
    this.form.durationDays = days;
  }

  canSave(): boolean {
    if (this.selectedGrant) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email || '');
  }

  save(): void {
    if (!this.canSave()) {
      this.showToast('Enter a valid registered user email');
      return;
    }

    this.saving = true;

    const request = this.selectedGrant
      ? this.service.update(Number(this.selectedGrant.id), this.form)
      : this.service.grant(this.form);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showToast(
          this.selectedGrant ? 'Access updated successfully' : 'Access granted successfully',
        );
        this.resetForm();
        this.loadGrants();
      },
      error: (err: any) => {
        this.saving = false;
        this.showToast(err?.error?.message || err?.error?.error || 'Unable to save access');
      },
    });
  }

  changeStatus(grant: any, status: string): void {
    this.service.update(Number(grant.id), { ...grant, status }).subscribe({
      next: () => {
        this.showToast(`Access marked ${status}`);
        this.loadGrants();
      },
      error: () => this.showToast('Unable to update status'),
    });
  }

  quickExtend(grant: any, days: number): void {
    this.service
      .update(Number(grant.id), { ...grant, durationDays: days, status: 'ACTIVE' })
      .subscribe({
        next: () => {
          this.showToast(`Access extended by ${days} days`);
          this.loadGrants();
        },
        error: () => this.showToast('Unable to extend access'),
      });
  }

  revoke(grant: any): void {
    if (!confirm(`Revoke access for ${grant.buyerEmail}?`)) return;

    this.service.revoke(Number(grant.id)).subscribe({
      next: () => {
        this.showToast('Access revoked');
        this.loadGrants();

        if (this.selectedGrant?.id === grant.id) {
          this.resetForm();
        }
      },
      error: () => this.showToast('Unable to revoke access'),
    });
  }

  displayStatus(grant: any): StatusFilter {
    if (grant?.status === 'REVOKED') return 'REVOKED';
    if (grant?.status === 'PAUSED') return 'PAUSED';
    if (this.isExpired(grant)) return 'EXPIRED';
    return 'ACTIVE';
  }

  isExpired(grant: any): boolean {
    return !grant?.expiresAt || new Date(grant.expiresAt).getTime() <= Date.now();
  }

  daysLeft(grant: any): number {
    if (!grant?.expiresAt) return 0;
    return Math.max(Math.ceil((new Date(grant.expiresAt).getTime() - Date.now()) / 86400000), 0);
  }

  enabledFeatures(grant: any): string[] {
    return [
      grant.accessCourses ? 'Courses' : '',
      grant.accessMockTests ? 'Mock Tests' : '',
      grant.accessInterviews ? 'Interviews' : '',
      grant.accessPremiumChallenges ? 'Premium Challenges' : '',
      grant.accessVideos ? 'Videos' : '',
      grant.accessLiveClasses ? 'Live Classes' : '',
      grant.accessNotes ? 'Notes' : '',
      grant.accessMaterials ? 'Materials' : '',
      grant.accessPracticeCompanies ? 'Companies' : '',
    ].filter(Boolean);
  }

  accessHealth(grant: any): string {
    if (this.displayStatus(grant) !== 'ACTIVE') return this.displayStatus(grant);
    const days = this.daysLeft(grant);
    if (days <= 3) return 'Expiring Soon';
    if (grant.accessPremiumChallenges) return 'Premium Ready';
    return 'Active';
  }

  copyEmail(email: string): void {
    navigator?.clipboard?.writeText(email || '');
    this.showToast('Email copied');
  }

  trackById(_: number, item: any): any {
    return item?.id || item?.key || item?.label;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
