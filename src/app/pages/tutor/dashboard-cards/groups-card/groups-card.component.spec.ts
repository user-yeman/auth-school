import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsCardComponent } from './groups-card.component';

describe('GroupsCardComponent', () => {
  let component: GroupsCardComponent;
  let fixture: ComponentFixture<GroupsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
