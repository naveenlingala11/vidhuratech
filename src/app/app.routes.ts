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
import { ResumeLanding } from './pages/resume-landing/resume-landing';
import { ResumeScanner } from './pages/resume-scanner/resume-scanner';
import { ResumeCustomizer } from './pages/resume-customizer/resume-customizer';
import { Jobs } from './pages/jobs/jobs';
import { JobDetail } from './pages/job-detail/job-detail';
import { JobsHome } from './pages/jobs-home/jobs-home';
import { Preparation } from './pages/preparation/preparation';
import { Company } from './pages/company/company';
import { CertificateView } from './certificate-view/certificate-view';
import { Checkout } from './pages/checkout/checkout';
import { CheckoutHelp } from './pages/checkout-help/checkout-help';
import { CoursesComponent } from './pages/courses/courses';
import { ExploreTracksComponent } from './pages/explore-tracks/explore-tracks';
import { Projects } from './pages/projects/projects';
import { PublicPracticeComponent } from './features/public/public-practice/public-practice/public-practice';
import { NotificationsComponent } from './components/notifications/notifications';

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
import { InvoiceComponent } from './admin/invoice/invoice';
import { InvoiceAnalytics } from './admin/invoice-analytics/invoice-analytics';
import { ManageTrainersComponent } from './admin/manage-trainers/manage-trainers';
import { ManageMentorsComponent } from './admin/manage-mentors/manage-mentors';

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
import { CourseManagerComponent } from './features/lms/course/course-manager/course-manager';
import { TrainerBatchManagementComponent } from './features/lms/batch/pages/trainer-batch-management/trainer-batch-management';
import { BatchEnrollmentComponent } from './features/lms/batch/pages/batch-enrollment/batch-enrollment';
import { AdminBatchManagementComponent } from './features/lms/batch/pages/admin-batch-management/admin-batch-management';
import { StudentBatchesComponent } from './features/lms/batch/pages/student/student-batch/student-batch';
import { StudentPlayerComponent } from './features/lms/batch/pages/student/student-player/student-player';
import { TrainerAssignedCoursesComponent } from './dashboard/trainer-pages/trainer-assigned-courses/trainer-assigned-courses';

/* =========================
   ADMIN DASHBOARD PAGES
========================= */
import { AdminActionsComponent } from './admin/admin-actions.component/admin-actions.component';
import { AdminUsersComponent } from './admin/admin-users.component/admin-users.component';
import { AdminCreateUserComponent } from './admin/admin-create-users.component/admin-create-users.component';
import { AdminUserGuideComponent } from './admin/user-guide/user-guide';
import { CourseBulkUploadComponent } from './pages/courses/course-bulk-upload/course-bulk-upload';
import { BatchCommunicationComponent } from './admin/batches/batch-communication/batch-communication';
import { AdminAdmissionsComponent } from './dashboard/admin/admin-admissions/admin-admissions';
import { AdminPublicPracticePublishingComponent } from './admin/public-practice-publishing/public-practice-publishing';

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

/* =========================
   PSEUDO CHALLENGES
========================= */
import { StudentPseudoChallengesComponent } from './features/student/student-pseudo-challenges/student-pseudo-challenges';
import { TrainerPseudoChallengesComponent } from './features/trainer/trainer-pseudo-challenges/trainer-pseudo-challenges';
import { AssessmentResults } from './features/trainer/assessment-results/assessment-results';
import { StudentPseudoChallengeLabComponent } from './features/student/student-pseudo-challenge-lab/student-pseudo-challenge-lab';
import { CourseDetailsComponent } from './pages/courses/course-details/course-details';
import { SettingsComponent } from './dashboard/profile/settings/settings';
import { TrainerPseudoSubmissionsComponent } from './features/trainer/trainer-pseudo-submissions/trainer-pseudo-submissions';
import { StudentInterviewQuestionsComponent } from './features/student/student-interview-questions/student-interview-questions/student-interview-questions';
import { TrainerInterviewQuestionsComponent } from './features/trainer/trainer-interview-questions/trainer-interview-questions/trainer-interview-questions';
import { CodingContestsComponent } from './features/public/coding-contests/coding-contests/coding-contests';
import { PricingPlansComponent } from './pages/pricing-plans/pricing-plans';
import { AdminPlanAccessComponent } from './admin/plan-access/plan-access/plan-access';
import { PremiumLeaderboardComponent } from './shared/components/premium-leaderboard/premium-leaderboard/premium-leaderboard';
import { Mentors } from './pages/mentors/mentors';
import { MentorDetail } from './pages/mentors/mentor-detail/mentor-detail';
import { MentorProfileEdit } from './dashboard/mentor-dashboard/mentor-profile-edit/mentor-profile-edit';
import { MentorRegisterComponent } from './pages/mentors/mentor-register/mentor-register';
import { MentorMenteesComponent } from './dashboard/mentor-dashboard/mentor-mentees/mentor-mentees';
import { MentorSessionsComponent } from './dashboard/mentor-dashboard/mentor-sessions/mentor-sessions';
import { MentorEarningsComponent } from './dashboard/mentor-dashboard/mentor-earnings/mentor-earnings';
import { MentorAvailabilityComponent } from './dashboard/mentor-dashboard/mentor-availability/mentor-availability';
import { StudentMyMentorsComponent } from './dashboard/student-pages/student-my-mentors/student-my-mentors';
import { StudentMentorSessionsComponent } from './dashboard/student-pages/student-mentor-sessions/student-mentor-sessions';
import { StudentMentorProgressComponent } from './dashboard/student-pages/student-mentor-progress/student-mentor-progress';
import { MentorChatComponent } from './dashboard/shared/mentor-chat/mentor-chat';
import { MentorQaListComponent } from './pages/mentors/mentor-qa-list/mentor-qa-list';
import { MentorQaDetailComponent } from './pages/mentors/mentor-qa-detail/mentor-qa-detail';

export const routes: Routes = [
  /* =========================
     PUBLIC ROUTES
  ========================= */
  { path: '', component: Home },
  { path: 'courses', component: CoursesComponent },
  { path: 'explore-tracks', component: ExploreTracksComponent },
  { path: 'projects', component: Projects },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'curriculum', component: Curriculum },
  { path: 'placements', component: Placements },
  { path: 'resume', component: ResumeLanding },
  { path: 'resume-workspace', component: Resume },
  { path: 'resume-scanner', component: ResumeScanner },
  { path: 'resume-customizer', component: ResumeCustomizer },
  { path: 'resume-guide', component: Resume },
  { path: 'jobs', component: Jobs },
  { path: 'jobs/:id', component: JobDetail },
  { path: 'jobs-home', component: JobsHome },
  { path: 'preparation', component: Preparation },
  { path: 'company/:name', component: Company },
  { path: 'certificate/:id', component: CertificateView },
  { path: 'checkout', component: Checkout },
  { path: 'checkout-help', component: CheckoutHelp },

  { path: 'courses/:slug', component: CourseDetailsComponent },
  { path: 'practice', component: PublicPracticeComponent },
  { path: 'practice/:type/:id', component: PublicPracticeComponent },
  { path: 'leaderboard', component: PremiumLeaderboardComponent },
  { path: 'mentors', component: Mentors },
  { path: 'mentors/register', component: MentorRegisterComponent },
  { path: 'mentors/:id', component: MentorDetail },
  { path: 'profile/:id', component: MentorDetail },
  { path: 'ping-room', component: MentorQaListComponent },
  { path: 'ping-room/:id', component: MentorQaDetailComponent },
  { path: 'qa', redirectTo: 'ping-room', pathMatch: 'full' },
  { path: 'qa/:id', redirectTo: 'ping-room/:id', pathMatch: 'full' },
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
  { path: 'admin/leads', redirectTo: 'dashboard/admin/leads', pathMatch: 'full' },
  { path: 'admin/bin', component: BinComponent },
  { path: 'admin/jobs', redirectTo: 'dashboard/admin/jobs', pathMatch: 'full' },
  { path: 'admin/companies', redirectTo: 'dashboard/admin/companies', pathMatch: 'full' },
  { path: 'admin/certificates', redirectTo: 'dashboard/admin/certificates', pathMatch: 'full' },
  { path: 'admin/invoice', redirectTo: 'dashboard/admin/invoice', pathMatch: 'full' },
  { path: 'invoice-analytics', redirectTo: 'dashboard/admin/invoice-analytics', pathMatch: 'full' },
  { path: 'admin/invoice-analytics', redirectTo: 'dashboard/admin/invoice-analytics', pathMatch: 'full' },
  { path: 'coding-contests', component: CodingContestsComponent },
  { path: 'pricing-plans', component: PricingPlansComponent },
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
        path: 'student/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'trainer/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'admin/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'admin/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'hr/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['HR'])],
      },
      {
        path: 'hr/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['HR'])],
      },
      {
        path: 'manager/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['MANAGER'])],
      },
      {
        path: 'manager/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['MANAGER'])],
      },
      {
        path: 'mentor/profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/notifications',
        component: NotificationsComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/edit-profile',
        component: MentorProfileEdit,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/mentees',
        component: MentorMenteesComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/sessions',
        component: MentorSessionsComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/earnings',
        component: MentorEarningsComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/availability',
        component: MentorAvailabilityComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },
      {
        path: 'mentor/chat/:relationId',
        component: MentorChatComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },

      /* --- SETTINGS PAGES FOR ALL ROLES --- */

      {
        path: 'student/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'trainer/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'admin/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'hr/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['HR'])],
      },
      {
        path: 'manager/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['MANAGER'])],
      },
      {
        path: 'mentor/settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['MENTOR'])],
      },

      /* --- SUPER ADMIN --- */
      {
        path: 'super-admin',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        children: [
          { path: '', component: SuperAdminDashboard },
          { path: 'users', component: SuperAdminDashboard },
          { path: 'profile', component: ProfileComponent },
          { path: 'notifications', component: NotificationsComponent },
          { path: 'settings', component: SettingsComponent },
        ],
      },

      /* --- ADMIN DASHBOARD PAGES --- */
      {
        path: 'admin/actions',
        component: AdminActionsComponent,
        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'admin/leads',
        component: LeadsComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/certificates',
        component: CertificateComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/invoice-analytics',
        component: InvoiceAnalytics,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/invoice',
        component: InvoiceComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
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
        path: 'admin/jobs',
        component: JobPostAdmin,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/companies',
        component: CompaniesComponent,
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
      {
        path: 'admin/public-practice',
        component: AdminPublicPracticePublishingComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/manage-trainers',
        component: ManageTrainersComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/manage-mentors',
        component: ManageMentorsComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/plan-access',
        component: AdminPlanAccessComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },
      {
        path: 'admin/user-guide',
        component: AdminUserGuideComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
      },

      /* --- LMS COURSES --- */
      {
        path: 'lms/courses',
        component: CourseListComponent,
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MENTOR'])],
      },
      {
        path: 'lms/courses-manager',
        component: CourseManagerComponent,
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
      {
        path: 'student/pseudo-challenges',
        component: StudentPseudoChallengesComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/pseudocode-lab/:id',
        component: StudentPseudoChallengeLabComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/interview-questions',
        component: StudentInterviewQuestionsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/my-mentors',
        component: StudentMyMentorsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/mentor-sessions',
        component: StudentMentorSessionsComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/mentor-progress',
        component: StudentMentorProgressComponent,
        canActivate: [roleGuard(['STUDENT'])],
      },
      {
        path: 'student/chat/:relationId',
        component: MentorChatComponent,
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
        path: 'trainer/pseudo-challenges',
        component: TrainerPseudoChallengesComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/assessments/:id/results',
        component: AssessmentResults,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/assessments',
        component: TrainerAssessmentsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/pseudo-submissions',
        component: TrainerPseudoSubmissionsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/courses',
        component: TrainerAssignedCoursesComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/interview-questions',
        component: TrainerInterviewQuestionsComponent,
        canActivate: [roleGuard(['TRAINER'])],
      },
      {
        path: 'trainer/create-assessment',
        component: CreateAssessmentComponent,
        canActivate: [roleGuard(['TRAINER'])],
      }
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
    path: 'dashboard/admin/plan-access',
    component: AdminPlanAccessComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
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
  {
    path: 'dashboard/student/pseudo-challenges',
    component: StudentPseudoChallengesComponent,
    canActivate: [authGuard, roleGuard(['STUDENT'])],
  },
  {
    path: 'dashboard/trainer/pseudo-challenges',
    component: TrainerPseudoChallengesComponent,
    canActivate: [authGuard, roleGuard(['TRAINER'])],
  },
  {
    path: 'dashboard/trainer/assessments/:id/results',
    component: AssessmentResults,
    canActivate: [authGuard, roleGuard(['TRAINER'])],
  },
  {
    path: 'dashboard/admin/public-practice',
    component: AdminPublicPracticePublishingComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
  },
  {
    path: 'dashboard/admin/manage-trainers',
    component: ManageTrainersComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
  },
  {
    path: 'dashboard/admin/manage-mentors',
    component: ManageMentorsComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])],
  },
  {
    path: 'dashboard/trainer/courses',
    component: TrainerAssignedCoursesComponent,
    canActivate: [authGuard, roleGuard(['TRAINER'])],
  },
  /* =========================
     FALLBACK
  ========================= */
  { path: '**', redirectTo: '' },
];
// Trigger rebuild for AdminUserGuideComponent integration
