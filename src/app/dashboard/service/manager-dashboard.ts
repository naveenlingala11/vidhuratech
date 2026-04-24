import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerDashboardService {

  getDashboardData() {
    return of({
      stats: {
        teamMembers: 34,
        activeProjects: 8,
        pendingApprovals: 5,
        escalations: 2,
        avgPerformance: 89,
        attendanceRate: 94
      },

      departments: [
        {
          name: 'Engineering',
          members: 18
        },
        {
          name: 'Operations',
          members: 10
        },
        {
          name: 'QA',
          members: 6
        }
      ],

      teamPerformance: [
        {
          employee: 'Rahul',
          score: 94
        },
        {
          employee: 'Sneha',
          score: 88
        },
        {
          employee: 'Kiran',
          score: 91
        }
      ],

      recentActivities: [
        {
          title: 'Leave Approval Pending',
          description: '3 leave requests require approval'
        },
        {
          title: 'Project Deadline',
          description: 'ERP Module Phase-2 due tomorrow'
        }
      ]
    });
  }
}