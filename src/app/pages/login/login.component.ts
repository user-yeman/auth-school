import { Component, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ], // Add MatSnackBarModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      (res: any) => {
        const id = res.user_id || 0; // Default to 0 if not provided
        this.authService.storeUserData(res.token, res.role, id);

        if (res.first_login) {
          this.snackBar.open(`Welcome to the first login!`, 'Close', {
            duration: 6000,
            panelClass: ['snackbar-success'],
            verticalPosition: 'top',
          });
        } else {
          this.snackBar.open(`Login successful! Role: ${res.role}`, 'Close', {
            duration: 6000,
            panelClass: ['snackbar-success'],
            verticalPosition: 'top',
          });
        }

        console.log('Login successful', res);
        this.redirectToDashboard(res.role);
      },
      (error: any) => {
        this.snackBar.open(
          'Login failed. Please check your credentials and try again.',
          'Close',
          {
            duration: 6000,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
          }
        );
        console.error('Login failed', error);
      }
    );
  }

  redirectToDashboard(role: string) {
    switch (
      role.trim() // Trim any accidental whitespace
    ) {
      case 'admin':
        console.log('Navigating to admin dashboard');
        this.router.navigate(['/admin/admin-dashboard']);
        break;
      case 'tutor':
        console.log('Navigating to tutor dashboard');
        this.router.navigate(['/tutor/tutor-dashboard']);
        break;
      case 'student':
        console.log('Navigating to student dashboard');
        this.router.navigate(['/student/student-dashboard']);
        break;
      default:
        console.log('Unknown role, redirecting to login');
        this.router.navigate(['/notfound']);
        break;
    }
  }
}
