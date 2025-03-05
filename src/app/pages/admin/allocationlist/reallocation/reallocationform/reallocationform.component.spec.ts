import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReallocationFormComponent } from './reallocationform.component';

describe('ReallocationFormComponent', () => {
  let component: ReallocationFormComponent;
  let fixture: ComponentFixture<ReallocationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReallocationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReallocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
