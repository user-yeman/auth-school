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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' },
    children: [
      { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
      { path: 'admin-dashboard', component: AdminDashboardComponent },

      {
        path: 'allocation',
        component: AllocationComponent, // Parent component
        children: [
          { path: 'create-allocation', component: CreateAllocationComponent },
          { path: 'allocationlist', component: AllocationlistComponent },
        ],
      },
    ],
  },
  {
    path: 'tutor-dashboard',
    component: TutorDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'tutor' },
  },
  {
    path: 'student-dashboard',
    component: StudentDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'student' },
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
