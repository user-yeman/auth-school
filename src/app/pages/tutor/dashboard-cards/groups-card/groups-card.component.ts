import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-groups-card',
  imports: [MatCardModule],
  templateUrl: './groups-card.component.html',
  styleUrl: './groups-card.component.css',
})
export class GroupsCardComponent {
  @Input() groups: {
    teacher_group: number;
    class_5th: number;
    class_6th: number;
  } = {
    teacher_group: 0,
    class_5th: 0,
    class_6th: 0,
  };

  getTotalGroups() {
    return Object.values(this.groups).reduce((a, b) => a + b, 0);
  }
}
