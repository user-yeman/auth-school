import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogModelDialogComponent } from './blog-model-dialog.component';

describe('BlogModelDialogComponent', () => {
  let component: BlogModelDialogComponent;
  let fixture: ComponentFixture<BlogModelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogModelDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
