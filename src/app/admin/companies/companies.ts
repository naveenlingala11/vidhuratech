import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.html',
  styleUrl: './companies.css',
})
export class CompaniesComponent implements OnInit {

  companies: any[] = [];
  totalCompanies = 0;

  companyPage = 0;
  companySize = 10;

  searchCompany = '';
  sortBy = 'company';
  direction = 'asc';
  activeFilter: any = '';

  isLoading = false;

  newCompany = {
    company: '',
    type: 'greenhouse',
    url: '',
  };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadCompanies();
  }

  // ================= LOAD =================
  loadCompanies() {
    this.isLoading = true;

    let url = `${environment.apiUrl}/admin/companies?page=${this.companyPage}&size=${this.companySize}&search=${this.searchCompany}&sortBy=${this.sortBy}&direction=${this.direction}`;

    if (this.activeFilter !== '') {
      url += `&active=${this.activeFilter}`;
    }

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.companies = data.content;
        this.totalCompanies = data.totalElements;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  refresh() {
    this.loadCompanies();
  }

  // ================= PAGINATION =================
  nextCompanyPage() {
    if ((this.companyPage + 1) * this.companySize < this.totalCompanies) {
      this.companyPage++;
      this.loadCompanies();
    }
  }

  prevCompanyPage() {
    if (this.companyPage > 0) {
      this.companyPage--;
      this.loadCompanies();
    }
  }

  // ================= SEARCH =================
  onSearchChange() {
    this.companyPage = 0;
    this.loadCompanies();
  }

  // ================= SORT =================
  changeSort(field: string) {
    if (this.sortBy === field) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.direction = 'asc';
    }
    this.loadCompanies();
  }

  // ================= ADD =================
  addCompany() {
    if (!this.newCompany.company || !this.newCompany.url) {
      alert('Fill required fields');
      return;
    }

    fetch(`${environment.apiUrl}/admin/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.newCompany),
    }).then(() => {
      alert('Company Added ✅');

      this.newCompany = {
        company: '',
        type: 'greenhouse',
        url: '',
      };

      this.loadCompanies();
    });
  }

  // ================= DELETE =================
  deleteCompany(id: number) {
    if (!confirm('Delete this company?')) return;

    fetch(`${environment.apiUrl}/admin/companies/${id}`, {
      method: 'DELETE',
    }).then(() => this.loadCompanies());
  }

  // ================= TOGGLE =================
  toggleCompany(c: any) {
    fetch(`${environment.apiUrl}/admin/companies/${c.id}/toggle`, {
      method: 'PUT'
    }).then(() => {
      c.active = !c.active; // instant UI update
    });
  }

  // ================= BADGE STYLE =================
  getStatusClass(active: boolean) {
    return active ? 'active-badge' : 'inactive-badge';
  }
}