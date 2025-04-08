import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCardsHolderComponent } from './blog-cards-holder.component';

describe('BlogCardsHolderComponent', () => {
  let component: BlogCardsHolderComponent;
  let fixture: ComponentFixture<BlogCardsHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCardsHolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogCardsHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
