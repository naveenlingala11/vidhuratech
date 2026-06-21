import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorDashboardService } from '../../service/mentor-dashboard';
import { MentorService } from '../../../services/mentor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-availability.html',
  styleUrls: ['./mentor-availability.css']
})
export class MentorAvailabilityComponent implements OnInit {
  loading = true;
  saving = false;
  profile: any = null;

  availabilityDays = [
    { label: 'Monday', short: 'Mon', value: 'monday', active: true },
    { label: 'Tuesday', short: 'Tue', value: 'tuesday', active: true },
    { label: 'Wednesday', short: 'Wed', value: 'wednesday', active: true },
    { label: 'Thursday', short: 'Thu', value: 'thursday', active: true },
    { label: 'Friday', short: 'Fri', value: 'friday', active: true },
    { label: 'Saturday', short: 'Sat', value: 'saturday', active: false },
    { label: 'Sunday', short: 'Sun', value: 'sunday', active: false }
  ];

  availabilitySlots = [
    { label: 'Morning (9 AM - 12 PM)', value: 'morning', active: false, icon: '🌅' },
    { label: 'Afternoon (1 PM - 5 PM)', value: 'afternoon', active: false, icon: '☀️' },
    { label: 'Evening (6 PM - 9 PM)', value: 'evening', active: true, icon: '🌙' }
  ];

  allowDailySessions = false;

  constructor(
    private dashboardService: MentorDashboardService,
    private mentorService: MentorService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.profile = res.data.profile;
          this.allowDailySessions = res.data.profile?.allowDailySessions || false;

          if (res.data.profile?.availabilityDays) {
            const activeDays = res.data.profile.availabilityDays.split(',');
            this.availabilityDays.forEach(day => {
              day.active = activeDays.includes(day.value);
            });
          }
          if (res.data.profile?.availabilitySlots) {
            const activeSlots = res.data.profile.availabilitySlots.split(',');
            this.availabilitySlots.forEach(slot => {
              slot.active = activeSlots.includes(slot.value);
            });
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load availability settings');
      }
    });
  }

  toggleDay(day: any): void {
    day.active = !day.active;
  }

  toggleSlot(slot: any): void {
    slot.active = !slot.active;
  }

  getActiveDaysCount(): number {
    return this.availabilityDays.filter(d => d.active).length;
  }

  getActiveSlotsCount(): number {
    return this.availabilitySlots.filter(s => s.active).length;
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
        }
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Failed to save availability settings');
      }
    });
  }
}
