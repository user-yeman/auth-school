import { Component, Input } from '@angular/core';
import { TutorDashboardService } from '../../../../services/API/tutor/tutor-dashboard.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-blogging-insights-card',
  imports: [MatCardModule],
  templateUrl: './blogging-insights-card.component.html',
  styleUrl: './blogging-insights-card.component.css',
})
export class BloggingInsightsCardComponent {
  @Input() insights = {
    total_posts: 0,
    posts_by_students: 0,
    posts_by_you: 0,
    last_blog_date: null as string | null,
  };
}
