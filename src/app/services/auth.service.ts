import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';
import { HttpCacheInterceptor } from './interceptor/http-cache/http-cache.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private cacheInterceptor: HttpCacheInterceptor
  ) {}
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password });
  }

  storeUserData(
    token: string,
    role: string,
    user_id: number,
    first_login: boolean
  ): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    this.cookieService.set(
      'authToken',
      token,
      expires,
      '/',
      undefined,
      false,
      'Lax'
    );

    this.cookieService.set('userRole', role, expires, '/');
    this.cookieService.set('user_id', user_id.toString(), expires, '/');
    this.cookieService.set('first_login', String(first_login), expires, '/');
  }
  getUserRole(): string {
    return this.cookieService.get('userRole') || '';
  }
  getUserId(): number {
    return parseInt(this.cookieService.get('user_id') || '0', 10);
  }
  getFirstLogin(): boolean {
    return this.cookieService.get('first_login') === 'true';
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.cookieService.get('authToken');

    if (!token) {
      return of(false); // Return false if no token is found
    }
    return of(true);
  }

  logout(): void {
    console.log(
      'Before deleting cookies - authToken:',
      this.cookieService.get('authToken')
    );
    this.cookieService.delete('authToken', '/');
    this.cookieService.delete('userRole', '/');
    this.cookieService.delete('user_id', '/');
    console.log(
      'After deleting cookies - authToken:',
      this.cookieService.get('authToken')
    );

    console.log('Clearing cache...');
    this.cacheInterceptor.clearCache();
    console.log('Cache cleared');

    this.router.navigate(['/login']);
  }
  redirectToDashboard(role: string): void {
    switch (role.trim()) {
      case 'admin':
        this.router.navigate(['/admin/admin-dashboard']);
        break;
      case 'tutor':
        this.router.navigate(['/tutor/tutor-dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student/student-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
