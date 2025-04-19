import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpCacheInterceptor implements HttpInterceptor {
  private cache = new Map<
    string,
    { response: HttpResponse<any>; timestamp: number }
  >();
  private cacheDuration = 5 * 60 * 1000; // Cache for 5 minutes (in milliseconds)

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip caching for non-GET requests or if cache is explicitly bypassed
    if (request.method !== 'GET' || request.headers.has('X-Bypass-Cache')) {
      return next.handle(request);
    }

    const cacheKey = request.urlWithParams;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Serve from cache if available and not expired
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return of(cached.response);
    }

    // Fetch new data and cache the response
    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.set(cacheKey, { response: event, timestamp: now });
        }
      })
    );
  }

  clearCache() {
    this.cache.clear(); // Clear all cached responses
  }
}
