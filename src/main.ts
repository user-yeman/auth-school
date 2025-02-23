import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { CookieService } from 'ngx-cookie-service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])), // Updated Interceptor
    provideRouter(routes),
    CookieService // Removed provideServiceWorker
  ]
}).catch(err => console.error(err));
