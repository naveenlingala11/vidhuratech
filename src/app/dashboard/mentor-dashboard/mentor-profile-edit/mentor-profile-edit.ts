import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MentorProfile, MentorService } from '../../../services/mentor.service';

@Component({
  selector: 'app-mentor-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mentor-profile-edit.html',
  styleUrls: ['./mentor-profile-edit.css']
})
export class MentorProfileEdit implements OnInit {
  profile: MentorProfile = {
    userId: 0,
    name: '',
    email: '',
    phone: '',
    profileImageUrl: '',
    currentCompany: '',
    currentRole: '',
    yearsOfExperience: 0,
    biography: '',
    skills: '',
    languages: '',
    linkedinUrl: '',
    githubUrl: '',
    rating: 5.0,
    reviewsCount: 0,
    pricePerHour: 0,
    featured: false,
    active: true
  };

  loading = true;
  saving = false;
  errorMessage = '';

  constructor(
    private mentorService: MentorService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.mentorService.getMentorProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        if (this.profile && !this.profile.pricePerMonth) {
          this.profile.pricePerMonth = this.profile.pricePerHour ? this.profile.pricePerHour * 4 : 5000;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load your profile. Please make sure you are authenticated with correct permissions.';
        this.loading = false;
      }
    });
  }

  saveProfile() {
    if (!this.profile.currentRole?.trim()) {
      this.toastr.warning('Please enter your current role');
      return;
    }
    if (!this.profile.currentCompany?.trim()) {
      this.toastr.warning('Please enter your current company');
      return;
    }
    if (this.profile.yearsOfExperience < 0) {
      this.toastr.warning('Experience cannot be negative');
      return;
    }
    if (this.profile.pricePerMonth !== undefined && this.profile.pricePerMonth !== null && this.profile.pricePerMonth < 0) {
      this.toastr.warning('Monthly rate cannot be negative');
      return;
    }

    this.saving = true;
    const updateData = {
      currentCompany: this.profile.currentCompany.trim(),
      currentRole: this.profile.currentRole.trim(),
      yearsOfExperience: this.profile.yearsOfExperience,
      biography: this.profile.biography?.trim() || '',
      skills: this.profile.skills?.trim() || '',
      languages: this.profile.languages?.trim() || '',
      linkedinUrl: this.profile.linkedinUrl?.trim() || '',
      githubUrl: this.profile.githubUrl?.trim() || '',
      pricePerMonth: this.profile.pricePerMonth,
      pricePerHour: Math.round((this.profile.pricePerMonth || 5000) / 4)
    };

    this.mentorService.updateMentorProfile(updateData).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success('Mentor profile updated successfully');
        this.router.navigate(['/dashboard/mentor']);
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Failed to update your profile. Please try again.');
      }
    });
  }
}
