import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });
    service = TestBed.inject(BlogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
