import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ReallocationFormComponent } from './reallocation/reallocationform/reallocationform.component';

export interface Student {
  id: number;
  StudentID: string;
  name: string;
  email: string;
  allocation_date: string;
  allocated_by: string;
  allocationId: number; // Allocation ID
  selected?: boolean; // For checkbox selection
  tutor_name: string;
}

export interface Allocation {
  id: number;
  allocation_date: string;
  allocated_by: string;
  staff_id: number;
  tutor_id: number;
  student_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  reason: string | null;
  staff: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
  };
  tutor: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    specialization: string;
    created_at: string;
    updated_at: string;
  };
  student: {
    id: number;
    StudentID: string;
    name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
  };
}

@Component({
  selector: 'app-allocationlist',
  standalone: true,
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
    MatSortModule,
  ],
  templateUrl: './allocationlist.component.html',
  styleUrls: ['./allocationlist.component.css'],
  providers: [DatePipe]
})
export class AllocationlistComponent implements OnInit {
  displayedColumns: string[] = ['StudentID', 'name', 'allocation_date', 'allocated_by', 'tutor_name', 'reallocation'];
  dataSource = new MatTableDataSource<Student>();
  selectedStudents$ = new BehaviorSubject<Student[]>([]); // Table data
  allData: Student[] = []; // Store all fetched data
  @ViewChild(MatSort) sort!: MatSort;
  title = 'Allocation List';

  // Pagination
  totalItems = 0;
  pageSize = 10; // Number of students per page
  currentPage = 1;
  totalPages = 1;

  // Sorting
  sortActive = ''; // Active column for sorting
  sortDirection = ''; // Sort direction ('asc' or 'desc')

  // Filtering
  filterValue = ''; // Search input value

  constructor(private http: HttpClient, private dialog: MatDialog, private router: Router, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.fetchAllocations();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort; // Bind MatSort to the dataSource
  }

  // Fetch allocations from the API
  fetchAllocations() {
    const url = 'http://127.0.0.1:8000/api/allocations';
    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.allData = response.data.map((allocation: Allocation) => ({
          id: allocation.student.id,
          allocationId: allocation.id, // Add allocation ID
          StudentID: allocation.student.StudentID,
          name: allocation.student.name,
          email: allocation.student.email,
          allocation_date: this.datePipe.transform(new Date(allocation.allocation_date), 'EEE MMM dd yyyy'), // Format date to Wed Sep 03 2025
          allocated_by: allocation.allocated_by,
          tutor_name: allocation.tutor.name,
          selected: false, // Initialize as unselected
        }));

        // Restore the selected property based on the global list
        const selectedStudents = this.selectedStudents$.getValue();
        this.allData.forEach((student) => {
          student.selected = !!selectedStudents.find(
            (s) => s.id === student.id
          );
        });

        this.totalItems = this.allData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        // Apply initial filtering, sorting, and pagination
        this.applyFilterAndSort();
      },
      error: (err) => {
        console.error('Error fetching allocations:', err);
      },
    });
  }

  // Apply filtering, sorting, and pagination
  applyFilterAndSort() {
    let filteredData = this.allData;

    // Filter by StudentID or name
    if (this.filterValue) {
      filteredData = filteredData.filter(
        (student) =>
          student.StudentID.toLowerCase().includes(
            this.filterValue.toLowerCase()
          ) ||
          student.name.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    }

    // Sort data
    if (this.sortActive && this.sortDirection) {
      filteredData = filteredData.sort((a, b) => {
        const isAsc = this.sortDirection === 'asc';
        switch (this.sortActive) {
          case 'StudentID':
            return compare(a.StudentID, b.StudentID, isAsc);
          case 'name':
            return compare(a.name, b.name, isAsc);
          case 'allocation_date':
            return compare(a.allocation_date, b.allocation_date, isAsc);
          case 'allocated_by':
            return compare(a.allocated_by, b.allocated_by, isAsc);
          case 'tutor_name':
            return compare(a.tutor_name, b.tutor_name, isAsc);
          default:
            return 0;
        }
      });
    }

    // Paginate data
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const paginatedData = filteredData.slice(start, end);

    // Restore the selected property based on the global list
    const selectedStudents = this.selectedStudents$.getValue();
    this.dataSource.data = paginatedData.map((student) => ({
      ...student,
      selected: !!selectedStudents.find((s) => s.id === student.id),
    }));
  }

  // Handle sorting changes
  sortData(sort: any) {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction;
    this.applyFilterAndSort();
  }

  // Handle search input changes
  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.currentPage = 1; // Reset to the first page when filtering
    this.applyFilterAndSort();
  }

  // Handle pagination changes
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilterAndSort();
  }

  // Checkbox Selection
  onCheckboxChange(student: Student) {
    const isSelected = !student.selected;

    // Update the selected property of the student
    const updatedData = this.dataSource.data.map((s) =>
      s.id === student.id ? { ...s, selected: isSelected } : s
    );
    this.dataSource.data = updatedData;

    // Update the global selectedStudents$ list
    const selectedStudents = this.selectedStudents$.getValue();
    if (isSelected) {
      // Add only if the student is not already in the list
      if (!selectedStudents.some((s) => s.id === student.id)) {
        selectedStudents.push(student);
      }
    } else {
      // Remove the student from the list
      const index = selectedStudents.findIndex((s) => s.id === student.id);
      if (index !== -1) {
        selectedStudents.splice(index, 1);
      }
    }
    this.selectedStudents$.next(selectedStudents);
  }

  // Disable checkbox after 15 students are selected
  isCheckboxDisabled(student: Student): boolean {
    const selectedCount = this.selectedStudents$.getValue().length;
    return !student.selected && selectedCount >= 15;
  }

  get selectedCount(): number {
    return this.selectedStudents$.getValue().length;
  }

  clearSelection() {
    this.dataSource.data.forEach(
      (student: Student) => (student.selected = false)
    );
    this.selectedStudents$.next([]);
  }

  get pages(): number[] {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  // All selected
  get allSelected(): boolean {
    const visibleData = this.dataSource.data;
    return (
      visibleData.length > 0 && visibleData.every((student) => student.selected)
    );
  }

  toggleAllCheckboxes() {
    const visibleData = this.dataSource.data; // Currently visible students
    const selectedStudents = this.selectedStudents$.getValue(); // Currently selected students
    const isSelected = !this.allSelected; // Toggle selection state

    if (isSelected) {
      // Select all visible students, up to the 15-student limit
      let remainingSlots = 15 - selectedStudents.length;

      visibleData.forEach((student) => {
        if (remainingSlots > 0 && !student.selected) {
          student.selected = true;
          selectedStudents.push(student);
          remainingSlots--;
        }
      });
    } else {
      // Deselect all visible students
      visibleData.forEach((student) => {
        student.selected = false;

        // Remove deselected students from the global list
        const index = selectedStudents.findIndex((s) => s.id === student.id);
        if (index !== -1) {
          selectedStudents.splice(index, 1);
        }
      });
    }

    // Update the global selection state
    this.selectedStudents$.next(selectedStudents);

    // Update the data source to reflect changes in the UI
    this.dataSource.data = [...visibleData];
  }

  // Open Dialog
  openDialog() {
    const dialogRef = this.dialog.open(AllocationlistComponent, {
      width: '800px',
      data: { selectedStudents$: this.selectedStudents$ },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.fetchAllocations();
        this.clearSelection();
      }
    });
  }

  // Submit selected students for allocation
  submitAllocations() {
    const selectedStudents = this.selectedStudents$.getValue();
    const url = 'http://127.0.0.1:8000/api/allocations';

    this.http.post(url, { students: selectedStudents }).subscribe({
      next: (response) => {
        console.log('Allocations submitted successfully:', response);
        this.clearSelection();
        this.fetchAllocations(); // Refresh the student list
      },
      error: (err) => {
        console.error('Error submitting allocations:', err);
      },
    });
  }

  // Edit allocation
  editAllocation(row: Student) {
    const dialogRef = this.dialog.open(ReallocationFormComponent, {
      width: '400px',
      data: {
        allocationId: row.allocationId,
        studentId: row.id,
        studentName: row.name,
        currentTutor: row.tutor_name // pass data to the dialog
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.fetchAllocations();
      }
    });
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
