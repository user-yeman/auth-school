import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/login';
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password });
  }

  storeUserData(token: string, role: string) {
    this.cookieService.set('authToken', token);
    this.cookieService.set('userRole', role);
  }

  getUserRole(): string {
    return this.cookieService.get('userRole') || '';
  }

  isAuthenticated(): boolean {
    return !!this.cookieService.get('authToken');
  }

  logout() {
    this.cookieService.delete('authToken');
    this.cookieService.delete('userRole');
    this.router.navigate(['/login']);
  }
}
