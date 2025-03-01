import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AllocationModelComponent } from './allocation-model/allocation-model.component';
import { FormsModule } from '@angular/forms';

export interface Student {
  id: number;
  StudentID: string;
  name: string;
  email: string;
  selected?: boolean; // For checkbox selection
}

@Component({
  selector: 'app-create-allocation',
  imports: [
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './create-allocation.component.html',
  styleUrls: ['./create-allocation.component.css'],
})
export class CreateAllocationComponent implements OnInit {
  displayedColumns: string[] = ['select', 'StudentID', 'name', 'email'];
  dataSource = new MatTableDataSource<Student>();
  selectedStudents: Student[] = [];

  // pagination
  totalItems = 0;
  pageSize = 18; // Number of students per page
  currentPage = 1;
  totalPages = 1;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  // Fetch students from the API
 fetchStudents() {
  const url = `http://127.0.0.1:8000/api/students/unallocationlists?page=${this.currentPage}`;
  this.http.get<any>(url).subscribe({
    next: (response) => {
      this.dataSource.data = response.data.map((student: Student) => ({
        ...student,
        selected: false,
      }));
      this.totalItems = response.total;
      this.totalPages = response.last_page; // Use last_page from the API
    },
    error: (err) => {
      console.error('Error fetching students:', err);
    },
  });
}}

  sortData(sort: any) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        default:
          return 0;
      }
    });
  }

  // Checkbox Selection
  onCheckboxChange(student: Student) {
    student.selected = !student.selected;

    if (student.selected) {
      this.selectedStudents.push(student);
    } else {
      this.selectedStudents = this.selectedStudents.filter(
        (s) => s.id !== student.id
      );
    }
  }
  // disable checkbox after 15 students selected
  isCheckboxDisabled(student: Student): boolean {
    const selectedCount = this.selectedStudents.length;
    return !student.selected && selectedCount >= 15;
  }
  get selectedCount(): number {
    return this.selectedStudents.length;
  }

  clearSelection() {
    this.dataSource.data.forEach((student) => (student.selected = false));
    this.selectedStudents = [];
  }

  // Pagination
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchStudents();
  }

  get pages(): number[] {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  // Open Dialog
  openDialog() {
    const dialogRef = this.dialog.open(AllocationModelComponent, {
      width: '600px',
      data: { selectedStudents: this.selectedStudents },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Refetch data from the backend to reflect real-time updates
        this.fetchStudents();
        this.clearSelection();
      }
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
