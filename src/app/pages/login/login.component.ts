import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule]  // ✅ Import FormsModule for ngModel support
})
export class LoginComponent {
  loginObj = { email: '', password: '' };

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.loginObj).subscribe({
      next: (res: any) => {
        if (res.token) {
          alert("✅ Login Successful!");
          window.location.href = '/dashboard';
        } else {
          alert("❌ Invalid Credentials");
        }
      },
      error: (err: any) => {
        alert("⚠️ API Error: Unable to connect.");
        console.error("Login Error:", err);
      }
    });
  }
}
