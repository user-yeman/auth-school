import { Student } from './../create-allocation.component';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CreateAllocationComponent } from '../create-allocation.component';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
export interface Tutor {
  id: number;
  name: string;
}

@Component({
  selector: 'app-allocation-model',
  imports: [
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatOptionModule,
  ],
  templateUrl: './allocation-model.component.html',
  styleUrls: ['./allocation-model.component.css'],
})
export class AllocationModelComponent implements OnInit {
  allocationForm!: FormGroup;
  tutors: Tutor[] = [];
  selectedStudents: Student[] = [];
  private subscription: any;

  constructor(
    public dialogRef: MatDialogRef<AllocationModelComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedStudents$: BehaviorSubject<Student[]> },
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    console.log('ToastrService:', this.toastr);
  }
  ngOnInit(): void {
    this.toastr.success('Test success message', 'Success');
    this.toastr.error('Test error message', 'Error');
    // Subscribe to the BehaviorSubject to get real-time updates
    this.subscription = this.data.selectedStudents$.subscribe((students) => {
      if (Array.isArray(students)) {
        this.selectedStudents = students; // Only assign if it's an array
      } else {
        console.error(
          'Unexpected data type received from selectedStudents$: ',
          students
        );
        this.selectedStudents = []; // Fallback to an empty array
      }
    });

    // Fetch tutors from the backend
    this.http.get<any>('http://127.0.0.1:8000/api/tutors').subscribe(
      (response) => {
        console.log('API Response:', response);

        this.tutors = Array.isArray(response.tutors) ? response.tutors : []; // Extract the tutors array
      },
      (error) => {
        console.error('Failed to fetch tutors:', error);
      }
    );

    // Initialize the form
    this.allocationForm = this.fb.group({
      tutor: [null, Validators.required],
    });
  }
  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.subscription.unsubscribe();
  }

  onSubmit() {
    if (this.allocationForm.valid) {
      const selectedTutor = this.allocationForm.value.tutor;

      // Prepare payload for allocation API
      const payload = {
        student_ids: this.selectedStudents.map((student) => Number(student.id)),
        tutor_id: Number(selectedTutor.id),
        allocation_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      };

      console.log('Payload:', payload);

      // Send allocation data to the backend
      this.http
        .post('http://127.0.0.1:8000/api/bulk/allocations', payload)
        .subscribe({
          next: (response: any) => {
            // Check if the response indicates success
            if (response.status === 'success') {
              console.log(
                `Allocated ${this.selectedStudents.length} students to ${selectedTutor.name}`
              );
              this.toastr.success(
                `Allocated ${this.selectedStudents.length} students to ${selectedTutor.name}. Email sent successfully.`,
                'Success'
              );
              this.dialogRef.close({ success: true });
            } else {
              // Handle cases where the backend returns a failed status
              console.error('Backend returned failure:', response.message);
              this.toastr.error(response.message, 'Error');
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error allocating students:', err);

            // Display validation errors if available
            if (
              err.error &&
              typeof err.error === 'object' &&
              err.error.message
            ) {
              this.toastr.error(err.error.message, 'Error');
            } else {
              // Fallback to a generic error message
              this.toastr.error(
                `Failed to allocate students: ${err.message}`,
                'Error'
              );
            }
          },
        });
    }
  }

  onCancel() {
    this.dialogRef.close({ success: false });
  }
}
