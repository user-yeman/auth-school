import {
  reschedule,
  RescheduleResponse,
} from './../../../../model/tutor-meeting-model';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  actionInProgress: boolean = false; // New flag to track ongoing action

  constructor(
    private meetingService: MeetingService,
    private breakpointObserver: BreakpointObserver,
    private toastService: ToastrService,
    private cdr: ChangeDetectorRef
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
      next: (response: RescheduleResponse) => {
        this.isLoading = false;
        if (response.data && Array.isArray(response.data)) {
          this.data = response.data;
          this.filteredMeetings = [...this.data]; // Create a new array to trigger change detection
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
      this.filteredMeetings = this.data.filter((meeting: reschedule) =>
        meeting.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredMeetings = [...this.data]; // Ensure a new array reference
    }
  }

  approve(requestId: number): void {
    this.actionInProgress = true; // Show loading state
    this.meetingService.approveReschedule(requestId).subscribe({
      next: (response) => {
        this.toastService.success('Meeting request approved successfully!');
        this.updateMeetingList(requestId); // Update the list after approval
        this.actionInProgress = false;
      },
      error: (error) => {
        this.toastService.error(
          'Failed to approve meeting request: ' + error.message
        );
        this.actionInProgress = false;
      },
    });
  }

  reject(requestId: number): void {
    this.actionInProgress = true; // Show loading state
    this.meetingService.rejectReschedule(requestId).subscribe({
      next: (response) => {
        this.toastService.success('Meeting request rejected successfully!');
        this.updateMeetingList(requestId); // Update the list after rejection
        this.actionInProgress = false;
      },
      error: (error) => {
        this.toastService.error(
          'Failed to reject meeting request: ' + error.message
        );
        this.actionInProgress = false;
      },
    });
  }

  private updateMeetingList(requestId: number): void {
    // Remove the meeting from the data array
    this.data = this.data.filter((meeting) => meeting.id !== requestId);
    this.filteredMeetings = [...this.data]; // Update filteredMeetings with a new array
    this.cdr.detectChanges(); // Force change detection
  }
}
