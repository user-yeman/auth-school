import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MeetingService } from '../../../../services/API/tutor/meetings/meeting.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FilterByStatusPipe } from '../../../common/pipes/filter-by-status.pipe';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteComponent } from '../../../common/dialog/note/note/note.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs'; // For mocking API response
import { delay } from 'rxjs/operators'; // For simulating API delay
import {
  MeetingComponent,
  ScheduleDialogData,
} from '../../../common/dialog/meetingDialog/meeting/meeting.component';
import { ConfirmComponent } from '../../../common/dialog/confirmDialog/confirm/confirm.component';

@Component({
  selector: 'app-meeting-schedule',
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './meeting-schedule.component.html',
  styleUrl: './meeting-schedule.component.css',
})
export class MeetingScheduleComponent implements OnInit {
  isLoading: boolean = true;
  isMobile: boolean = false;
  data: any;
  filteredMeetings: any[] = [];
  filteredDocuments: any[] = [];
  filteredBlogs: any[] = [];
  filterOptions: string[] = ['Upcoming', 'Pastdue'];
  selectedFilter: string = 'Upcoming';
  searchTerm: string = '';
  errorMessage: string = '';
  userId!: number; // Non-null assertion operator used to indicate it will be assigned later

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private meetingService: MeetingService,
    private breakpointObserver: BreakpointObserver,
    private toastService: ToastrService,
    private route: ActivatedRoute
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.paramMap.get('id');
    this.userId = userIdParam ? +userIdParam : 0; // Get userId from route or default to 0
    if (this.userId) {
      this.loadMeetings();
    } else {
      this.errorMessage = 'No user ID provided';
    }
  }
  loadMeetings(): void {
    this.isLoading = false;
    this.meetingService.getData(this.userId).subscribe({
      next: (response) => {
        this.data = response.data;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load meetings: ' + error.message;
      },
    });
  }
  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let meetings: any[] = [];
    const now = new Date();

    switch (this.selectedFilter.toLowerCase()) {
      case 'upcoming':
        meetings = (this.data.meetings.upcoming || []).filter(
          (meeting: { date: string }) => {
            const meetingDate = new Date(meeting.date);
            return meetingDate > now;
          }
        );
        break;
      case 'pastdue':
        meetings = (this.data.meetings.pastdue || []).filter(
          (meeting: { date: string }) => {
            const meetingDate = new Date(meeting.date);
            return meetingDate <= now;
          }
        );
        break;
      default:
        meetings = [];
    }

    if (this.searchTerm) {
      meetings = meetings.filter(
        (meeting: any) =>
          meeting.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (this.data.email &&
            this.data.email
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()))
      );
    }

    if (this.selectedFilter.toLowerCase() === 'upcoming') {
      meetings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    this.filteredMeetings = meetings;
    this.filteredDocuments = [];
    this.filteredBlogs = [];
  }

  getFilterCount(option: string): number {
    const now = new Date();
    switch (option.toLowerCase()) {
      case 'upcoming':
        return (this.data?.meetings.upcoming || []).filter(
          (m: { date: string }) => new Date(m.date) > now
        ).length;
      case 'pastdue':
        return (this.data?.meetings.pastdue || []).filter(
          (m: { date: string }) => new Date(m.date) <= now
        ).length;
      default:
        return 0;
    }
  }
  onFilterChange(value: string): void {
    this.selectedFilter = value;
    this.applyFilters();
  }

  isFutureMeeting(meeting: any): boolean {
    return new Date(meeting.date) > new Date();
  }

  finishMeeting(meetingId: string): void {
    const dialogRef = this.dialog.open(NoteComponent, {
      width: '400px',
      data: {
        title: 'Meeting Notes',
        placeholder: 'Enter notes here',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // undefined means dialog was cancelled
        console.log(`Finish meeting with ID: ${meetingId}, Notes: ${result}`);

        // Mock API response for development testing
        of({ success: true, message: 'Meeting finished successfully' }) // Simulate successful response
          .pipe(delay(1000)) // Simulate network delay of 1 second
          .subscribe({
            next: (response) => {
              this.toastService.success(response.message, 'Success');
              this.applyFilters(); // Refresh the meeting list
            },
            error: (error) => {
              this.toastService.error('Failed to finish meeting', 'Error');
              console.error('Mock API error:', error);
            },
          });
      } else {
        this.toastService.info('Meeting finish cancelled', 'Info');
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(MeetingComponent, {
      width: '500px',
      data: { mode: 'add' } as ScheduleDialogData,
      panelClass: 'custom-meeting-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Call the API to schedule the meeting
        this.meetingService.scheduleMeeting(result).subscribe({
          next: (response) => {
            console.log('Meeting scheduled successfully:', response);
            this.toastService.success('Meeting scheduled successfully!');
          },
          error: (error) => {
            console.error('Error scheduling meeting:', error);
            this.toastService.error(
              'Failed to schedule meeting. Please try again.'
            );
          },
        });
      }
    });
  }

  rescheduleMeeting(meetingId: string): void {
    const existingMeeting = {
      meetingName: 'Team Sync',
      date: new Date(),
      time: '10:00 AM',
      student: 'student@example.com',
      meetingType: 'Physical',
      location: 'Room 101',
      meetingApp: '',
      meetingLink: '',
      description: 'Weekly team sync meeting',
    };

    const dialogRef = this.dialog.open(MeetingComponent, {
      width: '1000px',
      height: '98%',
      data: { mode: 'update', meeting: existingMeeting } as ScheduleDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Meeting updated:', result);
        // Handle the updated meeting data (e.g., update backend)
      }
    });
  }

  cancelMeeting(meetingId: string): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '1000px',
      disableClose: true, // Prevents closing by clicking outside
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleCancellation();
      }
    });
  }
  handleCancellation(): void {
    console.log('Cancel');
    // const itemId = 'your-item-id'; // Replace with actual item ID
    // this.cancellationService.cancelItem(itemId).subscribe({
    //   next: () => {
    //     this.toastService.show('Item cancelled successfully!');
    //   },
    //   error: (error) => {
    //     this.toastService.error(error.message);
    //   },
    // });
  }
  goBack(): void {
    this.router.navigate(['/tutor/student-management']);
  }
}
