import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminUserService } from '../services/admin-users';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  deleted: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  people360: any[] = [];

  loading = false;
  peopleLoading = false;
  historyLoading = false;
  saving = false;

  totalPages = 0;
  totalElements = 0;
  searchTimer: any;

  peoplePage = 0;
  peopleSize = 6;
  peopleSortBy = 'activity';
  peopleSortDir: 'asc' | 'desc' = 'desc';

  previewUser: AdminUser | null = null;
  editUser: AdminUser | null = null;
  deleteUser: AdminUser | null = null;
  historyModal: any = null;

  stats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    deletedUsers: 0,
  };

  filters = {
    keyword: '',
    role: '',
    active: '',
    deleted: 'false',
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'desc',
  };

  roles = ['STUDENT', 'TRAINER', 'ADMIN', 'HR', 'MANAGER', 'MENTOR', 'SUPER_ADMIN'];

  constructor(
    private service: AdminUserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
    this.loadPeople360();
  }

  loadUsers(): void {
    this.loading = true;

    this.service.getUsers(this.filters).subscribe({
      next: (res: any) => {
        this.users = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.users = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadPeople360(): void {
    this.peopleLoading = true;

    this.service.getPeople360(this.filters.keyword).subscribe({
      next: (res: any) => {
        this.people360 = res?.data?.content || res?.data || [];
        this.peoplePage = 0;
        this.peopleLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.people360 = [];
        this.peopleLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadStats(): void {
    this.service.getUserStats().subscribe({
      next: (res: any) => {
        this.stats = res.data || this.stats;
        this.cdr.detectChanges();
      },
    });
  }

  search(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filters.page = 0;
      this.loadUsers();
      this.loadPeople360();
    }, 350);
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.loadUsers();
  }

  setRole(role: string): void {
    this.filters.role = role;
    this.applyFilters();
  }

  sort(column: string): void {
    if (this.filters.sortBy === column) {
      this.filters.sortDir = this.filters.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = column;
      this.filters.sortDir = 'asc';
    }

    this.filters.page = 0;
    this.loadUsers();
  }

  sortIcon(column: string): string {
    if (this.filters.sortBy !== column) return 'bi bi-arrow-down-up';
    return this.filters.sortDir === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down';
  }

  nextPage(): void {
    if (this.filters.page + 1 >= this.totalPages) return;
    this.filters.page++;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.filters.page === 0) return;
    this.filters.page--;
    this.loadUsers();
  }

  openPreview(user: AdminUser): void {
    this.previewUser = user;
  }

  openEdit(user: AdminUser): void {
    this.editUser = { ...user };
  }

  openDelete(user: AdminUser): void {
    this.deleteUser = user;
  }

  closeModals(): void {
    this.previewUser = null;
    this.editUser = null;
    this.deleteUser = null;
  }

  openHistory(person: any): void {
    this.historyLoading = true;
    this.historyModal = {
      person,
      summary: {},
      timeline: [],
    };

    this.service.getPersonHistory(person.key).subscribe({
      next: (res: any) => {
        this.historyModal = res?.data || this.historyModal;
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openUserHistory(user: AdminUser): void {
    const key = user.email?.trim()
      ? `EMAIL:${user.email.trim().toLowerCase()}`
      : user.phone?.trim()
        ? `PHONE:${String(user.phone).replace(/\D/g, '')}`
        : `USER:${user.id}`;

    this.openHistory({
      key,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      sources: ['USER'],
    });
  }

  closeHistory(): void {
    this.historyModal = null;
  }

  saveUser(): void {
    if (!this.editUser) return;

    this.saving = true;

    this.service.updateUser(this.editUser.id, this.editUser).subscribe({
      next: () => {
        this.saving = false;
        this.closeModals();
        this.loadUsers();
        this.loadStats();
        this.loadPeople360();
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleStatus(user: AdminUser): void {
    if (user.deleted) return;

    this.service.updateStatus(user.id, !user.active).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStats();
        this.loadPeople360();
      },
    });
  }

  confirmDelete(): void {
    if (!this.deleteUser) return;

    this.saving = true;

    this.service.deleteUser(this.deleteUser.id).subscribe({
      next: () => {
        this.saving = false;
        this.closeModals();
        this.loadUsers();
        this.loadStats();
        this.loadPeople360();
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  restoreUser(user: AdminUser): void {
    this.service.restoreUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStats();
        this.loadPeople360();
      },
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  resetFilters(): void {
    this.filters = {
      keyword: '',
      role: '',
      active: '',
      deleted: 'false',
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
    };

    this.loadUsers();
    this.loadPeople360();
  }

  refresh(): void {
    this.loadUsers();
    this.loadStats();
    this.loadPeople360();
  }

  exportCsv(): void {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Active', 'Deleted'],
      ...this.users.map((u) => [
        u.id,
        u.name,
        u.email,
        u.phone || '',
        u.role,
        u.active ? 'Active' : 'Inactive',
        u.deleted ? 'Deleted' : 'Live',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'users.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages || 1;
    const current = this.filters.page;
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get usersStartRecord(): number {
    if (!this.totalElements) return 0;
    return this.filters.page * this.filters.size + 1;
  }

  get usersEndRecord(): number {
    return Math.min((this.filters.page + 1) * this.filters.size, this.totalElements);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.filters.page) return;

    this.filters.page = page;
    this.loadUsers();
  }

  changePageSize(): void {
    this.filters.page = 0;
    this.loadUsers();
  }

  sortLabel(): string {
    return `${this.filters.sortBy} ${this.filters.sortDir}`;
  }

  get sortedPeople360(): any[] {
    const list = [...this.people360];

    list.sort((a, b) => {
      let av = this.peopleSortValue(a);
      let bv = this.peopleSortValue(b);

      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();

      if (av < bv) return this.peopleSortDir === 'asc' ? -1 : 1;
      if (av > bv) return this.peopleSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  get pagedPeople360(): any[] {
    const start = this.peoplePage * this.peopleSize;
    return this.sortedPeople360.slice(start, start + this.peopleSize);
  }

  get peopleTotalPages(): number {
    return Math.max(1, Math.ceil(this.people360.length / this.peopleSize));
  }

  get peopleStartRecord(): number {
    if (!this.people360.length) return 0;
    return this.peoplePage * this.peopleSize + 1;
  }

  get peopleEndRecord(): number {
    return Math.min((this.peoplePage + 1) * this.peopleSize, this.people360.length);
  }

  sortPeople(column: string): void {
    if (this.peopleSortBy === column) {
      this.peopleSortDir = this.peopleSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.peopleSortBy = column;
      this.peopleSortDir = column === 'activity' ? 'desc' : 'asc';
    }

    this.peoplePage = 0;
  }

  peopleSortIcon(column: string): string {
    if (this.peopleSortBy !== column) return 'bi bi-arrow-down-up';
    return this.peopleSortDir === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down';
  }

  goToPeoplePage(page: number): void {
    if (page < 0 || page >= this.peopleTotalPages) return;
    this.peoplePage = page;
  }

  changePeopleSize(): void {
    this.peoplePage = 0;
  }

  private peopleSortValue(person: any): any {
    if (this.peopleSortBy === 'name') return person?.name || '';
    if (this.peopleSortBy === 'email') return person?.email || person?.phone || '';
    if (this.peopleSortBy === 'plans') return Number(person?.planAccessCount || 0);
    if (this.peopleSortBy === 'courses') return Number(person?.courseEnrollments || 0);

    return (
      Number(person?.planAccessCount || 0) +
      Number(person?.mockTests || 0) +
      Number(person?.assessments || 0) +
      Number(person?.codingChallenges || 0) +
      Number(person?.mockInterviews || 0) +
      Number(person?.courseEnrollments || 0)
    );
  }
}
