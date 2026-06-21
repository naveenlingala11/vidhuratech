import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentMentorService } from '../service/student-mentor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student-my-mentors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-my-mentors.html',
  styleUrls: ['./student-my-mentors.css']
})
export class StudentMyMentorsComponent implements OnInit {
  loading = true;
  mentors: any[] = [];
  stats = { totalMentors: 0, activeMentors: 0, avgProgress: 0, upcomingSessions: 0 };
  
  // Tab and Booking Request states
  activeTab = 'mentors'; // 'mentors' or 'requests'
  bookingRequests: any[] = [];
  loadingRequests = false;

  constructor(
    private mentorService: StudentMentorService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.mentorService.getDashboard().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data;
          this.stats.totalMentors = d.totalMentors || 0;
          this.stats.activeMentors = d.activeMentors || 0;
          this.stats.avgProgress = d.avgProgress || 0;
          this.stats.upcomingSessions = d.upcomingSessions || 0;
          this.mentors = d.mentors || [];
          this.loadBookingRequests();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load mentors data');
      }
    });
  }

  loadBookingRequests(): void {
    this.loadingRequests = true;
    this.mentorService.getMyBookingRequests().subscribe({
      next: (res: any) => {
        // Since StudentMentorController.java returns List<Map<String, Object>> directly, we map it
        this.bookingRequests = res.data || res || [];
        this.loadingRequests = false;
      },
      error: () => {
        this.loadingRequests = false;
        this.toastr.error('Failed to load booking requests history');
      }
    });
  }

  getSkillsList(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0).slice(0, 5);
  }
}
