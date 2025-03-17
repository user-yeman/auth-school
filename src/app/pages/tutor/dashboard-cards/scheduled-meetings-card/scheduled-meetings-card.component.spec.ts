import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMeetingsCardComponent } from './scheduled-meetings-card.component';

describe('ScheduledMeetingsCardComponent', () => {
  let component: ScheduledMeetingsCardComponent;
  let fixture: ComponentFixture<ScheduledMeetingsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledMeetingsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduledMeetingsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
