import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../services/admin-users';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  loading = false;
  totalPages = 0;

  filters = {
    keyword: '',
    role: '',
    page: 0,
    size: 10
  };

  roles = [
    'STUDENT', 'TRAINER', 'ADMIN', 'HR', 'MANAGER', 'MENTOR'
  ];

  constructor(private service: AdminUserService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;

    this.service.getUsers(this.filters)
      .subscribe({
        next: (res: any) => {
          this.users = res.data?.content || [];
          this.totalPages = res.data?.totalPages || 0;

          this.loading = false;

          this.cdr.detectChanges(); // 🔥 FIX
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges(); // 🔥 FIX
        }
      });
  }

  search() {
    this.filters.page = 0;
    this.loadUsers();
  }

  setRole(role: string) {
    this.filters.role = role;
    this.loadUsers();
  }

  nextPage() {
    if (this.filters.page + 1 >= this.totalPages) return;
    this.filters.page++;
    this.loadUsers();
  }

  prevPage() {
    if (this.filters.page === 0) return;
    this.filters.page--;
    this.loadUsers();
  }
}