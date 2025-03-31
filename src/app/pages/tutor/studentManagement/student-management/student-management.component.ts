import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Student } from '../../../../model/tutor-meeting-model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SkeletonComponent } from '../../../../common/loading/skeleton/skeleton/skeleton.component';

@Component({
  selector: 'app-student-management',
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    RouterModule,
    SkeletonComponent,
  ],
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.css'],
})
export class StudentManagementComponent implements OnInit {
  isLoading: boolean = false;
  title = 'Student Management';
  searchValue: string = '';
  students: Student[] = [];
  apiUrl = 'http://127.0.0.1:8000/api/allocations/student';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private toastService: ToastrService
  ) {}
  filteredStudents: Student[] = [...this.students];
  ngOnInit() {
    this.fetchStudents();
  }
  fetchStudents() {
    this.isLoading = true;
    this.http
      .get<{ status: string; data: Student[]; message: string }>(this.apiUrl)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.students = response.data;
            console.log('Response' + response.data);
            this.filteredStudents = [...this.students];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.isLoading = false;
        },
      });
  }
  searchStudent() {
    const query = this.searchValue.trim().toLowerCase();
    this.filteredStudents = this.students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    );
  }
  navigateToMeetings(id: number) {
    this.router
      .navigate(['/tutor/meetings', id])
      .then((success) => {
        if (!success) {
          this.toastService.warning('Navigation was blocked or cancelled');
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
        this.toastService.error('Failed to navigate to meetings');
      });
  }
}
