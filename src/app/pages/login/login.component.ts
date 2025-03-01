import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], //  Add FormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      (res: any) => {
        this.authService.storeUserData(res.token, res.role);
        window.alert(`Login successful! Role: ${res.role}`);
        console.log('Login successful', res);
        this.redirectToDashboard(res.role);
      },
      (error: any) => {
        window.alert(
          'Login failed. Please check your credentials and try again.'
        );
        console.error('Login failed', error);
      }
    );
  }

  redirectToDashboard(role: string) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/admin-dashboard']);
        break;
      case 'tutor':
        this.router.navigate(['/tutor-dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
