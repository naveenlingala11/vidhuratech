import { Component } from '@angular/core';
import { Job, JobService } from '../../services/job';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jobs-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs-home.html',
  styleUrl: './jobs-home.css',
})
export class JobsHome {

  jobs: Job[] = [];
  companies: any[] = [];

  searchText = '';
  selectedLocation = '';
  experience = '';

  totalJobs = 0;

  isLoading = true;
  skeletons = [1,2,3,4,5,6,7,8,9];

  suggestions: string[] = [];
  allSuggestions: string[] = [
    'Java','Angular','React','Python','Fresher','Remote'
  ];

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadJobs();
    this.loadFilters();
  }

  loadJobs() {
    this.isLoading = true;

    this.jobService.getJobs(0).subscribe(res => {
      this.jobs = res.content.slice(0, 9);
      this.totalJobs = res.totalElements;
      this.isLoading = false;
    });
  }

  loadFilters() {
    this.jobService.getFilters().subscribe(res => {
      this.companies = res.companies || [];
    });
  }

  goToJobs() {
    this.router.navigate(['/jobs'], {
      queryParams: {
        search: this.searchText,
        location: this.selectedLocation,
        exp: this.experience
      }
    });
  }

  quickSearch(skill: string) {
    this.searchText = skill;
    this.goToJobs();
  }

  goToDetail(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/jobs', id]);
  }

  onSearchChange() {
    const val = this.searchText.toLowerCase();
    this.suggestions = this.allSuggestions.filter(s =>
      s.toLowerCase().includes(val)
    );
  }

  selectSuggestion(s: string) {
    this.searchText = s;
    this.suggestions = [];
  }

  getCompanyLogo(company: string | undefined): string {
    if (!company) {
      return 'https://ui-avatars.com/api/?name=?';
    }
    const clean = company.toLowerCase().replace(/\s+/g, '');
    return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
  }
}