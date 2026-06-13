import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface GuideItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
}

export interface GuideCategory {
  key: string;
  title: string;
  icon: string;
  description: string;
  items: GuideItem[];
}

@Component({
  selector: 'app-admin-user-guide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-guide.html',
  styleUrls: ['./user-guide.css']
})
export class AdminUserGuideComponent implements OnInit {
  searchQuery = '';
  activeCategory = 'OVERVIEW';
  expandedItems: Record<string, boolean> = {};

  categories: GuideCategory[] = [
    {
      key: 'OVERVIEW',
      title: 'Platform Overview & Architecture',
      icon: 'bi bi-diagram-3-fill',
      description: 'Understand VidhuraTech\'s core architecture, portals, system flows, and latency pingers.',
      items: [
        {
          id: 'overview-structure',
          title: 'VidhuraTech Core Architecture',
          icon: 'bi bi-grid-3x3-gap-fill',
          description: 'A structural overview of how frontend views map to backend data gates.',
          details: [
            '<strong>Decoupled Routing Gates</strong>: Route validation is handled globally by <code class="guide-code">authGuard</code> and <code class="guide-code">roleGuard</code> inside <a class="guide-link" href="file:///d:/V_2.0/Vidhura%20Tech/Frontend/vidhuratech/src/app/app.routes.ts">app.routes.ts</a>. Unauthenticated sessions are immediately restricted and redirected to <code class="guide-code">/login</code>.',
            '<strong>Role Claim Interceptors</strong>: When a user authenticates, their token payloads containing role claims (<code class="guide-code">STUDENT</code>, <code class="guide-code">TRAINER</code>, <code class="guide-code">ADMIN</code>, <code class="guide-code">HR</code>, <code class="guide-code">MANAGER</code>, <code class="guide-code">MENTOR</code>, <code class="guide-code">SUPER_ADMIN</code>) determine dynamic view layouts.',
            '<strong>Asynchronous Engine Hubs</strong>: High-latency tasks like code sandbox execution validation, ATS resume parsing, and batch announcement email queues are delegated to specialized background processing workers.'
          ]
        },
        {
          id: 'overview-navigation',
          title: 'Sidebar & Dashboard Navigation',
          icon: 'bi bi-compass-fill',
          description: 'How to traverse the operations controls as an administrator.',
          details: [
            '<strong>Dynamic Pill Sidebar Navigation</strong>: Renders authenticated options lists dynamically matching the user\'s activated role privileges.',
            '<strong>Quick Actions Search Dispatcher</strong>: Integrated keyboard search bar across Admin Actions to instantly trigger settings, user audits, batch emails, and quick commands.',
            '<strong>Latency Diagnostic telemetry</strong>: Real-time latency checking monitors situated inside the Admin Actions panel represent connection status to core services, updating every 15 seconds.'
          ]
        }
      ]
    },
    {
      key: 'ROLES',
      title: 'Access Control & Privileges',
      icon: 'bi bi-shield-lock-fill',
      description: 'Permissions, navigation menus, and active feature flags across all user roles.',
      items: [
        {
          id: 'roles-super-admin',
          title: 'Super Admin (SUPER_ADMIN) Privileges',
          icon: 'bi bi-stars',
          description: 'Supreme administrative credentials with global bypass capability.',
          details: [
            '<strong>Global Overrides</strong>: Full permission to bypass student subscription constraints, override package pricing models, and edit global system configurations.',
            '<strong>Audit Logs access</strong>: Complete access to view security overrides, track Admin action history, query system-wide transaction streams, and review latency charts.',
            '<strong>Access elevation desk</strong>: Direct authority to elevate standard users to <code class="guide-code">ADMIN</code>, <code class="guide-code">TRAINER</code>, or <code class="guide-code">HR</code>, and execute hard-deletes on archived tables.'
          ]
        },
        {
          id: 'roles-admin',
          title: 'Operations Administrator (ADMIN)',
          icon: 'bi bi-person-badge-fill',
          description: 'Access directory, admissions control, and commercial toolkits.',
          details: [
            '<strong>User Directory Controls</strong>: Search, block/unblock, edit profile metadata, or create accounts through the Centralized Users Grid.',
            '<strong>Manual Plan Grants Ledger</strong>: Manage user subscription days, apply package presets, review billing invoices, and audit user histories.',
            '<strong>Operational Dispatchers</strong>: Schedule batch-wide notifications, trigger course bulk-uploads, and configure course pricing structures.'
          ]
        },
        {
          id: 'roles-trainer',
          title: 'Mentors & Trainers (TRAINER / MENTOR)',
          icon: 'bi bi-person-workspace',
          description: 'Syllabus deployment, mock assessments grading, and cohort tracking.',
          details: [
            '<strong>Cohort management</strong>: Schedule live session links, upload conceptual guides, pin notes, and post batch-wide announcements.',
            '<strong>Assessments configuration</strong>: Define coding challenges, configure compiler testcases, specify runtime limits, and track student scoreboards.',
            '<strong>Candidate evaluation suite</strong>: Grade candidate pseudocode labs, log mock interview results, and input performance feedback.'
          ]
        },
        {
          id: 'roles-student',
          title: 'Student & Learner (STUDENT)',
          icon: 'bi bi-mortarboard-fill',
          description: 'Learning player, code sandbox compiler, and placement boards.',
          details: [
            '<strong>Monaco Editor Sandbox</strong>: Solve practice coding questions, run compiler checks, and compare runtime speed metrics.',
            '<strong>Syllabus Progress Tracker</strong>: Access batched media content, check off timeline milestones, and download concept sheets.',
            '<strong>ATS Career Center</strong>: Build optimized resumes, pass prose validation, view active job postings, and submit job applications.'
          ]
        },
        {
          id: 'roles-hr',
          title: 'HR & Recruiters (HR)',
          icon: 'bi bi-briefcase-fill',
          description: 'Talent acquisition board, candidate sourcing, and job listings.',
          details: [
            '<strong>Talent Directory Sourcing</strong>: Search candidate portfolios, filter candidates by technical stack, and review placement readiness ratings.',
            '<strong>Vacancy Publisher</strong>: Post detailed job listings, input salary ranges, and track applicant queues.',
            '<strong>Interview Coordination</strong>: Review parsed applicant resumes and schedule screen rounds directly through the sliding detail drawers.'
          ]
        }
      ]
    },
    {
      key: 'FLOWS',
      title: 'Core System Workflows',
      icon: 'bi bi-activity',
      description: 'Step-by-step walkthroughs of core student journeys and sandbox operations.',
      items: [
        {
          id: 'flows-lms',
          title: 'LMS Learning & Media Milestones',
          icon: 'bi bi-collection-play-fill',
          description: 'Candidate journey from selecting a course to validating a topic.',
          details: [
            '<strong>Course Playback Engine</strong>: Video playback features inline timeline markers. Pinned documents and slide decks render directly below the viewport.',
            '<strong>Checkpoint Sandboxes</strong>: Reaching video checkpoints pauses the stream and opens code exercises that must be completed to resume.',
            '<strong>Completion Engine</strong>: Passing all checkpoints increments course completion indices and alerts the Certificate Dispatcher.'
          ]
        },
        {
          id: 'flows-sandbox',
          title: 'Practice Sandbox & Graded Assessments',
          icon: 'bi bi-code-slash',
          description: 'Monaco coding compilation sandbox and timed examination proctoring.',
          details: [
            '<strong>Execution Engine</strong>: Code is sent to a compiler sandbox which checks outputs against hidden inputs, outputting memory usage and execution latency.',
            '<strong>Window Proctoring</strong>: Moving away from the active tab or opening inspector tabs triggers warnings. Multiple alerts auto-submit and flag the attempt.',
            '<strong>Real-Time Leaderboards</strong>: Score logs update the global leaderboard, calculating success ratings based on accuracy and speed.'
          ]
        },
        {
          id: 'flows-ats',
          title: 'ATS Resume Builder & Section Parser',
          icon: 'bi bi-file-earmark-person-fill',
          description: 'Form-to-PDF construction and section optimization parsing.',
          details: [
            '<strong>Prose Filter Engine</strong>: Cleans contact details from candidate summary paragraphs to ensure data privacy.',
            '<strong>Header Classification</strong>: Maps text structures using anchor checks to categorize work history, skills, and projects.',
            '<strong>Ready Index Tracker</strong>: Checks profile fields for completeness and assigns a Placement Readiness Index score.'
          ]
        }
      ]
    },
    {
      key: 'COMMERCIAL',
      title: 'Plan Access & Billing',
      icon: 'bi bi-wallet2',
      description: 'Subscription ledger, coupons builder, pricing setups, and transaction audits.',
      items: [
        {
          id: 'commercial-grants',
          title: 'Manual Plan Access Ledger',
          icon: 'bi bi-shield-lock-fill',
          description: 'How admins provision student subscription presets.',
          details: [
            '<strong>Presets Manager</strong>: Select presets (<span class="guide-tag badge-starter">Starter</span>, <span class="guide-tag badge-pro">Pro</span>, <span class="guide-tag badge-elite">Elite</span>, <span class="guide-tag badge-trial">Trial</span>) to populate default limits and access ranges.',
            '<strong>Ledger Adjustments</strong>: Instantly add days (+30d/+90d), pause active access, or revoke subscriptions via the admin ledger UI.',
            '<strong>Feature Locks</strong>: Enables or disables access to premium compiler challenges and advanced ATS templates based on plan codes.'
          ]
        },
        {
          id: 'commercial-pricing',
          title: 'Pricing Tiers & Discount Coupons',
          icon: 'bi bi-currency-rupee',
          description: 'Configuring public pricing structures and discount vouchers.',
          details: [
            '<strong>Cross-out Pricing Setup</strong>: Specify compare-at price ranges alongside active prices to display discount tags on checkout.',
            '<strong>Coupon Dispatcher</strong>: Setup code parameters (e.g. FLAT50) with flat deductions or percentage discounts and cap active usage limits.',
            '<strong>Highlight Spotlights</strong>: Toggling highlight flags renders glowing card wrappers around chosen pricing options to draw attention.'
          ]
        },
        {
          id: 'commercial-audit',
          title: 'Transaction Streams & Invoices Audit',
          icon: 'bi bi-receipt-cutoff',
          description: 'Reviewing payment streams, invoices, and analytics charts.',
          details: [
            '<strong>Invoice Feed</strong>: Scrollable sidebar listing transaction attempts, client emails, and issued transaction hashes.',
            '<strong>Revenue Analytics</strong>: Interactive chart mapping sales totals, coupon usage, and package purchases.'
          ]
        }
      ]
    },
    {
      key: 'DIAGNOSTICS',
      title: 'Diagnostic & Operations Control',
      icon: 'bi bi-cpu-fill',
      description: 'Monitor database integration status, track invoices logs, and diagnostic checklists.',
      items: [
        {
          id: 'diagnostics-latency',
          title: 'Database & API Telemetry Monitor',
          icon: 'bi bi-activity',
          description: 'Pinging database gates to check server health.',
          details: [
            '<strong>Pinger Service</strong>: Automatically fires telemetry request tests to monitor system responsiveness.',
            '<strong>Latency Badging</strong>: Displays connection speed indicators: <span class="guide-badge bg-emerald">Healthy (&lt;150ms)</span>, <span class="guide-badge bg-amber">Lagging (150ms-500ms)</span>, or <span class="guide-badge bg-rose">Offline</span>.',
            '<strong>Diagnostic Checklist</strong>: Shows the connection status of the compilation environment, CDN bucket, and email queues.'
          ]
        },
        {
          id: 'diagnostics-audit',
          title: 'Payment Auditing & Transactions Ledger',
          icon: 'bi bi-receipt-cutoff',
          description: 'Inspecting live invoices logs and course enrolments.',
          details: [
            '<strong>Live Stream Audit</strong>: Centralized sidebar renders actual transaction records, user details, and issued invoices.',
            '<strong>Payment Tracking</strong>: Verify successful payment amounts, pending draft invoices, and auto-generated enrollment tokens.'
          ]
        }
      ]
    },
    {
      key: 'PUBLIC',
      title: 'Public Portal & Career Utilities',
      icon: 'bi bi-globe',
      description: 'Manage guest portals, public coding lists, job boards, and shared certificates.',
      items: [
        {
          id: 'public-jobs',
          title: 'Public Placement Board',
          icon: 'bi bi-briefcase',
          description: 'Curated jobs list, skills filters, and applicant flow.',
          details: [
            '<strong>Job Sourcing Filter</strong>: Users search and filter listings by tech stacks, salary levels, and job titles.',
            '<strong>Guest Mode Fallbacks</strong>: Unauthenticated visitors see cached job openings, limited description snippets, and CTA prompts to log in.',
            '<strong>Easy Apply Sliding Drawer</strong>: Details open in a slide-out drawer, allowing candidates to submit their ATS resumes directly.'
          ]
        },
        {
          id: 'public-practice',
          title: 'Practice Arena & Contests',
          icon: 'bi bi-code-square',
          description: 'Public coding challenges and timed contests.',
          details: [
            '<strong>Public Practice List</strong>: List of coding challenges accessible without login, utilizing the basic compilation sandbox.',
            '<strong>Leaderboards</strong>: Renders student rankings based on scores and average challenge completion speed.',
            '<strong>Publishing Controls</strong>: Admins select featured questions, set test parameters, and toggle the public visibility of questions.'
          ]
        }
      ]
    }
  ];

  ngOnInit(): void {
    // Initialize expand states for all guide items
    this.categories.forEach(cat => {
      cat.items.forEach(item => {
        this.expandedItems[item.id] = false;
      });
    });
    // Open the first item of the active category by default
    const firstItemId = this.categories[0]?.items[0]?.id;
    if (firstItemId) {
      this.expandedItems[firstItemId] = true;
    }
  }

  constructor(private router: Router) {}

  selectCategory(categoryKey: string) {
    this.activeCategory = categoryKey;
    // Collapse all items, open first item in the selected category
    const cat = this.categories.find(c => c.key === categoryKey);
    if (cat && cat.items.length) {
      cat.items.forEach(item => {
        this.expandedItems[item.id] = false;
      });
      this.expandedItems[cat.items[0].id] = true;
    }
  }

  toggleAccordion(itemId: string) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }

  isExpanded(itemId: string): boolean {
    return !!this.expandedItems[itemId];
  }

  get filteredCategories(): GuideCategory[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.categories;
    }

    return this.categories.map(cat => {
      const matchedItems = cat.items.filter(item => {
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesDetails = item.details.some(detail => detail.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesDetails;
      });

      return {
        ...cat,
        items: matchedItems
      };
    }).filter(cat => cat.items.length > 0);
  }

  goBack() {
    this.router.navigate(['/dashboard/admin/actions']);
  }
}
