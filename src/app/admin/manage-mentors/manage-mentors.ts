import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MentorService, MentorProfile } from '../../services/mentor.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manage-mentors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-mentors.html',
  styleUrls: ['./manage-mentors.css'],
})
export class ManageMentorsComponent implements OnInit {
  loading = false;
  saving = false;
  togglingId: number | null = null;
  demotingId: number | null = null;

  toast = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  mentors: MentorProfile[] = [];
  searchText = '';
  
  // Promotion Search
  userSearchText = '';
  searchedUsers: any[] = [];
  searchingUsers = false;
  showPromotionModal = false;

  // Verification Checklist State
  showVerificationModal = false;
  selectedMentorForVerification: MentorProfile | null = null;
  verifyIdentity = false;
  verifyCompany = false;
  verifyLinkedin = false;
  verifyCert = false;
  verifyTerms = false;
  verifyDocumentUrl = '';

  constructor(
    private mentorService: MentorService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadAllMentors();
  }

  loadAllMentors(): void {
    this.loading = true;
    this.mentorService.getAllMentorsForAdmin().subscribe({
      next: (res) => {
        this.mentors = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showToast('Unable to load mentors list', 'error');
      }
    });
  }

  searchUsersToPromote(): void {
    if (!this.userSearchText.trim()) {
      this.searchedUsers = [];
      return;
    }
    
    this.searchingUsers = true;
    this.http.get<any>(`${environment.apiUrl}/api/users?keyword=${encodeURIComponent(this.userSearchText.trim())}&size=20`).subscribe({
      next: (res) => {
        const usersList = res?.data?.content || [];
        // Filter out users who are already mentors
        const existingMentorIds = new Set(this.mentors.map(m => m.userId));
        this.searchedUsers = usersList.filter((u: any) => !existingMentorIds.has(u.id));
        this.searchingUsers = false;
      },
      error: () => {
        this.searchingUsers = false;
        this.showToast('Failed to search users', 'error');
      }
    });
  }

  promoteUser(user: any): void {
    this.saving = true;
    this.mentorService.promoteUserToMentor(user.id).subscribe({
      next: (res) => {
        this.saving = false;
        this.showToast(`${user.name} promoted to MENTOR successfully`, 'success');
        this.closePromotionModal();
        this.loadAllMentors();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Failed to promote user', 'error');
      }
    });
  }

  demoteMentor(mentor: MentorProfile): void {
    if (!confirm(`Are you absolutely sure you want to remove mentor status from ${mentor.name}? This will delete their profile details, but preserve their user account.`)) {
      return;
    }

    this.demotingId = mentor.userId;
    this.mentorService.demoteMentor(mentor.userId).subscribe({
      next: () => {
        this.demotingId = null;
        this.showToast(`${mentor.name} removed from Mentors list`, 'success');
        this.loadAllMentors();
      },
      error: (err) => {
        this.demotingId = null;
        this.showToast('Failed to remove mentor', 'error');
      }
    });
  }

  toggleActive(mentor: MentorProfile): void {
    this.togglingId = mentor.userId;
    const newStatus = !mentor.active;
    this.mentorService.updateMentorStatus(mentor.userId, newStatus, undefined).subscribe({
      next: () => {
        mentor.active = newStatus;
        this.togglingId = null;
        this.showToast(`Active status for ${mentor.name} toggled successfully`, 'success');
      },
      error: (err) => {
        this.togglingId = null;
        this.showToast(err?.error?.message || 'Failed to toggle active status', 'error');
      }
    });
  }

  toggleFeatured(mentor: MentorProfile): void {
    this.togglingId = mentor.userId;
    const newStatus = !mentor.featured;
    this.mentorService.updateMentorStatus(mentor.userId, undefined, newStatus).subscribe({
      next: () => {
        mentor.featured = newStatus;
        this.togglingId = null;
        this.showToast(`Featured status for ${mentor.name} toggled successfully`, 'success');
      },
      error: (err) => {
        this.togglingId = null;
        this.showToast(err?.error?.message || 'Failed to toggle featured status', 'error');
      }
    });
  }

  get filteredMentors(): MentorProfile[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) return this.mentors;

    return this.mentors.filter(m => 
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.currentCompany && m.currentCompany.toLowerCase().includes(term)) ||
      (m.currentRole && m.currentRole.toLowerCase().includes(term)) ||
      (m.skills && m.skills.toLowerCase().includes(term))
    );
  }

  get stats() {
    return {
      total: this.mentors.length,
      active: this.mentors.filter(m => m.active).length,
      featured: this.mentors.filter(m => m.featured).length
    };
  }

  openPromotionModal(): void {
    this.showPromotionModal = true;
    this.userSearchText = '';
    this.searchedUsers = [];
  }

  closePromotionModal(): void {
    this.showPromotionModal = false;
  }

  getMentorChecklistScore(mentor: MentorProfile): number {
    let checkedCount = 0;
    if (mentor.identityVerified) checkedCount++;
    if (mentor.companyVerified) checkedCount++;
    if (mentor.linkedinVerified) checkedCount++;
    if (mentor.certVerified) checkedCount++;
    if (mentor.termsVerified) checkedCount++;
    return (checkedCount / 5) * 100;
  }

  getMentorChecklistPassedCount(mentor: MentorProfile): number {
    let checkedCount = 0;
    if (mentor.identityVerified) checkedCount++;
    if (mentor.companyVerified) checkedCount++;
    if (mentor.linkedinVerified) checkedCount++;
    if (mentor.certVerified) checkedCount++;
    if (mentor.termsVerified) checkedCount++;
    return checkedCount;
  }

  openVerificationModal(mentor: MentorProfile): void {
    this.selectedMentorForVerification = mentor;
    this.verifyIdentity = !!mentor.identityVerified;
    this.verifyCompany = !!mentor.companyVerified;
    this.verifyLinkedin = !!mentor.linkedinVerified;
    this.verifyCert = !!mentor.certVerified;
    this.verifyTerms = !!mentor.termsVerified;
    this.verifyDocumentUrl = mentor.verificationDocumentUrl || '';
    this.showVerificationModal = true;
  }

  closeVerificationModal(): void {
    this.showVerificationModal = false;
    this.selectedMentorForVerification = null;
  }

  get verificationScore(): number {
    let checkedCount = 0;
    if (this.verifyIdentity) checkedCount++;
    if (this.verifyCompany) checkedCount++;
    if (this.verifyLinkedin) checkedCount++;
    if (this.verifyCert) checkedCount++;
    if (this.verifyTerms) checkedCount++;
    return (checkedCount / 5) * 100;
  }

  saveVerification(): void {
    if (!this.selectedMentorForVerification) return;
    this.saving = true;
    
    const requestPayload = {
      identityVerified: this.verifyIdentity,
      companyVerified: this.verifyCompany,
      linkedinVerified: this.verifyLinkedin,
      certVerified: this.verifyCert,
      termsVerified: this.verifyTerms,
      verificationDocumentUrl: this.verifyDocumentUrl.trim()
    };

    this.mentorService.updateMentorVerification(this.selectedMentorForVerification.userId, requestPayload).subscribe({
      next: (res) => {
        this.saving = false;
        this.showToast('Verification checklist updated successfully', 'success');
        this.closeVerificationModal();
        this.loadAllMentors();
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Failed to update verification checklist', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toast = message;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
