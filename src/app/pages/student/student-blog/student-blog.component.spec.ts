import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBlogComponent } from './student-blog.component';

describe('StudentBlogComponent', () => {
  let component: StudentBlogComponent;
  let fixture: ComponentFixture<StudentBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
