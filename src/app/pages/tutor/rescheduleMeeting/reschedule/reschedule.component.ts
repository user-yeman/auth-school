import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reschedule',
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './reschedule.component.html',
  styleUrls: ['./reschedule.component.css'],
})
export class RescheduleComponent implements OnInit {
  isLoading: boolean = true;
  isMobile: boolean = false;
  data: any;
  searchTerm: string = '';
  errorMessage: string = '';
  filteredMeetings: any[] = [];

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
