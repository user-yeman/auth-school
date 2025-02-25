import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],  //  Add FormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
        this.redirectToDashboard(res.role);
      },
      (error: any) => {
        window.alert('Login failed. Please check your credentials and try again.');
        console.error('Login failed', error);
      }
    );
  }

  redirectToDashboard(role: string) {
    if (role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'tutor') {
      this.router.navigate(['/tutor-dashboard']);
    } else if (role === 'student') {
      this.router.navigate(['/student-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
