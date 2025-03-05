import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reallocation-form',
  templateUrl: './reallocationform.component.html',
  styleUrls: ['./reallocationform.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatOptionModule
  ],
  providers: [DatePipe]
})
export class ReallocationFormComponent implements OnInit {
  reallocationForm: FormGroup;
  tutors: any[] = []; // Add this line to define tutors

  constructor(
    private fb: FormBuilder,
    private http: HttpClient, // Add this line to inject HttpClient
    private snackBar: MatSnackBar, // Add this line to inject MatSnackBar
    private datePipe: DatePipe, // Add this line to inject DatePipe
    public dialogRef: MatDialogRef<ReallocationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reallocationForm = this.fb.group({
      studentName: [{ value: data.studentName, disabled: true }, Validators.required],
      currentTutor: [{ value: data.currentTutor, disabled: true }, Validators.required],
      newTutor: ['', Validators.required],
      reallocationDate: ['', Validators.required],
      reason: [''] // Make reason optional by removing Validators.required
    });
  }

  ngOnInit(): void {
    this.fetchTutors(); // Fetch the list of tutors when the component initializes
  }

  fetchTutors(): void {
    // Replace with your API endpoint to fetch the list of tutors
    this.http.get<any>('http://127.0.0.1:8000/api/tutors').subscribe({
      next: (response: any) => {
        // Extract the tutors array from the response object
        if (response && Array.isArray(response.tutors)) {
          this.tutors = response.tutors;
        } else {
          console.error('Expected an array of tutors, but got:', response);
        }
      },
      error: (err:any) => {
        console.error('Error fetching tutors:', err);
      }
    });
  }


  submitReallocation(): void {
    console.log(this.data);
    if (this.reallocationForm.valid) {
      const allocationId = this.data.allocationId;
      const student_id = this.data.studentId;
      const tutor_id = this.reallocationForm.value.newTutor;
      // const allocation_date = this.reallocationForm.value.reallocationDate;
      const allocation_date = this.datePipe.transform(this.reallocationForm.value.reallocationDate, 'dd/MM/yyyy'); // Format date to DD/MM/YYYY
      const reason = this.reallocationForm.value.reason;

      this.http.put(`http://127.0.0.1:8000/api/allocations/${allocationId}`, { student_id , tutor_id, reason, allocation_date }).subscribe({
                 next: (response: any) => {
            console.log('Reallocation successful:', response);
            const config = new MatSnackBarConfig();
            config.duration = 3000;
            config.panelClass = ['snackbar-success'];
            config.verticalPosition = 'top'; // Set the vertical position to top
            this.snackBar.open('Reallocate Successfully', 'Close', config);
            this.dialogRef.close({ success: true });
          },
          error: (err: any) => {
            console.error('Error reallocating:', err);
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
