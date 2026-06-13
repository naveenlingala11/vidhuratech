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

  successMessage = '';
  errorMessage = '';
  deletingCompanyId: number | null = null;
  Math = Math;

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
        this.cd.detectChanges();
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
      this.errorMessage = 'Please enter both the Company Name and Careers URL.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/admin/companies`, this.newCompany).subscribe({
      next: () => {
        this.successMessage = `Company "${this.newCompany.company}" added successfully!`;
        setTimeout(() => this.successMessage = '', 4000);
        this.newCompany = {
          company: '',
          type: 'greenhouse',
          url: '',
        };
        this.loadCompanies();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to add company. Please check input parameters.';
        setTimeout(() => this.errorMessage = '', 4000);
        this.cd.detectChanges();
      }
    });
  }

  // ================= DELETE =================
  confirmDelete(id: number) {
    this.deletingCompanyId = id;
  }

  cancelDelete() {
    this.deletingCompanyId = null;
  }

  deleteCompany(id: number) {
    this.isLoading = true;
    this.deletingCompanyId = null;
    this.http.delete(`${environment.apiUrl}/admin/companies/${id}`).subscribe({
      next: () => {
        this.successMessage = 'Company deleted successfully.';
        setTimeout(() => this.successMessage = '', 4000);
        this.loadCompanies();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to delete company.';
        setTimeout(() => this.errorMessage = '', 4000);
        this.cd.detectChanges();
      }
    });
  }

  // ================= TOGGLE =================
  toggleCompany(c: any) {
    this.http.put(`${environment.apiUrl}/admin/companies/${c.id}/toggle`, {}).subscribe({
      next: () => {
        c.active = !c.active; // instant UI update
        this.successMessage = `Company "${c.company}" ${c.active ? 'enabled' : 'disabled'} successfully.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to update company status.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // ================= BADGE STYLE =================
  getStatusClass(active: boolean) {
    return active ? 'active-badge' : 'inactive-badge';
  }
}