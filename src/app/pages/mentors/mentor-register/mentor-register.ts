import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MentorService } from '../../../services/mentor.service';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-mentor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mentor-register.html',
  styleUrls: ['./mentor-register.css'],
})
export class MentorRegisterComponent implements OnInit {
  currentStep = 1;
  submitting = false;
  errorMessage = '';
  success = false;

  // Auth Gate State
  loggedInUser: any = null;
  isLoggedIn = false;
  isAlreadyMentor = false;
  showRoleChangePopup = false; // For non-mentor logged-in users

  // Step 1: Account Setup
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  profileImageUrl = '';

  // Step 2: Professional Details
  currentCompany = '';
  currentRole = '';
  yearsOfExperience: number | null = null;
  pricePerMonth: number | null = 5000;
  languages = 'English, Telugu';

  // Step 3: Expertise & Bio
  biography = '';
  skills = ''; // Comma-separated list

  // Step 4: Socials & Verification
  linkedinUrl = '';
  githubUrl = '';
  verificationDocumentUrl = '';

  constructor(
    private mentorService: MentorService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthState();
  }

  checkAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loggedInUser = this.authService.getUser();
      const role = this.loggedInUser?.role?.toUpperCase() || '';
      if (role === 'MENTOR') {
        this.isAlreadyMentor = true;
      } else {
        // User is logged in but not a mentor (STUDENT, TRAINER, ADMIN, etc.)
        this.showRoleChangePopup = true;
      }
    }
  }

  goToDashboard(): void {
    const role = (this.loggedInUser?.role || 'student').toLowerCase();
    this.router.navigate([`/dashboard/${role}`]);
  }

  goToMentors(): void {
    this.router.navigate(['/mentors']);
  }

  dismissPopupAndStay(): void {
    // User dismisses the popup → go back to mentors page
    this.showRoleChangePopup = false;
    this.router.navigate(['/mentors']);
  }

  openWhatsAppContact(): void {
    const userName = this.loggedInUser?.name || 'User';
    const userEmail = this.loggedInUser?.email || '';
    const message = `👋 Hello Vidhura Tech Team,\n\nI am ${userName} (${userEmail}).\n\nI would like to become a Mentor on the Vidhura Tech platform. Could you please assist me with the role change and the onboarding process?\n\nThank you!`;
    const url = `https://api.whatsapp.com/send?phone=919108057464&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // File Picker Handlers
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please upload a valid image file.';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 2MB.';
        return;
      }

      this.errorMessage = '';
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
      };
      reader.onerror = () => {
        this.errorMessage = 'Failed to read the image file.';
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  removeProfileImage(): void {
    this.profileImageUrl = '';
  }

  // Password strength checker
  getPasswordStrength(): { score: number; label: string; color: string } {
    if (!this.password) return { score: 0, label: 'None', color: '#cbd5e1' };
    let score = 0;
    if (this.password.length >= 6) score++;
    if (this.password.length >= 10) score++;
    if (/[A-Z]/.test(this.password)) score++;
    if (/[0-9]/.test(this.password)) score++;
    if (/[^A-Za-z0-9]/.test(this.password)) score++;

    switch (score) {
      case 1:
      case 2:
        return { score: 20, label: 'Weak', color: '#ef4444' };
      case 3:
      case 4:
        return { score: 60, label: 'Good', color: '#f59e0b' };
      case 5:
        return { score: 100, label: 'Strong', color: '#10b981' };
      default:
        return { score: 0, label: 'None', color: '#cbd5e1' };
    }
  }

  // Split skills helper for preview
  getSkillsList(skillsStr: string): string[] {
    if (!skillsStr) return [];
    return skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  validateStep(step: number): boolean {
    this.errorMessage = '';

    if (step === 1) {
      if (!this.name.trim()) {
        this.errorMessage = 'Full Name is required.';
        return false;
      }
      if (!this.email.trim() || !this.email.includes('@')) {
        this.errorMessage = 'Enter a valid email address.';
        return false;
      }
      const digits = this.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        this.errorMessage = 'Enter a valid 10-digit phone number.';
        return false;
      }
      if (!this.password || this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters.';
        return false;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return false;
      }
    }

    if (step === 2) {
      if (!this.currentCompany.trim()) {
        this.errorMessage = 'Current Company is required.';
        return false;
      }
      if (!this.currentRole.trim()) {
        this.errorMessage = 'Current Job Role is required.';
        return false;
      }
      if (this.yearsOfExperience === null || this.yearsOfExperience < 0) {
        this.errorMessage = 'Enter valid years of experience.';
        return false;
      }
      if (this.pricePerMonth === null || this.pricePerMonth < 0) {
        this.errorMessage = 'Enter a valid monthly price (set 0 for Free).';
        return false;
      }
    }

    if (step === 3) {
      if (!this.biography.trim() || this.biography.length < 30) {
        this.errorMessage = 'Biography must be at least 30 characters.';
        return false;
      }
      if (!this.skills.trim()) {
        this.errorMessage = 'Please specify at least one skill.';
        return false;
      }
    }

    if (step === 4) {
      if (!this.linkedinUrl.trim() || !this.linkedinUrl.includes('linkedin.com')) {
        this.errorMessage = 'A valid LinkedIn Profile URL is required.';
        return false;
      }
      if (!this.verificationDocumentUrl.trim() || !this.verificationDocumentUrl.startsWith('http')) {
        this.errorMessage = 'Please provide a valid verification link (e.g. Google Drive/Dropbox/Resume link).';
        return false;
      }
    }

    return true;
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (!this.validateStep(4)) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      password: this.password,
      profileImageUrl: this.profileImageUrl,
      currentCompany: this.currentCompany.trim(),
      currentRole: this.currentRole.trim(),
      yearsOfExperience: this.yearsOfExperience,
      pricePerMonth: this.pricePerMonth,
      languages: this.languages.trim(),
      biography: this.biography.trim(),
      skills: this.skills.trim(),
      linkedinUrl: this.linkedinUrl.trim(),
      githubUrl: this.githubUrl.trim(),
      verificationDocumentUrl: this.verificationDocumentUrl.trim(),
    };

    this.mentorService.applyAsMentor(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.success = true;
          // Auto redirect to login after 5 seconds
          setTimeout(() => {
            if (this.success) {
              this.router.navigate(['/login']);
            }
          }, 6000);
        } else {
          this.errorMessage = 'Failed to submit registration. Please try again.';
        }
      },
      error: (err) => {
        this.submitting = false;
        if (err.error && err.error.message === 'EMAIL_ALREADY_EXISTS') {
          this.errorMessage = 'An account with this email address already exists.';
        } else {
          this.errorMessage = err.error?.message || 'Server error. Please check your fields and try again.';
        }
      },
    });
  }
}
