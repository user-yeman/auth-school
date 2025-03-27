import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorListTableComponent } from './tutor-list-table.component';

describe('TutorListTableComponent', () => {
  let component: TutorListTableComponent;
  let fixture: ComponentFixture<TutorListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorListTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
