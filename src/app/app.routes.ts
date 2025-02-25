import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { TutorDashboardComponent } from './pages/tutor-dashboard/tutor-dashboard.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
  { path: 'tutor-dashboard', component: TutorDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'tutor' } },
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'student' } },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
