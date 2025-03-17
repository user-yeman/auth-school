import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloggingInsightsCardComponent } from './blogging-insights-card.component';

describe('BloggingInsightsCardComponent', () => {
  let component: BloggingInsightsCardComponent;
  let fixture: ComponentFixture<BloggingInsightsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloggingInsightsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloggingInsightsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
