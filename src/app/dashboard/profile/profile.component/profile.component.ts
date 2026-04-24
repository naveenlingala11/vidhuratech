import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user: any;
  editMode = false;

  form = {
    name: '',
    phone: ''
  };

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();

    this.form.name = this.user?.name;
    this.form.phone = this.user?.phone;
  }

  getInitials(): string {
    const name = this.user?.name || '';
    const parts = name.trim().split(' ');

    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    // TODO: call API
    this.user.name = this.form.name;
    this.user.phone = this.form.phone;

    localStorage.setItem('user', JSON.stringify(this.user));

    this.editMode = false;
    alert('Profile updated successfully');
  }

  cancelEdit() {
    this.form.name = this.user.name;
    this.form.phone = this.user.phone;
    this.editMode = false;
  }
}