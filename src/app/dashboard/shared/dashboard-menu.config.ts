export interface DashboardMenuItem {
  label: string;
  icon: string;
  route: string;
}

export const DASHBOARD_MENUS: Record<string, DashboardMenuItem[]> = {

  STUDENT: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/student' },
    { label: 'My Courses', icon: 'bi bi-book', route: '/dashboard/student/courses' },
    { label: 'Assignments', icon: 'bi bi-file-earmark-text', route: '/dashboard/student/assignments' },
    { label: 'Certificates', icon: 'bi bi-award', route: '/dashboard/student/certificates' }
  ],

  TRAINER: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/trainer' },
    { label: 'My Batches', icon: 'bi bi-people', route: '/dashboard/trainer/batches' },
    { label: 'Students', icon: 'bi bi-person-lines-fill', route: '/dashboard/trainer/students' },
    { label: 'Content', icon: 'bi bi-journal-code', route: '/dashboard/trainer/content' }
  ],

  ADMIN: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/admin' },

    // 🔹 EXISTING (keep these)
    { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/admin/users' },
    { label: 'Actions', icon: 'bi bi-lightning-charge', route: '/dashboard/admin/actions' },
    { label: 'Courses', icon: 'bi bi-journal-bookmark', route: '/courses' },
    { label: 'Reports', icon: 'bi bi-bar-chart', route: '/dashboard/admin/reports' },

    // 🔥 NEW MODULES (your dashboard ones)
    { label: 'Leads', icon: 'bi bi-person-lines-fill', route: '/admin/leads' },
    { label: 'Bin', icon: 'bi bi-trash', route: '/admin/bin' },
    { label: 'Jobs', icon: 'bi bi-briefcase', route: '/admin/jobs' },
    { label: 'Companies', icon: 'bi bi-building', route: '/admin/companies' },
    { label: 'Certificates', icon: 'bi bi-award', route: '/admin/certificates' },
    { label: 'Interview Prep', icon: 'bi bi-lightbulb', route: '/admin/questions' },
    { label: 'Invoices', icon: 'bi bi-receipt', route: '/admin/invoice' },
    { label: 'Analytics', icon: 'bi bi-graph-up', route: '/invoice-analytics' }
  ],

  HR: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/hr' },
    { label: 'Candidates', icon: 'bi bi-person-vcard', route: '/dashboard/hr/candidates' },
    { label: 'Hiring', icon: 'bi bi-briefcase', route: '/dashboard/hr/hiring' }
  ],

  MANAGER: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/manager' },
    { label: 'Teams', icon: 'bi bi-diagram-3', route: '/dashboard/manager/teams' },
    { label: 'Reports', icon: 'bi bi-graph-up', route: '/dashboard/manager/reports' }
  ],

  MENTOR: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/mentor' },
    { label: 'Mentees', icon: 'bi bi-people', route: '/dashboard/mentor/mentees' },
    { label: 'Sessions', icon: 'bi bi-calendar-event', route: '/dashboard/mentor/sessions' }
  ],

  SUPER_ADMIN: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/super-admin' },
    { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/super-admin/users' },
    { label: 'Departments', icon: 'bi bi-diagram-2', route: '/dashboard/super-admin/departments' },
    { label: 'Settings', icon: 'bi bi-gear', route: '/dashboard/super-admin/settings' }
  ]
};