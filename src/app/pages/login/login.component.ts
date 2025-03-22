import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule], // Add MatSnackBarModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      (res: any) => {
        // Assuming the API response includes user name and last login
        const userName = res.name || res.username || 'User'; // Adjust based on your API response
        const lastLogin = res.last_login || new Date().toISOString(); // Use current time if last_login isn't provided

        this.authService.storeUserData(
          res.token,
          res.role,
          userName,
          lastLogin
        );

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
        this.router.navigate(['/login']);
        break;
    }
  }
}
