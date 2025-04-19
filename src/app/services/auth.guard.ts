import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRole = route.data['expectedRole'];

    return this.authService.isAuthenticated().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }, // Preserve intended URL
          });
          return false;
        }

        const userRole = this.authService.getUserRole();
        console.log(
          `AuthGuard - User Role: ${userRole}, Expected Role: ${expectedRole}`
        );

        if (expectedRole && userRole !== expectedRole) {
          console.log(
            `Role mismatch: expected ${expectedRole}, got ${userRole}`
          );
          this.authService.redirectToDashboard(userRole);
          return false;
        }

        console.log('AuthGuard - Access granted');
        return true;
      })
    );
  }
}
