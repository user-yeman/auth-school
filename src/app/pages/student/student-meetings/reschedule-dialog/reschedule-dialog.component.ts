import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reschedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">RESCHEDULE REQUEST FORM</h2>
    </div>
    <mat-dialog-content>
      <form [formGroup]="form">
        <!-- Topic row -->
        <div class="form-group horizontal">
          <label>Topic</label>
          <input type="text" formControlName="topic" placeholder="e.g., EWSD Coursework Discussion" readonly />
        </div>

        <!-- Original Date & Time row -->
        <div class="form-group horizontal">
          <label>Date & Time</label>
          <input type="text" formControlName="originalDateTime" readonly />
        </div>
        
        <!-- Meeting Type row -->
        <div class="form-group horizontal">
          <label>Meeting Type</label>
          <select formControlName="meetingType" (change)="onMeetingTypeChange()">
            <option value="Online">Online</option>
            <option value="Campus">Campus</option>
          </select>
        </div>

        <!-- Location row -->
        <div class="form-group horizontal">
          <label>Where</label>
          <select formControlName="location">
            <option *ngFor="let location of availableLocations" [value]="location">{{ location }}</option>
          </select>
        </div>

        <!-- New Date row - using a formatted string instead of Date object -->
        <div class="form-group horizontal">
          <label>Request Date</label>
          <input type="date" formControlName="newDate" />
        </div>

        <!-- New Time row - using select for better format control -->
        <div class="form-group horizontal">
          <label>Request Time</label>
          <select formControlName="newTime" class="time-select">
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">01:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="17:00">05:00 PM</option>
            <option value="18:00">06:00 PM</option>
            <option value="19:00">07:00 PM</option>
            <option value="20:00">08:00 PM</option>
            <option value="21:00">09:00 PM</option>
            <option value="22:00">10:00 PM</option>
            <option value="23:00">11:00 PM</option>
          </select>
        </div>

        <!-- Reason row -->
        <div class="form-group horizontal reason-group">
          <label>Reason</label>
          <textarea formControlName="reason" rows="3" placeholder="Enter your reason..."></textarea>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="form.invalid">Confirm</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./reschedule-dialog.component.css']
})
export class RescheduleDialogComponent implements OnInit {
  form: FormGroup;
  availableLocations: string[] = [];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RescheduleDialogComponent>
  ) {
    this.form = data.form;
    this.availableLocations = data.availableLocations || [];
  }
  
  ngOnInit() {
    // Format date properly for the date input (YYYY-MM-DD)
    const dateControl = this.form.get('newDate');
    if (dateControl && dateControl.value) {
      if (dateControl.value instanceof Date) {
        const formattedDate = this.formatDateToYYYYMMDD(dateControl.value);
        dateControl.setValue(formattedDate);
      }
    }
    
    // Format time properly for the time selection
    const timeControl = this.form.get('newTime');
    if (timeControl && timeControl.value) {
      // Convert 12-hour time (like "11:30 PM") to 24-hour time (like "23:30")
      const formattedTime = this.convert12HourTo24Hour(timeControl.value);
      timeControl.setValue(formattedTime);
    }
    
    // Initialize locations based on initial meeting type
    this.onMeetingTypeChange();
  }
  
  // Format date as YYYY-MM-DD string
  formatDateToYYYYMMDD(date: Date): string {
    try {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      
      // Fallback to today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  // Convert 12-hour format to 24-hour format
  convert12HourTo24Hour(timeString: string): string {
    try {
      // Already in 24-hour format
      if (timeString.match(/^\d{2}:\d{2}$/) && !timeString.includes(' ')) {
        return timeString;
      }
      
      // Parse 12-hour format (e.g. "11:30 PM")
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Format as 24-hour (e.g. "23:30")
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('Error converting time:', e);
      return timeString;
    }
  }

  onMeetingTypeChange() {
    const meetingType = this.form.get('meetingType')?.value;
    
    // Update available locations based on meeting type
    if (meetingType === 'Online') {
      this.availableLocations = ['Zoom', 'Microsoft Teams', 'Google Meet', 'Skype'];
    } else if (meetingType === 'Campus') {
      this.availableLocations = ['Room 101', 'Room 102', 'Conference Hall', 'Library'];
    }
    
    // Reset the current location selection when type changes
    this.form.get('location')?.setValue('');
  }

  onConfirm() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}