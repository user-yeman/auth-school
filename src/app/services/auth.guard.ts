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
          console.log('User not authenticated, redirecting to notfound');
          this.router.navigate(['/notfound']); // Redirect to UnauthorizedComponent
          return false;
        }

        const userRole = this.authService.getUserRole();
        console.log(
          `AuthGuard - User Role: ${userRole}, Expected Role: ${expectedRole}`
        );

        // Check if the role matches
        if (expectedRole && userRole !== expectedRole) {
          console.log(
            `Role mismatch: expected ${expectedRole}, got ${userRole}`
          );
          this.authService.redirectToDashboard(userRole);
          return false;
        }

        // Check for resource ownership (if applicable)
        const userIdFromUrl = route.paramMap.get('user_id'); // Adjust based on your URL structure
        const authenticatedUserId = this.authService.getUserId();

        if (userIdFromUrl && +userIdFromUrl !== authenticatedUserId) {
          console.log(
            `Unauthorized access: User ${authenticatedUserId} tried to access user ${userIdFromUrl}`
          );
          this.router.navigate(['/notfound']); // Redirect to unauthorized page
          return false;
        }

        console.log('AuthGuard - Access granted');
        return true;
      })
    );
  }
}
