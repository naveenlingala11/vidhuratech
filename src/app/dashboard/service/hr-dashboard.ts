import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrDashboardService {

  getDashboardData() {
    return of({
      stats: {
        totalCandidates: 182,
        interviewsToday: 12,
        offersReleased: 18,
        pendingReviews: 9,
        hiredThisMonth: 24,
        rejected: 43
      },

      pipeline: [
        { stage: 'Applied', count: 84 },
        { stage: 'Screening', count: 41 },
        { stage: 'Interview', count: 28 },
        { stage: 'Offer', count: 18 },
        { stage: 'Joined', count: 11 }
      ],

      interviews: [
        {
          candidate: 'Rahul Kumar',
          role: 'Java Developer',
          time: 'Today 11:00 AM'
        },
        {
          candidate: 'Sneha Reddy',
          role: 'Frontend Developer',
          time: 'Today 2:00 PM'
        }
      ],

      activities: [
        {
          title: 'Candidate Shortlisted',
          description: 'Ankit shortlisted for React role'
        },
        {
          title: 'Offer Released',
          description: 'Offer sent to Priya Sharma'
        }
      ]
    });
  }
}