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
import { MatDatepickerModule } from '@angular/material/datepicker'; // Add this import
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Student } from '../../../../../model/tutor-meeting-model';

export interface ScheduleDialogData {
  mode: 'add' | 'update';
  meeting?: any; // Replace 'any' with a proper Meeting interface if you have one
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
    MatDatepickerModule, // Add this to the imports array
  ],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'], // Fix the property name from 'styleUrl' to 'styleUrls'
})
export class MeetingComponent implements OnInit {
  scheduleForm: FormGroup;
  meetingTypes = ['Physical', 'Virtual'];
  meetingApps = ['Microsoft Teams', 'Zoom', 'Google Meet'];
  mode: 'add' | 'update';
  students: Student[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MeetingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData
  ) {
    this.mode = data.mode;
    this.scheduleForm = this.fb.group({
      meetingName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['00:00 AM', Validators.required],
      student: ['', Validators.required],
      meetingType: ['Physical', Validators.required],
      location: [''],
      meetingApp: ['Microsoft Teams'],
      meetingLink: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'update' && this.data.meeting) {
      this.scheduleForm.patchValue(this.data.meeting);
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
      const apiPayload = {
        student_id: parseInt(formValue.student, 10),
        arrange_date: this.formatDate(formValue.date),
        meeting_type:
          formValue.meetingType === 'Physical' ? 'physical' : 'online',
        location:
          formValue.meetingType === 'Physical' ? formValue.location : '',
        meeting_link:
          formValue.meetingType === 'Virtual' ? formValue.meetingLink : '',
        meeting_app:
          formValue.meetingType === 'Virtual' ? formValue.meetingApp : '',
        topic: formValue.meetingName,
        description: formValue.description || '',
      };
      this.dialogRef.close(this.scheduleForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
