import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-total-students-card',
  imports: [MatCardModule],
  templateUrl: './total-students-card.component.html',
  styleUrls: ['./total-students-card.component.css'],
})
export class TotalStudentsCardComponent {
  @Input() students = { count: 0, active: 0, inactive: 0 };

  getTotalStudents() {
    return this.students.count + this.students.active + this.students.inactive;
  }
}
