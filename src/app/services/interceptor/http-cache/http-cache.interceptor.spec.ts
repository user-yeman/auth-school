import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { HttpHandlerFn } from '@angular/common/http';
import { HttpCacheInterceptor } from './http-cache.interceptor';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpCacheInterceptor]
    });
    interceptor = TestBed.inject(HttpCacheInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
