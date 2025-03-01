import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationModelComponent } from './allocation-model.component';

describe('AllocationModelComponent', () => {
  let component: AllocationModelComponent;
  let fixture: ComponentFixture<AllocationModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocationModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
