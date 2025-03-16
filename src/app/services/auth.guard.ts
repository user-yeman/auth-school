import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];

    const userRole = this.authService.getUserRole();

    if (!this.authService.isAuthenticated() || userRole !== expectedRole) {
      this.router.navigate(['/login']);
      return false;
    }
    console.log('AuthGuard - Access granted');
    return true;
  }
}
