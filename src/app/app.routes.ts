import { Routes } from '@angular/router';

/* =========================
   PUBLIC PAGES
========================= */
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Curriculum } from './pages/curriculum/curriculum';
import { Placements } from './pages/placements/placements';
import { Resume } from './pages/resume/resume';
import { Jobs } from './pages/jobs/jobs';
import { JobDetail } from './pages/job-detail/job-detail';
import { JobsHome } from './pages/jobs-home/jobs-home';
import { Preparation } from './pages/preparation/preparation';
import { Company } from './pages/company/company';
import { CertificateView } from './certificate-view/certificate-view';
import { Checkout } from './pages/checkout/checkout';

/* =========================
   POLICY PAGES
========================= */
import { Terms } from './components/policy/terms/terms';
import { Privacy } from './components/policy/privacy/privacy';
import { Refund } from './components/policy/refund/refund';
import { Disclaimer } from './components/policy/disclaimer/disclaimer';
import { Cookies } from './components/policy/cookies/cookies';

/* =========================
   AUTH
========================= */
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

/* =========================
   ADMIN (OLD PAGES)
========================= */
import { Admin } from './pages/admin/admin';
import { AdminHomeComponent } from './admin/admin-home/admin-home';
import { LeadsComponent } from './admin/leads/leads';
import { BinComponent } from './admin/bin/bin';
import { JobPostAdmin } from './admin/jobs/jobs';
import { CompaniesComponent } from './admin/companies/companies';
import { CertificateComponent } from './admin/certificate/certificate';
import { Questions } from './admin/questions/questions';
import { InvoiceComponent } from './admin/invoice/invoice';
import { InvoiceAnalytics } from './admin/invoice-analytics/invoice-analytics';

/* =========================
   DASHBOARD (ROLE BASED)
========================= */
import { DashboardLayout } from './dashboard/layouts/dashboard-layout/dashboard-layout';
import { AdminDashboard } from './dashboard/admin-dashboard/admin-dashboard';
import { HrDashboard } from './dashboard/hr-dashboard/hr-dashboard';
import { ManagerDashboard } from './dashboard/manager-dashboard/manager-dashboard';
import { MentorDashboard } from './dashboard/mentor-dashboard/mentor-dashboard';
import { StudentDashboard } from './dashboard/student-pages/student-dashboard/student-dashboard';
import { SuperAdminDashboard } from './dashboard/super-admin-dashboard/super-admin-dashboard';
import { TrainerDashboard } from './dashboard/trainer-dashboard/trainer-dashboard';

/* =========================
   LMS / FEATURE MODULES
========================= */
import { CourseListComponent } from './features/lms/course/pages/course-list/course-list';
import { CourseFormComponent } from './features/lms/course/pages/course-form/course-form';
import { TrainerBatchManagementComponent } from './features/lms/batch/pages/trainer-batch-management/trainer-batch-management';
import { BatchEnrollmentComponent } from './features/lms/batch/pages/batch-enrollment/batch-enrollment';
import { AdminBatchManagementComponent } from './features/lms/batch/pages/admin-batch-management/admin-batch-management';
import { StudentBatchesComponent } from './features/lms/batch/pages/student/student-batch/student-batch';
import { StudentPlayerComponent } from './features/lms/batch/pages/student/student-player/student-player';

/* =========================
   GUARDS
========================= */
import { authGuard } from './features/auth/services/auth-guard';
import { roleGuard } from './features/auth/services/role-guard';
import { StudentAssignmentsComponent } from './dashboard/student-pages/student-assignments/student-assignments';
import { StudentCertificatesComponent } from './dashboard/student-pages/student-certificates/student-certificates';
import { StudentCoursesComponent } from './dashboard/student-pages/student-courses/student-courses';
import { TrainerBatchesComponent } from './dashboard/trainer-pages/trainer-batches/trainer-batches';
import { TrainerContentComponent } from './dashboard/trainer-pages/trainer-content/trainer-content';
import { TrainerStudentsComponent } from './dashboard/trainer-pages/trainer-students/trainer-students';
import { SetPassword } from './features/auth/set-password/set-password';
import { ProfileComponent } from './dashboard/profile/profile.component/profile.component';
import { AdminActionsComponent } from './admin/admin-actions.component/admin-actions.component';
import { AdminUsersComponent } from './admin/admin-users.component/admin-users.component';
import { AdminCreateUserComponent } from './admin/admin-create-users.component/admin-create-users.component';
import { CoursesComponent } from './pages/courses/courses';
import { CourseBulkUploadComponent } from './pages/courses/course-bulk-upload/course-bulk-upload';

/* =========================
   ROUTES CONFIG
========================= */

export const routes: Routes = [

  /* ===== PUBLIC ROUTES ===== */
  { path: '', component: Home },
  { path: 'courses', component: CoursesComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'curriculum', component: Curriculum },
  { path: 'placements', component: Placements },
  { path: 'resume', component: Resume },
  { path: 'jobs', component: Jobs },
  { path: 'jobs/:id', component: JobDetail },
  { path: 'jobs-home', component: JobsHome },
  { path: 'preparation', component: Preparation },
  { path: 'company/:name', component: Company },
  { path: 'certificate/:id', component: CertificateView },
  { path: 'checkout', component: Checkout },

  /* ===== POLICY ROUTES ===== */
  { path: 'terms', component: Terms },
  { path: 'privacy', component: Privacy },
  { path: 'refund', component: Refund },
  { path: 'disclaimer', component: Disclaimer },
  { path: 'cookies', component: Cookies },

  /* ===== AUTH ROUTES ===== */
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'set-password', component: SetPassword },

  /* ===== ADMIN (LEGACY) ===== */
  { path: 'admin', component: Admin },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: 'admin/leads', component: LeadsComponent },
  { path: 'admin/bin', component: BinComponent },
  { path: 'admin/jobs', component: JobPostAdmin },
  { path: 'admin/companies', component: CompaniesComponent },
  { path: 'admin/certificates', component: CertificateComponent },
  { path: 'admin/questions', component: Questions },
  { path: 'admin/invoice', component: InvoiceComponent },
  { path: 'invoice-analytics', component: InvoiceAnalytics },

  /* ===== DASHBOARD (PROTECTED) ===== */
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [

      /* --- ROLE DASHBOARDS --- */
      { path: 'student', component: StudentDashboard, canActivate: [roleGuard(['STUDENT'])] },
      { path: 'trainer', component: TrainerDashboard, canActivate: [roleGuard(['TRAINER'])] },
      { path: 'admin', component: AdminDashboard, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'hr', component: HrDashboard, canActivate: [roleGuard(['HR'])] },
      { path: 'manager', component: ManagerDashboard, canActivate: [roleGuard(['MANAGER'])] },
      { path: 'mentor', component: MentorDashboard, canActivate: [roleGuard(['MENTOR'])] },

      { path: 'student/profile', component: ProfileComponent },
      { path: 'trainer/profile', component: ProfileComponent },
      { path: 'admin/profile', component: ProfileComponent },
      { path: 'hr/profile', component: ProfileComponent },
      { path: 'manager/profile', component: ProfileComponent },
      { path: 'mentor/profile', component: ProfileComponent },

      /* --- SUPER ADMIN --- */
      {
        path: 'super-admin', canActivate: [roleGuard(['SUPER_ADMIN'])],
        children: [
          { path: '', component: SuperAdminDashboard },
          { path: 'users', component: SuperAdminDashboard }
        ]
      },

      { path: 'admin/actions', component: AdminActionsComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/users', component: AdminUsersComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/create-user', component: AdminCreateUserComponent },
      /* --- LMS COURSES --- */
      { path: 'lms/courses', component: CourseListComponent, canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MENTOR'])] },

      // Student
      { path: 'student/courses', component: StudentCoursesComponent, canActivate: [roleGuard(['STUDENT'])] },
      { path: 'student/assignments', component: StudentAssignmentsComponent, canActivate: [roleGuard(['STUDENT'])] },
      { path: 'student/certificates', component: StudentCertificatesComponent, canActivate: [roleGuard(['STUDENT'])] },

      // Trainer
      { path: 'trainer/batches', component: TrainerBatchesComponent, canActivate: [roleGuard(['TRAINER'])] },
      { path: 'trainer/students', component: TrainerStudentsComponent, canActivate: [roleGuard(['TRAINER'])] },
      { path: 'trainer/content', component: TrainerContentComponent, canActivate: [roleGuard(['TRAINER'])] },
    ]
  },

  /* ===== LMS EXTRA ROUTES ===== */
  { path: 'dashboard/lms/courses/create', component: CourseFormComponent },
  { path: 'dashboard/lms/courses/:id/edit', component: CourseFormComponent },
  { path: 'dashboard/admin/course-bulk', component: CourseBulkUploadComponent },

  /* ===== BATCH MANAGEMENT ===== */
  {
    path: 'dashboard/trainer/batches/:id',
    component: TrainerBatchManagementComponent,
    canActivate: [roleGuard(['TRAINER'])]
  },
  {
    path: 'dashboard/admin/batches/:id/enrollments',
    component: BatchEnrollmentComponent,
    canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])]
  },
  {
    path: 'dashboard/admin/batches',
    component: AdminBatchManagementComponent,
    canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])]
  },

  /* ===== STUDENT LMS ===== */
  {
    path: 'dashboard/student/lms',
    component: StudentBatchesComponent,
    canActivate: [roleGuard(['STUDENT'])]
  },
  {
    path: 'dashboard/student/lms/:id',
    component: StudentPlayerComponent,
    canActivate: [roleGuard(['STUDENT'])]
  },

  /* ===== FALLBACK ===== */
  { path: '**', redirectTo: '' }
];