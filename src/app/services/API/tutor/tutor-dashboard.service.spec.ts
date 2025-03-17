import { TestBed } from '@angular/core/testing';

import { TutorDashboardService } from './tutor-dashboard.service';

describe('TutorDashboardService', () => {
  let service: TutorDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
