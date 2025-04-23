import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MeetingService } from '../../../../services/API/tutor/meetings/meeting.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteComponent } from '../../../common/dialog/note/note/note.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {
  MeetingComponent,
  ScheduleDialogData,
} from '../../../common/dialog/meetingDialog/meeting/meeting.component';
import { ConfirmComponent } from '../../../common/dialog/confirmDialog/confirm/confirm.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SkeletonComponent } from '../../../../common/loading/skeleton/skeleton/skeleton.component';
import { BlogComponent } from '../../blog-cards-holder/blogs/blog.component';
import { BlogCardsHolderComponent } from '../../blog-cards-holder/blog-cards-holder.component';

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
    SkeletonComponent,
    BlogCardsHolderComponent,
  ],
  providers: [DatePipe],
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
  filterOptions: string[] = ['Upcoming', 'Pastdue', 'Completed'];
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
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
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        this.errorMessage = 'Failed to load meetings: ' + error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
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
          (meeting: {
            date: string;
            filter_status: string;
            status: string;
          }) => {
            const meetingDateTime = new Date(meeting.date);
            return (
              meeting.filter_status === 'upcoming' &&
              meetingDateTime > now &&
              meeting.status !== 'completed'
            );
          }
        );
        break;

      case 'pastdue':
        meetings = (this.data?.meetings.pastdue || []).filter(
          (meeting: { date: string; filter_status: string }) => {
            const meetingDateTime = new Date(meeting.date);
            return (
              meeting.filter_status === 'pastdue' && meetingDateTime <= now
            );
          }
        );
        break;

      case 'completed':
        meetings = [
          ...(this.data?.meetings.upcoming || []),
          ...(this.data?.meetings.pastdue || []),
        ].filter((meeting: { status: string }) => {
          return meeting.status === 'completed';
        });
        break;

      default:
        meetings = [];
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      meetings = meetings.filter((meeting: any) => {
        const titleMatch = meeting.title?.toLowerCase().includes(searchLower);
        const emailMatch =
          this.data?.email &&
          this.data.email.toLowerCase().includes(searchLower);
        const dateMatch = this.datePipe
          .transform(meeting.date, 'MM/dd/yyyy')
          ?.toLowerCase()
          .includes(searchLower);
        return titleMatch || emailMatch || dateMatch;
      });
    }

    meetings.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.filteredMeetings = meetings;
    this.cdr.detectChanges(); // Trigger change detection
  }

  getFilterCount(option: string): number {
    const now = new Date();
    switch (option.toLowerCase()) {
      case 'upcoming':
        return (this.data?.meetings.upcoming || []).filter(
          (m: { date: string; filter_status: string; status: string }) =>
            m.filter_status === 'upcoming' &&
            new Date(m.date) > now &&
            m.status !== 'completed'
        ).length;
      case 'pastdue':
        return (this.data?.meetings.pastdue || []).filter(
          (m: { date: string; filter_status: string }) =>
            m.filter_status === 'pastdue' && new Date(m.date) <= now
        ).length;
      case 'completed':
        return [
          ...(this.data?.meetings.upcoming || []),
          ...(this.data?.meetings.pastdue || []),
        ].filter((m: { status: string }) => m.status === 'completed').length;
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

  finishMeeting(meetingId: number): void {
    const meeting = this.filteredMeetings.find(
      (m) => m.meeting_detail_id === meetingId
    );
    if (!meeting) {
      console.error('Invalid meeting ID:', meetingId);
      this.toastService.error('Invalid meeting ID provided.', 'Error');
      return;
    }

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
        const { notes, uploadedDocument } = result;
        console.log('Dialog result:', result);
        this.recordMeetingNote(meetingId, notes, uploadedDocument, meeting);
      } else {
        this.toastService.info('Meeting finish cancelled', 'Info');
      }
    });
  }

  recordMeetingNote(
    meetingId: number,
    meetingNote: string | undefined,
    uploadedDocument?: File,
    meeting?: any
  ): void {
    console.log('Recording meeting note with ID:', meetingId);

    if (!meetingNote || !meetingNote.trim()) {
      console.error('Meeting note is empty or undefined');
      this.toastService.error('Please enter meeting notes', 'Error');
      return;
    }

    const formData = new FormData();
    formData.append('meeting_detail_id', meetingId.toString());
    formData.append('meeting_note', meetingNote);
    if (uploadedDocument) {
      console.log('Uploading file:', uploadedDocument.name);
      formData.append('uploaded_document', uploadedDocument);
    } else {
      console.log('No file uploaded');
    }

    for (let pair of (formData as any).entries()) {
      console.log(`FormData - ${pair[0]}: ${pair[1]}`);
    }

    this.meetingService.recordNote(formData).subscribe({
      next: (response) => {
        console.log('Meeting note recorded successfully:', response);
        this.toastService.success('Meeting note recorded successfully!');

        // Update the local state
        const meetingToUpdate = this.data.meetings.upcoming.find(
          (m: any) => m.meeting_detail_id === meetingId
        );
        if (meetingToUpdate) {
          // Update the meeting status to 'completed'
          meetingToUpdate.status = 'completed';
          meetingToUpdate.meetingRecord = {
            id: response.id || Date.now(), // Assuming the response includes the new record ID
            meeting_detail_id: meetingId,
            meeting_note: meetingNote,
            uploaded_document: uploadedDocument
              ? URL.createObjectURL(uploadedDocument)
              : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          };

          // Move the meeting to pastdue if the date is in the past
          const meetingDate = new Date(meetingToUpdate.date);
          const now = new Date();
          if (meetingDate <= now) {
            this.data.meetings.upcoming = this.data.meetings.upcoming.filter(
              (m: any) => m.meeting_detail_id !== meetingId
            );
            this.data.meetings.pastdue.push(meetingToUpdate);
          }

          this.applyFilters();
          this.cdr.detectChanges();
        }

        // Optionally reload from server to ensure consistency
        this.loadMeetings();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error recording meeting note:', error);
        const errorMsg = error.error?.message || error.message;
        this.toastService.error(
          `Failed to record meeting note: ${errorMsg}`,
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
              meeting_detail_id: response?.meeting_detail_id || Date.now(),
              title: result.topic,
              date: result.arrange_date,
              time: result.arrange_date,
              meeting_type: result.meeting_type,
              description: result.description,
              meeting_link: result.meeting_link,
              location: result.location,
              status: 'upcoming',
              filter_status: 'upcoming',
            };
            if (!this.data) {
              this.data = { meetings: { upcoming: [], pastdue: [] } };
            }
            this.data.meetings.upcoming.push(newMeeting);
            this.applyFilters();
            this.isLoading = false;
            this.cdr.detectChanges();
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

            // Update the local state
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
                status: result.status || 'upcoming',
                filter_status: result.filter_status || 'upcoming',
              };
              this.applyFilters();
              this.cdr.detectChanges();
            }
            this.isLoading = false;
            this.loadMeetings();
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
      this.cdr.detectChanges();
    }

    this.meetingService.deleteMeeting(meetingId).subscribe({
      next: (response) => {
        console.log('Meeting deleted successfully:', response);
        this.toastService.success('Meeting cancelled successfully!');
        this.isLoading = false;
        this.loadMeetings();
      },
      error: (error) => {
        console.error('Error deleting meeting:', error);
        this.toastService.error(
          'Failed to cancel meeting: ' +
            (error.error?.message || error.message),
          'Error'
        );
        this.isLoading = false;
        this.loadMeetings();
      },
    });
  }

  downloadFile(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  }

  editMeetingRecord(meeting: any): void {
    const dialogRef = this.dialog.open(NoteComponent, {
      width: '400px',
      data: {
        title: 'Edit Meeting Record',
        placeholder: 'Edit meeting record',
        existingNotes: meeting.meetingRecord?.meeting_note || '',
        existingFile: meeting.meetingRecord?.uploaded_document
          ? {
              name: meeting.meetingRecord.uploaded_document.split('/').pop(),
              url: meeting.meetingRecord.uploaded_document,
            }
          : null,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { notes, uploadedDocument } = result;
        const formData = new FormData();
        formData.append(
          'meeting_detail_id',
          meeting.meeting_detail_id.toString()
        );
        formData.append('meeting_note', notes);
        if (uploadedDocument) {
          formData.append('uploaded_document', uploadedDocument);
        }

        this.meetingService
          .updateMeetingRecord(meeting.meetingRecord.id, formData)
          .subscribe({
            next: (response) => {
              this.toastService.success('Meeting record updated successfully!');

              // Update the local state
              const meetingToUpdate =
                this.data.meetings.pastdue.find(
                  (m: any) => m.meeting_detail_id === meeting.meeting_detail_id
                ) ||
                this.data.meetings.upcoming.find(
                  (m: any) => m.meeting_detail_id === meeting.meeting_detail_id
                );
              if (meetingToUpdate && meetingToUpdate.meetingRecord) {
                meetingToUpdate.meetingRecord.meeting_note = notes;
                meetingToUpdate.meetingRecord.uploaded_document =
                  uploadedDocument
                    ? URL.createObjectURL(uploadedDocument)
                    : meetingToUpdate.meetingRecord.uploaded_document;
                meetingToUpdate.meetingRecord.updated_at =
                  new Date().toISOString();
              }

              this.applyFilters();
              this.cdr.detectChanges();

              // Optionally reload from server
              this.loadMeetings();
            },
            error: (error) => {
              this.toastService.error(
                `Failed to update meeting record: ${error.message}`,
                'Error'
              );
            },
          });
      }
    });
  }

  deleteMeetingRecord(recordId: number): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '400px',
      disableClose: true,
      data: { message: 'Are you sure you want to delete this meeting record?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.meetingService.deleteMeetingRecord(recordId).subscribe({
          next: () => {
            this.toastService.success('Meeting record deleted successfully!');

            // Update the local state
            const meetingToUpdate = [
              ...(this.data.meetings.pastdue || []),
              ...(this.data.meetings.upcoming || []),
            ].find((m: any) => m.meetingRecord?.id === recordId);
            if (meetingToUpdate) {
              meetingToUpdate.meetingRecord = null;
            }

            this.applyFilters();
            this.cdr.detectChanges();

            // Optionally reload from server
            this.loadMeetings();
          },
          error: (error) => {
            this.toastService.error(
              `Failed to delete meeting record: ${error.message}`,
              'Error'
            );
          },
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tutor/student-management']);
  }
}
