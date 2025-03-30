import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorSwitchComponent } from './tutor-switch.component';

describe('TutorSwitchComponent', () => {
  let component: TutorSwitchComponent;
  let fixture: ComponentFixture<TutorSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
