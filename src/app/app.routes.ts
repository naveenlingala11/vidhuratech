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
import { CoursesComponent } from './pages/courses/courses';

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
import { SetPassword } from './features/auth/set-password/set-password';

/* =========================
   ADMIN LEGACY
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
   DASHBOARD
========================= */
import { DashboardLayout } from './dashboard/layouts/dashboard-layout/dashboard-layout';
import { HrDashboard } from './dashboard/hr-dashboard/hr-dashboard';
import { ManagerDashboard } from './dashboard/manager-dashboard/manager-dashboard';
import { MentorDashboard } from './dashboard/mentor-dashboard/mentor-dashboard';
import { StudentDashboard } from './dashboard/student-pages/student-dashboard/student-dashboard';
import { SuperAdminDashboard } from './dashboard/super-admin-dashboard/super-admin-dashboard';
import { TrainerDashboard } from './dashboard/trainer-dashboard/trainer-dashboard';
import { AdminDashboard } from './dashboard/admin/admin-dashboard/admin-dashboard';
import { ProfileComponent } from './dashboard/profile/profile.component/profile.component';

/* =========================
   STUDENT DASHBOARD PAGES
========================= */
import { StudentAssignmentsComponent } from './dashboard/student-pages/student-assignments/student-assignments';
import { StudentCertificatesComponent } from './dashboard/student-pages/student-certificates/student-certificates';
import { StudentCoursesComponent } from './dashboard/student-pages/student-courses/student-courses';
import { StudentLearningContentComponent } from './dashboard/student-pages/student-learning-content/student-learning-content';
import { StudentMockInterviewsComponent } from './dashboard/student-pages/student-mock-interviews/student-mock-interviews';
/* =========================
   TRAINER DASHBOARD PAGES
========================= */
import { TrainerBatchesComponent } from './dashboard/trainer-pages/trainer-batches/trainer-batches';
import { TrainerContentComponent } from './dashboard/trainer-pages/trainer-content/trainer-content';
import { TrainerStudentsComponent } from './dashboard/trainer-pages/trainer-students/trainer-students';
import { TrainerMockInterviewsComponent } from './dashboard/trainer-pages/trainer-mock-interviews/trainer-mock-interviews';

/* =========================
   LMS
========================= */
import { CourseListComponent } from './features/lms/course/pages/course-list/course-list';
import { CourseFormComponent } from './features/lms/course/pages/course-form/course-form';
import { TrainerBatchManagementComponent } from './features/lms/batch/pages/trainer-batch-management/trainer-batch-management';
import { BatchEnrollmentComponent } from './features/lms/batch/pages/batch-enrollment/batch-enrollment';
import { AdminBatchManagementComponent } from './features/lms/batch/pages/admin-batch-management/admin-batch-management';
import { StudentBatchesComponent } from './features/lms/batch/pages/student/student-batch/student-batch';
import { StudentPlayerComponent } from './features/lms/batch/pages/student/student-player/student-player';

/* =========================
   ADMIN DASHBOARD PAGES
========================= */
import { AdminActionsComponent } from './admin/admin-actions.component/admin-actions.component';
import { AdminUsersComponent } from './admin/admin-users.component/admin-users.component';
import { AdminCreateUserComponent } from './admin/admin-create-users.component/admin-create-users.component';
import { CourseBulkUploadComponent } from './pages/courses/course-bulk-upload/course-bulk-upload';
import { BatchCommunicationComponent } from './admin/batches/batch-communication/batch-communication';
import { AdminAdmissionsComponent } from './dashboard/admin/admin-admissions/admin-admissions';

/* =========================
   ASSESSMENTS
========================= */
import { CreateAssessmentComponent } from './features/trainer/create-assessment/create-assessment';
import { TrainerAssessmentsComponent } from './features/trainer/trainer-assessments/trainer-assessments';
import { AssessmentListComponent } from './features/student/assessment-list/assessment-list';
import { AssessmentAttemptComponent } from './features/student/assessment-attempt/assessment-attempt';

/* =========================
   GUARDS
========================= */
import { authGuard } from './features/auth/services/auth-guard';
import { roleGuard } from './features/auth/services/role-guard';

export const routes: Routes = [
  /* =========================
     PUBLIC ROUTES
  ========================= */
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

  /* =========================
     POLICY ROUTES
  ========================= */
  { path: 'terms', component: Terms },
  { path: 'privacy', component: Privacy },
  { path: 'refund', component: Refund },
  { path: 'disclaimer', component: Disclaimer },
  { path: 'cookies', component: Cookies },

  /* =========================
     AUTH ROUTES
  ========================= */
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'set-password', component: SetPassword },

  /* =========================
     ADMIN LEGACY ROUTES
  ========================= */
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

  /* =========================
     DASHBOARD ROUTES
  ========================= */
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      /* --- ROLE HOME DASHBOARDS --- */
      {
        path: 'student',
        component: StudentDashboard,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'trainer',
        component: TrainerDashboard,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'hr',
        component: HrDashboard,
        canActivate: [roleGuard(['HR'])],
      },
      {
        path: 'manager',
        component: ManagerDashboard,
        canActivate: [roleGuard(['MANAGER'])],
      },
      {
        path: 'mentor',
        component: MentorDashboard,
        canActivate: [roleGuard(['MENTOR'])],
      },

      /* --- PROFILES --- */
      {
        path: 'student/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'trainer/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'admin/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'hr/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['HR'])],
      },
      {
        path: 'manager/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['MANAGER'])],
      },
      {
        path: 'mentor/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },

      /* --- SUPER ADMIN --- */
      {
        path: 'super-admin',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        children: [
          { path: '', component: SuperAdminDashboard },
          { path: 'users', component: SuperAdminDashboard },
        ],
      },

      /* --- ADMIN DASHBOARD PAGES --- */
      {
        path: 'admin/actions',
        component: AdminActionsComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'admin/users',
        component: AdminUsersComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'admin/create-user',
        component: AdminCreateUserComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'admin/batch-communication',
        component: BatchCommunicationComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/course-bulk',
        component: CourseBulkUploadComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/admissions',
        component: AdminAdmissionsComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/batches',
        component: AdminBatchManagementComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])],
      },
      {
        path: 'admin/batches/:id/enrollments',
        component: BatchEnrollmentComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])],
      },

      /* --- LMS COURSES --- */
      {
        path: 'lms/courses',
        component: CourseListComponent,
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MENTOR'])],
      },
      {
        path: 'lms/courses/create',
        component: CourseFormComponent,
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
      },
      {
        path: 'lms/courses/:id/edit',
        component: CourseFormComponent,
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
      },

      /* --- STUDENT PAGES --- */
      {
        path: 'student/courses',
        component: StudentCoursesComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/assignments',
        component: StudentAssignmentsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/certificates',
        component: StudentCertificatesComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/learning-content',
        component: StudentLearningContentComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/assessments',
        component: AssessmentListComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/assessment-attempt/:id',
        component: AssessmentAttemptComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/lms',
        component: StudentBatchesComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/lms/:id',
        component: StudentPlayerComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/mock-interviews',
        component: StudentMockInterviewsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },

      /* --- TRAINER PAGES --- */
      {
        path: 'trainer/batches',
        component: TrainerBatchesComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/batches/:id',
        component: TrainerBatchManagementComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/students',
        component: TrainerStudentsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/content',
        component: TrainerContentComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/mock-interviews',
        component: TrainerMockInterviewsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/assessments',
        component: TrainerAssessmentsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
    ],
  },

  /* =========================
     BACKWARD COMPATIBILITY ROUTES
     Keep these because existing routerLinks may use full dashboard paths.
  ========================= */
  {
    path: 'dashboard/trainer/create-assessment',
    component: CreateAssessmentComponent,
    canActivate: [authGuard, roleGuard(['TRAINER'])],
  },
  {
    path: 'dashboard/lms/courses/create',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
  },
  {
    path: 'dashboard/lms/courses/:id/edit',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
  },
  {
    path: 'dashboard/admin/course-bulk',
    component: CourseBulkUploadComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
  },
  {
    path: 'dashboard/trainer/batches/:id',
    component: TrainerBatchManagementComponent,
    canActivate: [authGuard, roleGuard(['TRAINER'])],
  },
  {
    path: 'dashboard/admin/batches/:id/enrollments',
    component: BatchEnrollmentComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])],
  },
  {
    path: 'dashboard/admin/batches',
    component: AdminBatchManagementComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN', 'HR'])],
  },
  {
    path: 'dashboard/student/lms',
    component: StudentBatchesComponent,
    canActivate: [authGuard, roleGuard(['STUDENT'])],
  },
  {
    path: 'dashboard/student/lms/:id',
    component: StudentPlayerComponent,
    canActivate: [authGuard, roleGuard(['STUDENT'])],
  },
  {
    path: 'dashboard/admin/admissions',
    component: AdminAdmissionsComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
  },

  /* =========================
     FALLBACK
  ========================= */
  { path: '**', redirectTo: '' },
];
