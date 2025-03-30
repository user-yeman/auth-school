import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSwitchComponent } from './student-switch.component';

describe('StudentSwitchComponent', () => {
  let component: StudentSwitchComponent;
  let fixture: ComponentFixture<StudentSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
