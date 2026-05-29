import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type CompanyTrack = 'ALL' | 'SERVICE' | 'PRODUCT' | 'CONSULTING';
type SortMode = 'FEATURED' | 'AZ' | 'TRACK';

interface PreparationCompany {
  name: string;
  logo: string;
  desc: string;
  track: Exclude<CompanyTrack, 'ALL'>;
  focus: string[];
  hiringRoute: string;
  featured: boolean;
  accent: 'teal' | 'blue' | 'amber' | 'green';
}

@Component({
  selector: 'app-preparation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preparation.html',
  styleUrl: './preparation.css',
})
export class Preparation {
  readonly trackFilters: { value: CompanyTrack; label: string }[] = [
    { value: 'ALL', label: 'All Companies' },
    { value: 'SERVICE', label: 'IT Services' },
    { value: 'PRODUCT', label: 'Product' },
    { value: 'CONSULTING', label: 'Consulting' },
  ];

  readonly companies: PreparationCompany[] = [
    {
      name: 'TCS',
      logo: 'logos/tcs.svg',
      desc: 'Large-scale placement preparation for NQT and graduate hiring.',
      track: 'SERVICE',
      focus: ['Aptitude', 'Coding', 'Verbal'],
      hiringRoute: 'NQT Practice',
      featured: true,
      accent: 'teal',
    },
    {
      name: 'Infosys',
      logo: 'logos/infosys.svg',
      desc: 'Technical and reasoning practice for graduate recruitment.',
      track: 'SERVICE',
      focus: ['Reasoning', 'Python', 'Technical'],
      hiringRoute: 'Placement Tests',
      featured: true,
      accent: 'blue',
    },
    {
      name: 'Wipro',
      logo: 'logos/wipro.svg',
      desc: 'Role readiness resources for assessment and coding rounds.',
      track: 'SERVICE',
      focus: ['Aptitude', 'Coding', 'HR'],
      hiringRoute: 'Elite Practice',
      featured: true,
      accent: 'green',
    },
    {
      name: 'Cognizant',
      logo: 'logos/cognizant.svg',
      desc: 'Preparation paths for IT services and digital engineering roles.',
      track: 'SERVICE',
      focus: ['Technical', 'SQL', 'Coding'],
      hiringRoute: 'GenC Track',
      featured: false,
      accent: 'blue',
    },
    {
      name: 'EY',
      logo: 'logos/ey.svg',
      desc: 'Interview and assessment preparation for consulting technology roles.',
      track: 'CONSULTING',
      focus: ['Aptitude', 'Case Skills', 'HR'],
      hiringRoute: 'Consulting Track',
      featured: false,
      accent: 'amber',
    },
    {
      name: 'IBM',
      logo: 'logos/ibm.svg',
      desc: 'Enterprise technology preparation for developer and analyst hiring.',
      track: 'PRODUCT',
      focus: ['Java', 'Cloud', 'Coding'],
      hiringRoute: 'Technical Track',
      featured: false,
      accent: 'blue',
    },
    {
      name: 'Amazon',
      logo: 'logos/amazon.svg',
      desc: 'Structured problem-solving preparation for product engineering roles.',
      track: 'PRODUCT',
      focus: ['DSA', 'Coding', 'Behavioral'],
      hiringRoute: 'SDE Practice',
      featured: true,
      accent: 'amber',
    },
    {
      name: 'Zoho',
      logo: 'logos/zoho.svg',
      desc: 'Hands-on programming and technical interview preparation.',
      track: 'PRODUCT',
      focus: ['Coding', 'Logic', 'Java'],
      hiringRoute: 'Developer Track',
      featured: true,
      accent: 'green',
    },
    {
      name: 'Deloitte',
      logo: 'logos/deloitte.svg',
      desc: 'Assessment and interview preparation for technology consulting.',
      track: 'CONSULTING',
      focus: ['Aptitude', 'Technical', 'Interview'],
      hiringRoute: 'NLA Practice',
      featured: true,
      accent: 'green',
    },
    {
      name: 'KPMG',
      logo: 'logos/kpmg.svg',
      desc: 'Preparation content for advisory, technology and analyst hiring.',
      track: 'CONSULTING',
      focus: ['Reasoning', 'Case Skills', 'HR'],
      hiringRoute: 'Advisory Track',
      featured: false,
      accent: 'blue',
    },
    {
      name: 'Meta',
      logo: 'logos/meta.svg',
      desc: 'Advanced coding and problem-solving preparation for product roles.',
      track: 'PRODUCT',
      focus: ['DSA', 'Systems', 'Coding'],
      hiringRoute: 'Engineering Track',
      featured: false,
      accent: 'blue',
    },
    {
      name: 'Microsoft',
      logo: 'logos/microsoft.svg',
      desc: 'Technical preparation for software engineering opportunities.',
      track: 'PRODUCT',
      focus: ['DSA', 'Coding', 'CS Basics'],
      hiringRoute: 'SDE Practice',
      featured: true,
      accent: 'teal',
    },
    {
      name: 'PwC',
      logo: 'logos/pwc.svg',
      desc: 'Professional readiness for consulting and technology advisory roles.',
      track: 'CONSULTING',
      focus: ['Aptitude', 'Interview', 'Analytics'],
      hiringRoute: 'Advisory Track',
      featured: false,
      accent: 'amber',
    },
    {
      name: 'Tech Mahindra',
      logo: 'logos/tech-mahindra.svg',
      desc: 'Placement preparation for service delivery and technical roles.',
      track: 'SERVICE',
      focus: ['Aptitude', 'Coding', 'Communication'],
      hiringRoute: 'Graduate Track',
      featured: false,
      accent: 'teal',
    },
    {
      name: 'Salesforce',
      logo: 'logos/salesforce.svg',
      desc: 'Developer preparation for cloud product and platform careers.',
      track: 'PRODUCT',
      focus: ['Java', 'Cloud', 'Coding'],
      hiringRoute: 'Developer Track',
      featured: true,
      accent: 'blue',
    },
  ];

  search = '';
  selectedTrack: CompanyTrack = 'ALL';
  sortMode: SortMode = 'FEATURED';

  constructor(private router: Router) {}

  get featuredCompanies(): PreparationCompany[] {
    return this.companies.filter((company) => company.featured).slice(0, 4);
  }

  get filteredCompanies(): PreparationCompany[] {
    const term = this.search.trim().toLowerCase();

    const filtered = this.companies.filter((company) => {
      const searchableText = [
        company.name,
        company.desc,
        company.track,
        company.hiringRoute,
        ...company.focus,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!term || searchableText.includes(term)) &&
        (this.selectedTrack === 'ALL' || company.track === this.selectedTrack)
      );
    });

    if (this.sortMode === 'AZ') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (this.sortMode === 'TRACK') {
      return [...filtered].sort(
        (a, b) => a.track.localeCompare(b.track) || a.name.localeCompare(b.name),
      );
    }

    return [...filtered].sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
    );
  }

  get serviceCount(): number {
    return this.companies.filter((company) => company.track === 'SERVICE').length;
  }

  get productCount(): number {
    return this.companies.filter((company) => company.track === 'PRODUCT').length;
  }

  get consultingCount(): number {
    return this.companies.filter((company) => company.track === 'CONSULTING').length;
  }

  selectTrack(track: CompanyTrack): void {
    this.selectedTrack = track;
  }

  resetFilters(): void {
    this.search = '';
    this.selectedTrack = 'ALL';
    this.sortMode = 'FEATURED';
  }

  trackLabel(track: Exclude<CompanyTrack, 'ALL'>): string {
    const labels = {
      SERVICE: 'IT Services',
      PRODUCT: 'Product',
      CONSULTING: 'Consulting',
    };

    return labels[track];
  }

  openCompany(company: PreparationCompany): void {
    this.router.navigate(['/company', company.name]);
  }
}
