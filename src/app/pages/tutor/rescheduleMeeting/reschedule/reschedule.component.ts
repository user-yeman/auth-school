import {
  reschedule,
  RescheduleResponse,
} from './../../../../model/tutor-meeting-model';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MeetingService } from '../../../../services/API/tutor/meetings/meeting.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ToastrService } from 'ngx-toastr';

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
  data: reschedule[] = [];
  searchTerm: string = '';
  errorMessage: string = '';
  filteredMeetings: reschedule[] = [];

  constructor(
    private meetingService: MeetingService,
    private breakpointObserver: BreakpointObserver,
    private toastService: ToastrService
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngOnInit(): void {
    this.loadRequests();
  }
  loadRequests(): void {
    this.isLoading = true;
    this.meetingService.getRescheduleData().subscribe({
      // Added parentheses
      next: (response: RescheduleResponse) => {
        this.isLoading = false;
        if (response.data && Array.isArray(response.data)) {
          this.data = response.data;
          console.log(this.data);
          this.filteredMeetings = this.data;
          console.log(this.filteredMeetings);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load meetings: ' + error.message;
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTerm) {
      this.filteredMeetings = this.data.filter((meeting: any) => {
        return meeting.title
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      });
    } else {
      this.filteredMeetings = this.data;
    }
  }
  approve(requestId: number) {
    this.meetingService.approveReschedule(requestId).subscribe({
      next: (response) => {
        this.loadRequests();
        this.toastService.success('Meeting request approved successfully!');
      },
      error: (error) => {
        this.toastService.error(
          'Failed to approve meeting request: ' + error.message
        );
      },
    });
  }

  reject(requestId: number) {
    this.meetingService.rejectReschedule(requestId).subscribe({
      next: (response) => {
        this.loadRequests();
        this.toastService.success('Meeting request rejected successfully!');
      },
      error: (error) => {
        this.toastService.error(
          'Failed to reject meeting request: ' + error.message
        );
      },
    });
  }
}
