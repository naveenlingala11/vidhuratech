import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PseudoChallengeService } from '../../services/pseudo-challenge';

type StudentFilter = 'ALL' | 'NOT_ATTEMPTED' | 'PASS' | 'FAIL';

@Component({
  selector: 'app-student-pseudo-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-pseudo-challenges.html',
  styleUrls: ['./student-pseudo-challenges.css'],
})
export class StudentPseudoChallengesComponent implements OnInit {
  loading = false;
  toast = '';
  search = '';
  statusFilter: StudentFilter = 'ALL';

  challenges: any[] = [];

  constructor(
    private service: PseudoChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  get filteredChallenges(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.challenges.filter((item) => {
      const status = item.status || 'NOT_ATTEMPTED';

      const text = [item.title, item.problemStatement, item.batchId, status]
        .join(' ')
        .toLowerCase();

      return text.includes(term) && (this.statusFilter === 'ALL' || status === this.statusFilter);
    });
  }

  get completedCount(): number {
    return this.challenges.filter((item) => item.status === 'PASS' || item.status === 'FAIL')
      .length;
  }

  get passedCount(): number {
    return this.challenges.filter((item) => item.status === 'PASS').length;
  }

  get pendingCount(): number {
    return this.challenges.filter((item) => !item.status || item.status === 'NOT_ATTEMPTED').length;
  }

  get averageScore(): number {
    if (!this.challenges.length) {
      return 0;
    }

    const total = this.challenges.reduce((sum, item) => sum + (item.lastScore || 0), 0);

    return Math.round(total / this.challenges.length);
  }

  loadChallenges(): void {
    this.loading = true;

    this.service.getStudentChallenges().subscribe({
      next: (res: any) => {
        this.challenges = res?.data || [];
        this.loading = false;
      },

      error: (error) => {
        console.error(error);

        this.challenges = [];
        this.loading = false;

        this.showToast('Unable to load challenges');
      },
    });
  }

  openChallenge(id: number): void {
    this.router.navigate(['/dashboard/student/pseudocode-lab', id]);
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PASS':
        return 'status-pass';

      case 'FAIL':
        return 'status-fail';

      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PASS':
        return 'bi-check-circle-fill';

      case 'FAIL':
        return 'bi-x-circle-fill';

      default:
        return 'bi-clock-history';
    }
  }

  showToast(message: string): void {
    this.toast = message;

    setTimeout(() => {
      this.toast = '';
    }, 2500);
  }
}
