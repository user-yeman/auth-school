import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/login';
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password });
  }

  storeUserData(
    token: string,
    role: string,
    userName: string,
    lastLogin: string = new Date().toISOString()
  ): void {
    this.cookieService.set(
      'authToken',
      token,
      undefined,
      '/',
      undefined,
      false,
      'Lax'
    );
    this.cookieService.set('userRole', role);
    this.cookieService.set('userName', userName);
    this.cookieService.set('lastLogin', lastLogin);
  }
  getUserName(): string {
    return this.cookieService.get('userName') || '';
  }

  getLastLogin(): string {
    return this.cookieService.get('lastLogin') || '';
  }
  getUserRole(): string {
    return this.cookieService.get('userRole') || '';
  }

  isAuthenticated(): boolean {
    return !!this.cookieService.get('authToken');
  }

  logout(): void {
    this.cookieService.delete('authToken');
    this.cookieService.delete('userRole');
    this.cookieService.delete('userName');
    this.cookieService.delete('lastLogin');
    this.router.navigate(['/login']);
  }
}
