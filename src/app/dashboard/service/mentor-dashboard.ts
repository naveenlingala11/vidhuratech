import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MentorDashboardService {

  getDashboardData() {
    return of({
      stats: {
        mentees: 12,
        upcomingSessions: 4,
        completedSessions: 28,
        pendingFeedback: 3,
        avgProgress: 84
      },

      menteeProgress: [
        {
          name: 'Rahul',
          progress: 78
        },
        {
          name: 'Sneha',
          progress: 91
        },
        {
          name: 'Kiran',
          progress: 82
        }
      ],

      upcomingMeetings: [
        {
          mentee: 'Rahul',
          date: 'Today 4:00 PM'
        },
        {
          mentee: 'Sneha',
          date: 'Tomorrow 11:00 AM'
        }
      ],

      goals: [
        {
          title: 'Resume Improvement',
          description: 'Review updated resume for Rahul'
        },
        {
          title: 'Mock Interview',
          description: 'Conduct technical interview with Sneha'
        }
      ]
    });
  }
}