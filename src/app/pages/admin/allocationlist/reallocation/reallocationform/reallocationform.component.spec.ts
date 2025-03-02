import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReallocationformComponent } from './reallocationform.component';

describe('ReallocationformComponent', () => {
  let component: ReallocationformComponent;
  let fixture: ComponentFixture<ReallocationformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReallocationformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReallocationformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
