export interface DashboardMenuItem {
  label: string;
  icon: string;
  route: string;
}

export const DASHBOARD_MENUS: Record<string, DashboardMenuItem[]> = {
  STUDENT: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/student' },
    { label: 'My Courses', icon: 'bi bi-book', route: '/dashboard/student/courses' },
    { label: 'LMS Player', icon: 'bi bi-play-circle', route: '/dashboard/student/lms' },
    {
      label: 'Assignments',
      icon: 'bi bi-file-earmark-text',
      route: '/dashboard/student/assignments',
    },
    { label: 'Assessments', icon: 'bi bi-clipboard-data', route: '/dashboard/student/assessments' },
    {
      label: 'Pseudo Challenges',
      icon: 'bi bi-code-square',
      route: '/dashboard/student/pseudo-challenges',
    },
    {
      label: 'Practice',
      icon: 'bi bi-lightning-charge',
      route: '/dashboard/student/learning-content?type=PRACTICE',
    },
    {
      label: 'Materials',
      icon: 'bi bi-folder2-open',
      route: '/dashboard/student/learning-content?type=MATERIAL',
    },
    {
      label: 'Notes',
      icon: 'bi bi-journal-text',
      route: '/dashboard/student/learning-content?type=NOTE',
    },
    {
      label: 'Mock Interviews',
      icon: 'bi bi-camera-video',
      route: '/dashboard/student/mock-interviews',
    },
    { label: 'Certificates', icon: 'bi bi-award', route: '/dashboard/student/certificates' },
    { label: 'Resume Builder', icon: 'bi bi-file-earmark-person', route: '/resume' },
    { label: 'Coding Practice', icon: 'bi bi-lightbulb', route: '/preparation' },
    { label: 'Placements', icon: 'bi bi-briefcase', route: '/placements' },
  ],

  TRAINER: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/trainer' },
    { label: 'My Batches', icon: 'bi bi-people', route: '/dashboard/trainer/batches' },
    { label: 'Students', icon: 'bi bi-person-lines-fill', route: '/dashboard/trainer/students' },
    {
      label: 'Create Assessment',
      icon: 'bi bi-plus-circle',
      route: '/dashboard/trainer/create-assessment',
    },
    { label: 'Assessments', icon: 'bi bi-clipboard-data', route: '/dashboard/trainer/assessments' },
    {
      label: 'Pseudo Challenges',
      icon: 'bi bi-code-square',
      route: '/dashboard/trainer/pseudo-challenges',
    },
    {
      label: 'Mock Interviews',
      icon: 'bi bi-camera-video',
      route: '/dashboard/trainer/mock-interviews',
    },
    { label: 'Content', icon: 'bi bi-folder2-open', route: '/dashboard/trainer/content' },
  ],

  ADMIN: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/admin' },
    { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/admin/users' },
    { label: 'Actions', icon: 'bi bi-lightning-charge', route: '/dashboard/admin/actions' },
    { label: 'Courses', icon: 'bi bi-journal-bookmark', route: '/courses' },
    { label: 'Reports', icon: 'bi bi-bar-chart', route: '/dashboard/admin/reports' },
    { label: 'Leads', icon: 'bi bi-person-lines-fill', route: '/admin/leads' },
    { label: 'Bin', icon: 'bi bi-trash', route: '/admin/bin' },
    { label: 'Jobs', icon: 'bi bi-briefcase', route: '/admin/jobs' },
    { label: 'Companies', icon: 'bi bi-building', route: '/admin/companies' },
    { label: 'Certificates', icon: 'bi bi-award', route: '/admin/certificates' },
    { label: 'Interview Prep', icon: 'bi bi-lightbulb', route: '/admin/questions' },
    { label: 'Invoices', icon: 'bi bi-receipt', route: '/admin/invoice' },
    { label: 'Analytics', icon: 'bi bi-graph-up', route: '/invoice-analytics' },
  ],

  HR: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/hr' },
    { label: 'Candidates', icon: 'bi bi-person-vcard', route: '/dashboard/hr/candidates' },
    { label: 'Hiring', icon: 'bi bi-briefcase', route: '/dashboard/hr/hiring' },
  ],

  MANAGER: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/manager' },
    { label: 'Teams', icon: 'bi bi-diagram-3', route: '/dashboard/manager/teams' },
    { label: 'Reports', icon: 'bi bi-graph-up', route: '/dashboard/manager/reports' },
  ],

  MENTOR: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/mentor' },
    { label: 'Mentees', icon: 'bi bi-people', route: '/dashboard/mentor/mentees' },
    { label: 'Sessions', icon: 'bi bi-calendar-event', route: '/dashboard/mentor/sessions' },
  ],

  SUPER_ADMIN: [
    { label: 'Dashboard', icon: 'bi bi-grid', route: '/dashboard/super-admin' },
    { label: 'Users', icon: 'bi bi-people-fill', route: '/dashboard/super-admin/users' },
    { label: 'Admin Actions', icon: 'bi bi-lightning-charge', route: '/dashboard/admin/actions' },
    { label: 'Leads', icon: 'bi bi-person-lines-fill', route: '/admin/leads' },
    { label: 'Bin', icon: 'bi bi-trash', route: '/admin/bin' },
    { label: 'Jobs', icon: 'bi bi-briefcase', route: '/admin/jobs' },
    { label: 'Companies', icon: 'bi bi-building', route: '/admin/companies' },
    { label: 'Certificates', icon: 'bi bi-award', route: '/admin/certificates' },
    { label: 'Invoices', icon: 'bi bi-receipt', route: '/admin/invoice' },
    { label: 'Analytics', icon: 'bi bi-graph-up', route: '/invoice-analytics' },
    { label: 'Settings', icon: 'bi bi-gear', route: '/dashboard/super-admin/settings' },
  ],
};
