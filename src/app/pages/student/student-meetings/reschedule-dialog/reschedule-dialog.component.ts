import { Component, Inject } from '@angular/core';
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
    <h2 mat-dialog-title>RESCHEDULE REQUEST FORM</h2>
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

        <!-- New Date row -->
        <div class="form-group horizontal">
          <label>Request Date</label>
          <input type="date" formControlName="newDate" />
        </div>

        <!-- New Time row -->
        <div class="form-group horizontal">
          <label>Request Time</label>
          <div class="time-picker-container">
            <input type="time" formControlName="newTime" class="time-picker" />
          </div>
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
export class RescheduleDialogComponent {
  form: FormGroup;
  availableLocations: string[];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RescheduleDialogComponent>
  ) {
    this.form = data.form;
    this.availableLocations = data.availableLocations;
  }

  onMeetingTypeChange() {
    // Implement the same logic you had in your parent component
    const meetingType = this.form.get('meetingType')?.value;
    // Update available locations based on meeting type
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