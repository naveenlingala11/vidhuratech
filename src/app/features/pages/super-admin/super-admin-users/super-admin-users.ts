import { afterNextRender, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SuperAdminService } from '../service/super-admin';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-users.html',
  styleUrls: ['./super-admin-users.css']
})
export class SuperAdminUsers {

  users: any[] = [];

  search = '';
  selectedRole = '';
  selectedStatus = '';

  showModal = false;
  showEditModal = false;

  loading = false;

  page = 0;
  totalPages = 0;

  form = this.getEmptyForm();
  editForm: any = {};

  roles = [
    'ADMIN',
    'HR',
    'MANAGER',
    'TRAINER',
    'MENTOR'
  ];

  debounceTimer: any;

  constructor(
    private userService: SuperAdminService,
    private toastr: ToastrService
  ) {
    afterNextRender(() => {
      this.loadUsers();
    });
  }

  getEmptyForm() {
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'ADMIN'
    };
  }

  loadUsers() {
    this.userService.getUsers(
      this.page,
      10,
      this.search,
      this.selectedRole,
      this.selectedStatus === ''
        ? undefined
        : this.selectedStatus === 'ACTIVE'
    ).subscribe((res: any) => {

      setTimeout(() => {
        this.users = [...(res.content || [])];
        this.totalPages = res.totalPages || 1;
      });

    });
  }

  onSearchChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.page = 0;
      this.loadUsers();
    }, 400);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;

    this.form = this.getEmptyForm();

    this.loading = false;
  }

  createUser() {
    if (!this.form.name || !this.form.email || !this.form.phone || !this.form.password) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    this.loading = true;

    this.userService.createInternalUser(this.form).subscribe({
      next: (res) => {
        this.toastr.success('User Created Successfully');

        this.closeModal();     // CLOSE MODAL
        this.loadUsers();      // REFRESH TABLE

        this.loading = false;
      },

      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Failed to Create User'
        );

        this.loading = false;
      }
    });
  }

  openEdit(user: any) {
    this.editForm = { ...user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editForm = {};
  }

  updateUser() {
    this.userService.updateUser(
      this.editForm.id,
      this.editForm
    ).subscribe(() => {
      this.toastr.success('User Updated');
      this.closeEditModal();
      this.loadUsers();
    });
  }

  toggle(user: any) {
    const confirmed = confirm(
      `Are you sure to ${user.active ? 'Deactivate' : 'Activate'} this user?`
    );

    if (!confirmed) return;

    this.userService.toggleUserStatus(user.id)
      .subscribe(() => {
        this.toastr.success('Status Updated');
        this.loadUsers();
      });
  }

  delete(user: any) {
    const confirmed = confirm(
      `Delete ${user.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    this.userService.deleteUser(user.id)
      .subscribe(() => {
        this.toastr.success('User Deleted');
        this.loadUsers();
      });
  }

  resetPassword(user: any) {
    const newPassword = prompt('Enter New Password');

    if (!newPassword) return;

    this.userService.resetPassword(
      user.id,
      newPassword
    ).subscribe(() => {
      this.toastr.success('Password Reset Successfully');
    });
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  viewAuditLogs(user: any) {
    this.toastr.info(`Audit Logs for ${user.name} Coming Soon`);
  }
}