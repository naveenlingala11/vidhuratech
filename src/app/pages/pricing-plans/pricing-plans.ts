import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pricing-plans.html',
  styleUrls: ['./pricing-plans.css'],
})
export class PricingPlansComponent implements OnInit {
  loading = false;
  plansLoading = false;
  selectedPlan: any = null;
  toast = '';

  buyer = { name: '', email: '', phone: '', city: '' };

  plans: any[] = [
    {
      code: 'STARTER',
      name: 'Basic',
      tag: 'Practice Access',
      price: 49,
      period: 'month',
      highlight: false,
      compareAtPrice: null,
      validityDays: 30,
      companyLimit: 5,
      description: 'Best for mock tests and company-wise practice.',
      features: [
        'Company-wise mock tests',
        'Basic coding challenges',
        'Interview question bank',
        'Notes and PDFs',
        'Practice for 5 companies',
        'Weekly leaderboard access',
      ],
    },
    {
      code: 'PRO',
      name: 'Pro',
      tag: 'Most Popular',
      price: 149,
      period: 'month',
      highlight: true,
      compareAtPrice: null,
      validityDays: 30,
      companyLimit: 15,
      description: 'Best for premium challenges, videos, materials, and live support.',
      features: [
        'Everything in Starter',
        'Premium coding challenges',
        'Video lessons',
        'Live doubt classes',
        'Resume and interview prep',
        'Practice for 15 companies',
        'Downloadable materials',
        'Monthly mock interview',
      ],
    },
    {
      code: 'ELITE',
      name: 'Elite',
      tag: 'Complete Bundle',
      price: 499,
      period: 'bundle',
      highlight: false,
      compareAtPrice: null,
      validityDays: 180,
      companyLimit: 999,
      description: 'Complete career bundle with courses, live classes, and placement support.',
      features: [
        'Everything in Pro',
        'All premium courses',
        'Live classes access',
        'Advanced coding contests',
        'Unlimited mock tests',
        'Unlimited company practice',
        'Personal mentor guidance',
        'Mock interviews with feedback',
        'Placement preparation bundle',
      ],
    },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.plansLoading = true;

    this.http.get<any>(`${environment.apiUrl}/api/public/plans`).subscribe({
      next: (res) => {
        const apiPlans = Array.isArray(res?.data) ? res.data : [];
        const merged = apiPlans
          .map((apiPlan: any) => this.mergePlan(apiPlan))
          .filter((plan: any) => plan.active !== false);

        if (merged.length) this.plans = merged;
        this.plansLoading = false;
      },
      error: () => {
        this.plansLoading = false;
        this.showToast('Showing default plans. Live pricing could not be loaded.');
      },
    });
  }

  mergePlan(apiPlan: any): any {
    const code = String(apiPlan?.code || apiPlan?.planCode || '').toUpperCase();
    const fallback = this.plans.find((plan) => plan.code === code) || this.plans[0];
    const price = Number(apiPlan?.price ?? apiPlan?.amount ?? fallback.price);
    const validityDays = Number(
      apiPlan?.durationDays ?? apiPlan?.validityDays ?? fallback.validityDays,
    );
    const companyLimit = Number(apiPlan?.companyLimit ?? fallback.companyLimit);

    return {
      ...fallback,
      code: code || fallback.code,
      name: apiPlan?.name || apiPlan?.planName || fallback.name,
      price: Number.isFinite(price) ? price : fallback.price,
      compareAtPrice: apiPlan?.compareAtPrice ?? fallback.compareAtPrice,
      period: this.periodFromDays(validityDays, fallback.period),
      highlight: Boolean(apiPlan?.highlighted ?? apiPlan?.highlight ?? fallback.highlight),
      validityDays,
      companyLimit,
      active: apiPlan?.active,
      features: this.featuresFromPlan(apiPlan, fallback, companyLimit),
      description: this.descriptionFromPlan(code || fallback.code, validityDays),
    };
  }

  featuresFromPlan(apiPlan: any, fallback: any, companyLimit: number): string[] {
    const features: string[] = [];

    if (apiPlan?.accessCourses) features.push('Premium courses and structured learning paths');
    if (apiPlan?.accessMockTests) features.push('Mock tests and assessment practice');
    if (apiPlan?.accessInterviews) features.push('Interview preparation question bank');
    if (apiPlan?.accessNotes) features.push('Premium notes and revision sheets');
    if (apiPlan?.accessMaterials) features.push('Downloadable preparation materials');
    if (apiPlan?.accessVideos) features.push('Recorded video lessons');
    if (apiPlan?.accessLiveClasses) features.push('Live classes and doubt sessions');
    if (apiPlan?.accessPracticeCompanies) {
      features.push(
        companyLimit >= 999
          ? 'Unlimited company-wise practice bundles'
          : `Practice for ${companyLimit} companies`,
      );
    }
    if (apiPlan?.accessPremiumChallenges) features.push('Premium coding challenges');

    return features.length ? features : fallback.features;
  }

  descriptionFromPlan(code: string, validityDays: number): string {
    if (code === 'STARTER')
      return `A focused ${validityDays}-day basic plan for mock tests and company preparation.`;
    if (code === 'ELITE')
      return `Complete ${validityDays}-day access with premium learning, practice, and placement support.`;
    return `A premium ${validityDays}-day bundle for challenges, lessons, materials, and live support.`;
  }

  periodFromDays(days: number, fallback: string): string {
    if (!Number.isFinite(days) || days <= 0) return fallback;
    if (days >= 365) return 'year';
    if (days >= 180) return 'bundle';
    if (days >= 28 && days <= 31) return 'month';
    return `${days} days`;
  }

  formatPrice(value: any): string {
    return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  planDurationLabel(plan: any): string {
    const days = Number(plan?.validityDays || 0);
    if (days >= 365) return '1 year access';
    if (days >= 180) return `${days} days complete bundle`;
    if (days > 0) return `${days} days access`;
    return 'Access after payment';
  }

  companyLimitLabel(plan: any): string {
    const limit = Number(plan?.companyLimit || 0);
    return limit >= 999 ? 'Unlimited company practice' : `${limit} company practice bundles`;
  }

  nextSteps(): string[] {
    return [
      'Enter your billing details',
      'Continue to Razorpay secure payment',
      'Plan activates instantly after payment confirmation',
      'Invoice is sent to your email',
    ];
  }

  selectPlan(plan: any): void {
    this.selectedPlan = plan;
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeCheckout(): void {
    if (this.loading) return;
    this.selectedPlan = null;
  }

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.buyer.email || '');
  }

  isValidPhone(): boolean {
    return /^[6-9][0-9]{9}$/.test(String(this.buyer.phone || '').replace(/\D/g, ''));
  }

  canPay(): boolean {
    return (
      !!this.selectedPlan &&
      this.buyer.name.trim().length >= 3 &&
      this.isValidEmail() &&
      this.isValidPhone() &&
      this.buyer.city.trim().length >= 2
    );
  }

  paySelectedPlan(): void {
    if (!this.canPay()) {
      this.showToast('Please enter valid name, email, mobile number, and city');
      return;
    }

    this.loading = true;

    this.http
      .post<any>(`${environment.apiUrl}/api/public/plans/checkout`, {
        planCode: this.selectedPlan.code,
        name: this.buyer.name,
        email: this.buyer.email,
        phone: this.buyer.phone,
        city: this.buyer.city,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.openRazorpay(res?.data);
        },
        error: (err) => {
          this.loading = false;
          this.showToast(err?.error?.message || err?.error?.error || 'Unable to start payment');
        },
      });
  }

  openRazorpay(data: any): void {
    if (!isPlatformBrowser(this.platformId) || !(window as any).Razorpay) {
      this.showToast('Payment gateway not loaded');
      return;
    }

    const options: any = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Vidhura Tech',
      description: `${this.selectedPlan.name} Plan`,
      order_id: data.orderId,
      prefill: {
        name: this.buyer.name,
        email: this.buyer.email,
        contact: this.buyer.phone,
      },
      notes: {
        planCode: this.selectedPlan.code,
        invoiceId: data.invoiceId,
      },
      modal: {
        ondismiss: () => {
          this.loading = false;
          this.showToast('Payment cancelled');
        },
      },
      handler: (response: any) => this.confirmPayment(data.invoiceId, response),
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      this.loading = false;
      this.showToast(response?.error?.description || 'Payment failed');
    });

    rzp.open();
  }

  confirmPayment(invoiceId: string, response: any): void {
    this.loading = true;

    this.http
      .post<any>(`${environment.apiUrl}/api/public/plans/confirm`, {
        invoiceId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.selectedPlan = null;
          this.showToast('Payment successful. Plan activated and invoice sent to email.');

          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { email: this.buyer.email, redirect: '/coding-contests' },
            });
          }, 900);
        },
        error: (err) => {
          this.loading = false;
          this.showToast(
            err?.error?.message ||
              err?.error?.error ||
              'Payment completed but activation failed. Contact support.',
          );
        },
      });
  }

  planTagline(plan: any): string {
    return plan.tagline || plan.tag || `${plan.name} access plan`;
  }

  planBestFor(plan: any): string[] {
    if (Array.isArray(plan.bestFor) && plan.bestFor.length) return plan.bestFor;

    if (plan.code === 'STARTER') {
      return ['Best Answers unlock', 'Mock tests', 'Basic practice'];
    }

    if (plan.code === 'PRO') {
      return ['Premium challenges', 'Videos and live classes', 'Serious placement prep'];
    }

    return ['Complete access', 'Long-term preparation', 'Unlimited company practice'];
  }

  planLimitations(plan: any): string[] {
    if (Array.isArray(plan.limitations) && plan.limitations.length) return plan.limitations;

    if (plan.code === 'STARTER') {
      return ['No premium videos', 'No live classes', 'Limited company bundles'];
    }

    if (plan.code === 'PRO') {
      return ['30-day validity', 'Limited company bundles'];
    }

    return ['No major access limitations during validity'];
  }

  accessRows(plan: any): any[] {
    return [
      { icon: 'fa-code', label: 'Best Answers source code', enabled: true },
      {
        icon: 'fa-trophy',
        label: 'Coding contests access',
        enabled: !!plan.accessPremiumChallenges || plan.code !== 'STARTER',
      },
      { icon: 'fa-file-lines', label: 'Mock tests', enabled: !!plan.accessMockTests },
      { icon: 'fa-comments', label: 'Interview practice', enabled: !!plan.accessInterviews },
      {
        icon: 'fa-book-open',
        label: 'Notes and materials',
        enabled: !!plan.accessNotes || !!plan.accessMaterials,
      },
      { icon: 'fa-video', label: 'Recorded videos', enabled: !!plan.accessVideos },
      { icon: 'fa-chalkboard-user', label: 'Live classes', enabled: !!plan.accessLiveClasses },
      {
        icon: 'fa-layer-group',
        label: this.companyLimitLabel(plan),
        enabled: !!plan.accessPracticeCompanies,
      },
    ];
  }

  comparisonRows(): any[] {
    return [
      { label: 'Best Answers source code', basic: true, pro: true, elite: true },
      { label: '80%+ submitted solutions', basic: true, pro: true, elite: true },
      { label: 'Mock tests', basic: true, pro: true, elite: true },
      { label: 'Interview question bank', basic: true, pro: true, elite: true },
      { label: 'Premium coding challenges', basic: false, pro: true, elite: true },
      { label: 'Recorded videos', basic: false, pro: true, elite: true },
      { label: 'Live classes', basic: false, pro: true, elite: true },
      { label: 'Premium courses', basic: false, pro: true, elite: true },
      { label: 'Company practice bundles', basic: '5', pro: '15', elite: 'Unlimited' },
      { label: 'Validity', basic: '30 days', pro: '30 days', elite: '180 days' },
    ];
  }

  comparisonValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return String(value);
  }

  comparisonClass(value: any): string {
    if (value === true) return 'yes';
    if (value === false) return 'no';
    return 'text';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 3200);
  }
}
