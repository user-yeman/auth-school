import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Meeting, Student } from '../../../../../model/tutor-meeting-model';
import { MeetingService } from '../../../../../services/API/tutor/meetings/meeting.service';

export interface ScheduleDialogData {
  mode: 'add' | 'update';
  meeting?: Meeting;
  studentId?: number;
}

@Component({
  selector: 'app-meeting',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
})
export class MeetingComponent implements OnInit {
  scheduleForm: FormGroup;
  meetingTypes = ['Physical', 'Online'];
  meetingApps = ['Microsoft Teams', 'Zoom', 'Google Meet'];
  mode: 'add' | 'update';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MeetingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData,
    private meetingService: MeetingService
  ) {
    this.mode = data.mode;
    this.scheduleForm = this.fb.group({
      meetingName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      meetingType: ['', Validators.required],
      location: [''],
      meetingApp: [''],
      meetingLink: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'update' && this.data.meeting) {
      // Pre-populate the form with existing meeting data
      const meeting = this.data.meeting;
      const dateTime = new Date(meeting.date); // Assuming date includes time
      this.scheduleForm.patchValue({
        meetingName: meeting.title,
        date: dateTime,
        time: dateTime.toTimeString().slice(0, 5), // Extract HH:MM
        meetingType: meeting.meeting_type === 'offline' ? 'Physical' : 'Online',
        location: meeting.location || '',
        meetingLink: meeting.meeting_link || '',
        meetingApp: meeting.meeting_app || '',
        description: meeting.description || '',
      });
    }

    // Conditional validation for location and meeting link based on meeting type
    this.scheduleForm.get('meetingType')?.valueChanges.subscribe((type) => {
      const locationControl = this.scheduleForm.get('location');
      const meetingLinkControl = this.scheduleForm.get('meetingLink');
      const meetingAppControl = this.scheduleForm.get('meetingApp');

      if (type === 'Physical') {
        locationControl?.setValidators(Validators.required);
        meetingLinkControl?.clearValidators();
        meetingAppControl?.clearValidators();
      } else {
        locationControl?.clearValidators();
        meetingLinkControl?.setValidators(Validators.required);
        meetingAppControl?.setValidators(Validators.required);
      }

      locationControl?.updateValueAndValidity();
      meetingLinkControl?.updateValueAndValidity();
      meetingAppControl?.updateValueAndValidity();
    });
  }

  onConfirm(): void {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      const meetingData = {
        ...(this.mode === 'update' && this.data.meeting
          ? { id: this.data.meeting.id }
          : {}), // Include ID for update
        student_id: this.data.studentId,
        arrange_date: this.formatDate(formValue.date, formValue.time),
        meeting_type:
          formValue.meetingType === 'Physical' ? 'offline' : 'online',

        location:
          formValue.meetingType === 'Offline' ? formValue.location : null,
        meeting_link:
          formValue.meetingType === 'Online' ? formValue.meetingLink : null,
        meeting_app:
          formValue.meetingType === 'Online' ? formValue.meetingApp : null,
        topic: formValue.meetingName,
        description: formValue.description || '',
      };
      this.dialogRef.close(meetingData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date, time: string): string {
    const d = new Date(date);
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours), parseInt(minutes));
    return d.toISOString().split('.')[0]; // Returns "YYYY-MM-DDTHH:mm:ss"
  }
}
