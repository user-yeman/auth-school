import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-allocation',
  imports: [
    RouterOutlet,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.css'],
})
export class AllocationComponent {
  // title = 'Personal Tutor Allocation';
}
