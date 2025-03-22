import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ScheduledMeetingsCardData } from '../../../../model/card-model';

@Component({
  selector: 'app-scheduled-meetings-card',
  imports: [MatCardModule],
  templateUrl: './scheduled-meetings-card.component.html',
  styleUrl: './scheduled-meetings-card.component.css',
})
export class ScheduledMeetingsCardComponent {
  @Input() meetings: ScheduledMeetingsCardData = {
    total: 0,
    online_count: 0,
    offline_count: 0,
    online_platforms: [],
    offline_locations: [],
  };
}
