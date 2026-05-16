import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal';
import { Job, JobService } from '../../services/job';
@Component({
  selector: 'app-placements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placements.html',
  styleUrl: './placements.css',
})
export class Placements implements OnInit {
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
      icon: '💻'
    },
    {
      step: '02',
      title: 'Resume Building',
      desc: 'Professional ATS-friendly resumes aligned with company hiring.',
      icon: '📄'
    },
    {
      step: '03',
      title: 'Mock Interviews',
      desc: 'Technical + HR interview simulations with expert feedback.',
      icon: '🎯'
    },
    {
      step: '04',
      title: 'Placement Support',
      desc: 'Daily job updates and continuous placement guidance.',
      icon: '🚀'
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
    private router: Router
  ) {}
  ngOnInit(): void {
    this.loadPlacementData();
  }
  loadPlacementData() {
    this.loading = true;
    this.jobService.getJobs(0).subscribe({
      next: (res) => {
        const jobs = res.content || [];
        this.recentPlacements = jobs.slice(0, 6);
        this.placedStudents = jobs.length * 12;
        this.interviewsScheduled = jobs.length * 40;
        this.hiringCompanies = new Set(
          jobs.map(j => j.companyName)
        ).size;
        this.companies = [...new Set(
          jobs.map(j => j.companyName)
        )]
        .filter(Boolean)
        .map(name => ({ name }));
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  openEnrollModal() {
    this.modalService.open({
      course: 'Placement Assistance Program'
    });
  }
  goToJobs() {
    this.router.navigate(['/jobs']);
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