import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data['expectedRole'];
    const userRole = this.authService.getUserRole();
      
    if (this.authService.isAuthenticated() && userRole === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}