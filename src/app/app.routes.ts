import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TutorDashboardComponent } from './pages/tutor/tutor-dashboard/tutor-dashboard.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard/student-dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { AllocationComponent } from './pages/admin/allocation/allocation.component';
import { CreateAllocationComponent } from './pages/admin/create-allocation/create-allocation.component';
import { AllocationlistComponent } from './pages/admin/allocationlist/allocationlist.component';
import { ReallocationFormComponent } from './pages/admin/allocationlist/reallocation/reallocationform/reallocationform.component';
<<<<<<< HEAD
import { StudentManagementComponent } from './pages/tutor/studentManagement/student-management/student-management.component';
import { MeetingScheduleComponent } from './pages/tutor/meetingSchedules/meeting-schedule/meeting-schedule.component';
import { RescheduleComponent } from './pages/tutor/rescheduleMeeting/reschedule/reschedule.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
=======
import { StudentMeetingsComponent } from './pages/student/student-meetings/student-meetings.component';
import { StudentBlogComponent } from './pages/student/student-blog/student-blog.component';
>>>>>>> ba8056782498fe4d33afcdb4d95ad140aafe7f79

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,

    children: [
      // Admin Routes
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
          {
            path: 'admin-dashboard',
            component: AdminDashboardComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
          },
          {
            path: 'allocation',
            component: AllocationComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
            children: [
              {
                path: 'create-allocation',
                component: CreateAllocationComponent,
              },
              { path: 'allocationlist', component: AllocationlistComponent },
              {
                path: 'reallocationform',
                component: ReallocationFormComponent,
              },
            ],
          },
        ],
      },
      // Tutor Routes
      {
        path: 'tutor',
        canActivate: [AuthGuard],
        data: { expectedRole: 'tutor' },
        children: [
          { path: '', redirectTo: 'tutor-dashboard', pathMatch: 'full' },
          {
            path: 'tutor-dashboard',
            component: TutorDashboardComponent,
          },
          {
            path: 'student-management',
            component: StudentManagementComponent,
          },
          { path: 'meetings/:id', component: MeetingScheduleComponent },
          { path: 'request', component: RescheduleComponent },
          // more routes
        ],
      },
      // Student Routes
      {
        path: 'student',
        canActivate: [AuthGuard],
        data: { expectedRole: 'student' },
        children: [
          { path: '', redirectTo: 'student-dashboard', pathMatch: 'full' },
          {
            path: 'student-dashboard',
            component: StudentDashboardComponent,
          },
          {
            path: 'student-blog',
            component: StudentBlogComponent,
          },
          {
            path: 'student-meetings',
            component: StudentMeetingsComponent,
          },
          // more routes

        ],
      },
      // Default redirect (could be role-based in AuthGuard)
      { path: '', redirectTo: '/login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
