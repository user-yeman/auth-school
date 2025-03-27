import { Component, OnInit } from '@angular/core';
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
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
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
  userId!: number;

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
    this.userId = userIdParam ? +userIdParam : 0;
    if (this.userId) {
      this.loadMeetings();
    } else {
      this.errorMessage = 'No user ID provided';
    }
  }

  loadMeetings(): void {
    this.isLoading = true;
    this.meetingService.getData(this.userId).subscribe({
      next: (response) => {
        this.data = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load meetings: ' + error.message;
        this.isLoading = false;
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
        meetings = (this.data?.meetings.upcoming || []).filter(
          (meeting: { date: string }) => {
            const meetingDate = new Date(meeting.date);
            return meetingDate > now;
          }
        );
        break;
      case 'pastdue':
        meetings = (this.data?.meetings.pastdue || []).filter(
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
          (this.data?.email &&
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
        const { notes, uploadedDocument } = result; // Assuming the dialog returns notes and an optional file
        const arrangeId = parseInt(meetingId, 10); // Convert meeting ID to integer

        // Record the meeting note
        this.recordMeetingNote(arrangeId, notes, uploadedDocument);
      } else {
        this.toastService.info('Meeting finish cancelled', 'Info');
      }
    });
  }
  recordMeetingNote(
    arrangeId: number,
    meetingNote: string,
    uploadedDocument: File
  ): void {
    // Create FormData to handle file upload and other form data
    const formData = new FormData();
    formData.append('arrange_id', arrangeId.toString());
    formData.append('meeting_note', meetingNote);
    if (uploadedDocument) {
      formData.append('uploaded_document', uploadedDocument);
    }

    // Call the API to record the meeting note
    this.meetingService.recordNote(formData).subscribe({
      next: (response) => {
        console.log('Meeting note recorded successfully:', response);
        this.toastService.success('Meeting note recorded successfully!');
      },
      error: (error) => {
        console.error('Error recording meeting note:', error);
        this.toastService.error(
          'Failed to record meeting note: ' +
            (error.error?.message || error.message),
          'Error'
        );
      },
    });
  }
  openAddDialog(): void {
    const dialogRef = this.dialog.open(MeetingComponent, {
      width: '500px',
      data: { mode: 'add', studentId: this.userId } as ScheduleDialogData,
      panelClass: 'custom-meeting-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data being sent to backend:', result);
        this.isLoading = true;
        this.meetingService.scheduleMeeting(result).subscribe({
          next: (response) => {
            console.log('Meeting scheduled successfully:', response);
            this.toastService.success('Meeting scheduled successfully!');
            const newMeeting = {
              id: response?.id || Date.now(),
              title: result.topic,
              date: result.arrange_date,
              time: result.arrange_date,
              meeting_type: result.meeting_type,
              description: result.description,
              meeting_link: result.meeting_link,
              location: result.location,
              status: 'Upcomming',
              filter_status: result.filter_status,
            };
            if (!this.data)
              this.data = { meetings: { upcoming: [], pastdue: [] } };
            this.data.meetings.upcoming.push(newMeeting);
            this.applyFilters();
            this.isLoading = false;
            this.loadMeetings();
          },
          error: (error) => {
            console.error('Error scheduling meeting:', error);
            this.toastService.error(
              'Failed to schedule meeting: ' +
                (error.error?.message || error.message),
              'Error'
            );
            this.isLoading = false;
            this.loadMeetings();
          },
        });
      }
    });
  }

  rescheduleMeeting(meetingId: string): void {
    // Find the meeting to reschedule
    const meetingToUpdate = this.filteredMeetings.find(
      (m) => m.id === parseInt(meetingId)
    );
    if (!meetingToUpdate) {
      console.error('Meeting not found for ID:', meetingId);
      return;
    }

    const dialogRef = this.dialog.open(MeetingComponent, {
      width: '500px',
      data: {
        mode: 'update',
        meeting: meetingToUpdate,
        studentId: this.userId,
      } as ScheduleDialogData,
      panelClass: 'custom-meeting-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data being sent to backend for reschedule:', result);
        this.isLoading = true;
        this.meetingService.rescheduleMeeting(result.id, result).subscribe({
          next: (response) => {
            console.log('Meeting rescheduled successfully:', response);
            this.toastService.success('Meeting rescheduled successfully!');

            // Update the meeting in the local data
            const index = this.data.meetings.upcoming.findIndex(
              (m: { id: number }) => m.id === result.id
            );
            if (index !== -1) {
              this.data.meetings.upcoming[index] = {
                ...this.data.meetings.upcoming[index],
                title: result.topic,
                date: result.arrange_date,
                time: result.arrange_date,
                meeting_type: result.meeting_type,
                description: result.description,
                meeting_link: result.meeting_link,
                location: result.location,
                status: result.status,
                filter_status: result.filter_status,
              };
              this.applyFilters();
            }
            this.isLoading = false;
            this.loadMeetings(); // Refresh from server
          },
          error: (error) => {
            console.error('Error rescheduling meeting:', error);
            this.toastService.error(
              'Failed to reschedule meeting: ' +
                (error.error?.message || error.message),
              'Error'
            );
            this.isLoading = false;
            this.loadMeetings();
          },
        });
      }
    });
  }

  cancelMeeting(meetingId: string): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '1000px',
      disableClose: true,
      data: { message: 'Are you sure you want to cancel this meeting?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleCancellation(parseInt(meetingId));
      }
    });
  }

  handleCancellation(meetingId: number): void {
    this.isLoading = true;
    console.log('Cancelling meeting with ID:', meetingId);

    // Optimistic update: Remove the meeting from the local data
    const index = this.data.meetings.upcoming.findIndex(
      (m: { id: number }) => m.id === meetingId
    );
    if (index !== -1) {
      this.data.meetings.upcoming.splice(index, 1);
      this.applyFilters();
    }

    this.meetingService.deleteMeeting(meetingId).subscribe({
      next: (response) => {
        console.log('Meeting deleted successfully:', response);
        this.toastService.success('Meeting cancelled successfully!');
        this.isLoading = false;
        this.loadMeetings(); // Refresh from server
      },
      error: (error) => {
        console.error('Error deleting meeting:', error);
        this.toastService.error(
          'Failed to cancel meeting: ' +
            (error.error?.message || error.message),
          'Error'
        );
        this.isLoading = false;
        this.loadMeetings(); // Refresh to rollback on error
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tutor/student-management']);
  }
}
