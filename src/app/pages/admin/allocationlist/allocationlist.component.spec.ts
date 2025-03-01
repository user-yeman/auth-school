import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationlistComponent } from './allocationlist.component';

describe('AllocationlistComponent', () => {
  let component: AllocationlistComponent;
  let fixture: ComponentFixture<AllocationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
