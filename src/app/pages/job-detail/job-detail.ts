import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Job, JobService } from '../../services/job';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.css',
})
export class JobDetail {
  job$!: Observable<Job | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.job$ = this.jobService.getById(id).pipe(
      map((res) => {
        if (!res) return null;

        // 🔥 FIX SKILLS STRING → ARRAY
        return {
          ...res,
          skills: res.skills
            ? (res.skills as any)
                .toString()
                .split(',')
                .map((s: string) => s.trim())
            : [],
        };
      }),
    );
  }

  // 🔥 APPLY BUTTON FIX
  openApply(link?: string) {
    if (!link || link === '#') {
      alert('No apply link available');
      return;
    }

    // 🔥 FORCE OPEN (WORKS 100%)
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  getPostedAgo(postedAt: string): string {
    if (!postedAt) return 'Recently';

    const safe = postedAt.split('.')[0]; // 🔥 fix microseconds bug
    const diff = Date.now() - new Date(safe).getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';

    return `${days} days ago`;
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }
}