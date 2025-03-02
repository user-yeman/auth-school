import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    cookieServiceSpy.get.and.returnValue('mocked_token'); // Simulated token

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should add Authorization header if token exists', () => {
    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockHandler = {
      handle: jasmine.createSpy('handle').and.returnValue(of({})),
    };

    interceptor.intercept(mockRequest, mockHandler as any).subscribe();

    expect(mockHandler.handle).toHaveBeenCalled();
    const interceptedRequest = mockHandler.handle.calls.mostRecent().args[0];

    expect(interceptedRequest.headers.has('Authorization')).toBeTrue();
    expect(interceptedRequest.headers.get('Authorization')).toBe(
      'Bearer mocked_token'
    );
  });

  it('should not add Authorization header if no token exists', () => {
    cookieServiceSpy.get.and.returnValue(''); // Simulate no token

    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockHandler = {
      handle: jasmine.createSpy('handle').and.returnValue(of({})),
    };

    interceptor.intercept(mockRequest, mockHandler as any).subscribe();

    expect(mockHandler.handle).toHaveBeenCalled();
    const interceptedRequest = mockHandler.handle.calls.mostRecent().args[0];

    expect(interceptedRequest.headers.has('Authorization')).toBeFalse();
  });
});
