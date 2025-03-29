import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { TutorDashboardComponent } from './pages/tutor/tutor-dashboard/tutor-dashboard.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard/student-dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { AllocationComponent } from './pages/admin/allocation/allocation.component';
import { CreateAllocationComponent } from './pages/admin/create-allocation/create-allocation.component';
import { AllocationlistComponent } from './pages/admin/allocationlist/allocationlist.component';
import { ReallocationFormComponent } from './pages/admin/allocationlist/reallocation/reallocationform/reallocationform.component';
import { StudentMeetingsComponent } from './pages/student/student-meetings/student-meetings.component';

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
