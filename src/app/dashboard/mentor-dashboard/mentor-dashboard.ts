import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorDashboardService } from '../service/mentor-dashboard';
import { MentorService } from '../../services/mentor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mentor-dashboard.html',
  styleUrls: ['./mentor-dashboard.css']
})
export class MentorDashboard implements OnInit {
  loading = true;
  saving = false;
  
  // Dashboard data from API
  profile: any = null;
  stats = {
    menteesCount: 0,
    upcomingSessionsCount: 0,
    completedSessionsCount: 0,
    pendingFeedbackCount: 0,
    avgProgress: 0,
    totalEarnings: 0
  };
  
  mentees: any[] = [];
  meetings: any[] = [];
  goals: any[] = [];

  // Booking Requests state
  bookingRequests: any[] = [];
  showBookingActionModal = false;
  bookingActionType = 'accept'; // 'accept' or 'reject'
  selectedBookingRequest: any = null;
  bookingActionNote = '';
  submittingBookingAction = false;
  requestsTab = 'pending'; // 'pending' or 'history'

  get pendingRequests(): any[] {
    return this.bookingRequests.filter(r => r.status === 'PENDING');
  }

  get historyRequests(): any[] {
    return this.bookingRequests.filter(r => r.status !== 'PENDING');
  }

  // Availability state
  availabilityDays = [
    { label: 'Mon', value: 'monday', active: true },
    { label: 'Tue', value: 'tuesday', active: true },
    { label: 'Wed', value: 'wednesday', active: true },
    { label: 'Thu', value: 'thursday', active: true },
    { label: 'Fri', value: 'friday', active: true },
    { label: 'Sat', value: 'saturday', active: false },
    { label: 'Sun', value: 'sunday', active: false }
  ];
  
  availabilitySlots = [
    { label: 'Morning (9 AM - 12 PM)', value: 'morning', active: false },
    { label: 'Afternoon (1 PM - 5 PM)', value: 'afternoon', active: false },
    { label: 'Evening (6 PM - 9 PM)', value: 'evening', active: true }
  ];

  // Pricing controls
  tempPricing = 0;
  tempPricingWeek = 0;
  tempPricingMonth = 0;
  allowDailySessions = false;

  // Modals state
  showScheduleModal = false;
  showFeedbackModal = false;

  // Form inputs for modals
  scheduleForm = {
    mentee: '',
    date: '',
    time: '',
    type: 'Mock Interview',
    link: 'https://zoom.us/j/999888777'
  };

  feedbackForm = {
    mentee: '',
    note: '',
    progressValue: 70,
    milestone: ''
  };

  constructor(
    private dashboardService: MentorDashboardService,
    private mentorService: MentorService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data;
          this.profile = d.profile;
          this.tempPricing = d.profile.pricePerHour || 0;
          this.tempPricingWeek = d.profile.pricePerWeek || 0;
          this.tempPricingMonth = d.profile.pricePerMonth || 0;
          this.allowDailySessions = d.profile.allowDailySessions || false;
          this.stats = {
            menteesCount: d.menteesCount,
            upcomingSessionsCount: d.upcomingSessionsCount,
            completedSessionsCount: d.completedSessionsCount,
            pendingFeedbackCount: d.pendingFeedbackCount,
            avgProgress: d.avgProgress,
            totalEarnings: d.totalEarnings
          };
          this.mentees = d.menteeProgressList || [];
          this.meetings = d.upcomingMeetingsList || [];
          this.goals = d.goalsList || [];

          if (d.profile.availabilityDays) {
            const activeDays = d.profile.availabilityDays.split(',');
            this.availabilityDays.forEach(day => {
              day.active = activeDays.includes(day.value);
            });
          }
          if (d.profile.availabilitySlots) {
            const activeSlots = d.profile.availabilitySlots.split(',');
            this.availabilitySlots.forEach(slot => {
              slot.active = activeSlots.includes(slot.value);
            });
          }
          this.loadBookingRequests();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load mentor dashboard metrics');
      }
    });
  }

  loadBookingRequests(): void {
    this.dashboardService.getBookingRequests().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.bookingRequests = res.data.requests || [];
        }
      },
      error: () => {
        this.toastr.error('Failed to load incoming booking requests');
      }
    });
  }

  openBookingActionModal(request: any, type: string): void {
    this.selectedBookingRequest = request;
    this.bookingActionType = type;
    this.bookingActionNote = '';
    this.showBookingActionModal = true;
  }

  closeBookingActionModal(): void {
    this.showBookingActionModal = false;
    this.selectedBookingRequest = null;
  }

  submitBookingAction(): void {
    if (!this.selectedBookingRequest) return;
    if (!this.bookingActionNote.trim() || this.bookingActionNote.trim().length < 10) {
      this.toastr.warning('Please write a constructive note of at least 10 characters.');
      return;
    }
    this.submittingBookingAction = true;

    const reqId = this.selectedBookingRequest.id;
    const note = this.bookingActionNote.trim();

    const obs = this.bookingActionType === 'accept'
      ? this.dashboardService.acceptBookingRequest(reqId, note)
      : this.dashboardService.rejectBookingRequest(reqId, note);

    obs.subscribe({
      next: (res: any) => {
        this.submittingBookingAction = false;
        this.toastr.success(res.message || 'Action completed successfully!');
        this.closeBookingActionModal();
        this.loadDashboardData();
      },
      error: (err: any) => {
        this.submittingBookingAction = false;
        const msg = err.error?.message || 'Failed to process booking request action';
        this.toastr.error(msg);
      }
    });
  }

  updatePricing(): void {
    if (this.tempPricing < 0 || this.tempPricingWeek < 0 || this.tempPricingMonth < 0) {
      this.toastr.warning('Rates cannot be negative');
      return;
    }
    this.saving = true;
    
    const updateData = {
      currentCompany: this.profile.currentCompany,
      currentRole: this.profile.currentRole,
      yearsOfExperience: this.profile.yearsOfExperience,
      biography: this.profile.biography,
      skills: this.profile.skills,
      languages: this.profile.languages,
      linkedinUrl: this.profile.linkedinUrl,
      githubUrl: this.profile.githubUrl,
      pricePerHour: this.tempPricing,
      pricePerWeek: this.tempPricingWeek,
      pricePerMonth: this.tempPricingMonth,
      availabilityDays: this.availabilityDays.filter(d => d.active).map(d => d.value).join(','),
      availabilitySlots: this.availabilitySlots.filter(s => s.active).map(s => s.value).join(','),
      allowDailySessions: this.allowDailySessions
    };

    this.mentorService.updateMentorProfile(updateData).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.profile = res.data;
          this.toastr.success('Pricing plans updated successfully!');
          this.loadDashboardData();
        }
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Failed to update pricing plans');
      }
    });
  }

  toggleDay(day: any): void {
    day.active = !day.active;
  }

  toggleSlot(slot: any): void {
    slot.active = !slot.active;
  }

  saveAvailability(): void {
    this.saving = true;
    const activeDays = this.availabilityDays.filter(d => d.active).map(d => d.value).join(',');
    const activeSlots = this.availabilitySlots.filter(s => s.active).map(s => s.value).join(',');
    
    const body = {
      days: activeDays,
      slots: activeSlots,
      allowDaily: this.allowDailySessions
    };

    this.dashboardService.saveAvailability(body).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.toastr.success('Availability settings saved successfully!');
          this.loadDashboardData();
        }
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Failed to save availability settings');
      }
    });
  }

  openScheduleModal(): void {
    this.scheduleForm = {
      mentee: this.mentees.length > 0 ? this.mentees[0].name : '',
      date: '',
      time: '',
      type: 'Mock Interview',
      link: 'https://zoom.us/j/' + Math.floor(100000000 + Math.random() * 900000000)
    };
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  submitSchedule(): void {
    if (!this.scheduleForm.mentee || !this.scheduleForm.date || !this.scheduleForm.time) {
      this.toastr.warning('Please fill in all scheduling fields');
      return;
    }
    
    const body = {
      studentName: this.scheduleForm.mentee,
      date: this.scheduleForm.date,
      time: this.scheduleForm.time,
      type: this.scheduleForm.type,
      link: this.scheduleForm.link
    };

    this.dashboardService.scheduleSession(body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Session scheduled successfully for ${this.scheduleForm.mentee}!`);
          this.closeScheduleModal();
          this.loadDashboardData();
        }
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to schedule session');
      }
    });
  }

  openFeedbackModal(menteeName?: string): void {
    this.feedbackForm = {
      mentee: menteeName || (this.mentees.length > 0 ? this.mentees[0].name : ''),
      note: '',
      progressValue: 75,
      milestone: ''
    };
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
  }

  submitFeedback(): void {
    if (!this.feedbackForm.mentee || !this.feedbackForm.note.trim()) {
      this.toastr.warning('Please provide a feedback description');
      return;
    }

    const body = {
      studentName: this.feedbackForm.mentee,
      progress: this.feedbackForm.progressValue,
      milestone: this.feedbackForm.milestone,
      note: this.feedbackForm.note
    };

    this.dashboardService.submitFeedback(body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Feedback saved for ${this.feedbackForm.mentee}!`);
          this.closeFeedbackModal();
          this.loadDashboardData();
        }
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to save review');
      }
    });
  }

  getVerificationChecklistScore(): number {
    if (!this.profile) return 0;
    let checkedCount = 0;
    if (this.profile.identityVerified) checkedCount++;
    if (this.profile.companyVerified) checkedCount++;
    if (this.profile.linkedinVerified) checkedCount++;
    if (this.profile.certVerified) checkedCount++;
    if (this.profile.termsVerified) checkedCount++;
    return (checkedCount / 5) * 100;
  }
}
