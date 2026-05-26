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
  loading = false;
  saving = false;
  totalPages = 0;
  totalElements = 0;
  searchTimer: any;

  previewUser: AdminUser | null = null;
  editUser: AdminUser | null = null;
  deleteUser: AdminUser | null = null;

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

  saveUser(): void {
    if (!this.editUser) return;

    this.saving = true;

    this.service.updateUser(this.editUser.id, this.editUser).subscribe({
      next: () => {
        this.saving = false;
        this.closeModals();
        this.loadUsers();
        this.loadStats();
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
  }

  refresh(): void {
    this.loadUsers();
    this.loadStats();
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
}
