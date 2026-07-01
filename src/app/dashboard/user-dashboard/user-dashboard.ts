import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { JobService, Job } from '../../services/job';
import { PublicCourseService } from '../../pages/courses/service/public-course';
import { GamificationService } from '../../services/gamification.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard implements OnInit {
  user: any = {};
  greeting = '';
  profileCompletion = 60;
  dailyQuote = '';
  
  featuredCourses: any[] = [];
  recentJobs: Job[] = [];
  loadingCourses = true;
  loadingJobs = true;

  quickActions = [
    {
      icon: 'bi bi-search',
      title: 'Browse Courses',
      desc: 'Discover our industry-ready training programs',
      route: '/courses',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    },
    {
      icon: 'bi bi-code-square',
      title: 'Practice Arena',
      desc: 'Sharpen your skills with coding challenges',
      route: '/practice',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      icon: 'bi bi-file-earmark-person',
      title: 'Resume Builder',
      desc: 'Build an ATS-optimized resume in minutes',
      route: '/resume',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      icon: 'bi bi-briefcase',
      title: 'Jobs & Careers',
      desc: 'Explore latest openings from top companies',
      route: '/jobs-home',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    },
  ];

  activities = [
    { text: 'Created Vidhura Tech Account', time: 'Just now', icon: 'bi bi-check-circle-fill', done: true },
    { text: 'Completed Email Verification', time: 'Just now', icon: 'bi bi-check-circle-fill', done: true },
    { text: 'Upload Profile Picture', time: 'Pending', icon: 'bi bi-circle', done: false },
    { text: 'Build First Professional Resume', time: 'Pending', icon: 'bi bi-circle', done: false },
  ];

  quotes = [
    "Consistency is the key to unlocking your software engineering potential. Keep coding!",
    "The best way to predict the future is to invent it. Let's build something amazing today.",
    "Every line of code you write is a step closer to your dream tech job. Keep practicing!",
    "Don't study to launch a product; study to learn how to solve real problems.",
    "A journey of a thousand leagues begins with a single step. Start exploring mentors today."
  ];

  dailyStreak = 0;
  rewardPoints = 150;
  claimedToday = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private jobService: JobService,
    private courseService: PublicCourseService,
    public gamificationService: GamificationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.greeting = this.getGreeting();
    this.calculateProfileCompletion();
    this.dailyQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

    this.loadFeaturedCourses();
    this.loadRecentJobs();

    // Track daily login & subscribe to gamification values
    this.gamificationService.trackLogin();
    this.gamificationService.streak$.subscribe(val => this.dailyStreak = val);
    this.gamificationService.points$.subscribe(val => this.rewardPoints = val);
    this.gamificationService.claimedToday$.subscribe(val => this.claimedToday = val);
  }

  claimDailyReward(): void {
    this.gamificationService.claimDailyReward();
  }

  get userInitials(): string {
    const name = String(this.user?.name || 'User');
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private calculateProfileCompletion(): void {
    let completion = 40; // Base completion for creating account & email verification
    if (this.user?.phone) completion += 20;
    if (this.user?.profileImageUrl) completion += 20;
    if (this.user?.name && this.user.name !== 'User') completion += 20;
    this.profileCompletion = completion;
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  private loadFeaturedCourses(): void {
    this.courseService.getFeaturedCourses().subscribe({
      next: (res) => {
        this.featuredCourses = (res || []).slice(0, 3);
        this.loadingCourses = false;
      },
      error: () => {
        // Premium fallback courses
        this.featuredCourses = [
          { title: 'Full Stack Java Development', slug: 'java-fullstack', description: 'Master Spring Boot, Angular, and cloud deployments.', price: 14999 },
          { title: 'Data Structures & Algorithms', slug: 'dsa', description: 'Ace your product company interviews with optimized solutions.', price: 9999 },
          { title: 'React & Frontend Mastery', slug: 'react-frontend', description: 'Build enterprise-grade single-page applications.', price: 7999 }
        ];
        this.loadingCourses = false;
      }
    });
  }

  private loadRecentJobs(): void {
    this.jobService.getJobs(0).subscribe({
      next: (res) => {
        this.recentJobs = (res?.content || []).slice(0, 3);
        this.loadingJobs = false;
      },
      error: () => {
        // Fallback jobs
        this.recentJobs = [
          { id: 1, title: 'Software Engineer', companyName: 'Google', location: 'Hyderabad (Hybrid)', salary: 'LPA 18 - 25', experience: '0 - 2 Years', jobType: 'Full-time' } as any,
          { id: 2, title: 'Associate Frontend Developer', companyName: 'Accenture', location: 'Bangalore (On-site)', salary: 'LPA 6 - 8', experience: '0 - 1 Years', jobType: 'Full-time' } as any,
          { id: 3, title: 'Java Developer Intern', companyName: 'Wipro', location: 'Remote', salary: 'LPA 4 - 6', experience: 'Freshers', jobType: 'Internship' } as any
        ];
        this.loadingJobs = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
