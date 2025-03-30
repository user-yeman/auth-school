import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleComponent } from './reschedule.component';

describe('RescheduleComponent', () => {
  let component: RescheduleComponent;
  let fixture: ComponentFixture<RescheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RescheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RescheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
