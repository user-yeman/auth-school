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
import { HttpClient } from '@angular/common/http';
import { CreateAllocationComponent } from '../create-allocation.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './allocation-model.component.html',
  styleUrls: ['./allocation-model.component.css'],
})
export class AllocationModelComponent implements OnInit {
  allocationForm!: FormGroup;
  tutors: Tutor[] = [];

  constructor(
    public dialogRef: MatDialogRef<AllocationModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedStudents: any[] },
    private fb: FormBuilder,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    // Fetch tutors from the backend
    this.http.get<Tutor[]>('/tutors').subscribe(
      (tutors) => {
        this.tutors = tutors;
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

  onSubmit() {
    if (this.allocationForm.valid) {
      const selectedTutor = this.allocationForm.value.tutor;

      // Prepare payload for allocation API
      const payload = {
        tutorId: selectedTutor.id,
        studentIds: this.data.selectedStudents.map((student) => student.id),
      };

      // Send allocation data to the backend
      this.http.post('/bulk/allocations', payload).subscribe(() => {
        console.log(
          `Allocated ${this.data.selectedStudents.length} students to ${selectedTutor.name}`
        );
        this.dialogRef.close({ success: true });
      });
    }
  }

  onCancel() {
    this.dialogRef.close({ success: false });
  }
}
