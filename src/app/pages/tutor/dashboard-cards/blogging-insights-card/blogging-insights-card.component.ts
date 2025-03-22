// blogging-insights-card.component.ts
import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common'; // Import DatePipe
import { MatCardModule } from '@angular/material/card';
import { BloggingInsightsCardData } from '../../../../model/card-model'; // Ensure correct path

@Component({
  selector: 'app-blogging-insights-card',
  imports: [MatCardModule],
  templateUrl: './blogging-insights-card.component.html',
  styleUrls: ['./blogging-insights-card.component.css'],
  providers: [DatePipe], // Provide DatePipe at component level
})
export class BloggingInsightsCardComponent {
  @Input() insights: BloggingInsightsCardData = {
    total_posts: 0,
    posts_by_students: 0,
    posts_by_you: 0,
    last_blog_date: null,
  };

  constructor(private datePipe: DatePipe) {} // Inject DatePipe

  get formattedLastBlogDate(): string | null {
    return this.insights.last_blog_date
      ? this.datePipe.transform(this.insights.last_blog_date, 'yyyy-MM-dd')
      : null;
  }
}
