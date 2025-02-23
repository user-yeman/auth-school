//  import { Injectable } from '@angular/core';

//  @Injectable({
//    providedIn: 'root'
//  })
//  export class AuthService {

//    constructor() { }
//  }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  storeToken(token: string) {
    this.cookieService.set('auth_token', token, 1, '/');
  }

  getToken(): string {
    return this.cookieService.get('auth_token');
  }

  logout() {
    this.cookieService.delete('auth_token');
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    return this.cookieService.check('auth_token');
  }
}
