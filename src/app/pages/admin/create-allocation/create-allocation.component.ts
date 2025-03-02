import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AllocationModelComponent } from './allocation-model/allocation-model.component';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { MatSortModule, MatSort } from '@angular/material/sort';
export interface Student {
  id: number;
  StudentID: string;
  name: string;
  email: string;
  selected?: boolean; // For checkbox selection
}

@Component({
  selector: 'app-create-allocation',
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
  templateUrl: './create-allocation.component.html',
  styleUrls: ['./create-allocation.component.css'],
})
export class CreateAllocationComponent implements OnInit {
  displayedColumns: string[] = ['StudentID', 'name', 'email', 'select'];
  dataSource = new MatTableDataSource<Student>();
  selectedStudents$ = new BehaviorSubject<Student[]>([]); //table data
  allData: Student[] = []; // Store all fetched data
  @ViewChild(MatSort) sort!: MatSort;

  // Pagination
  totalItems = 0;
  pageSize = 5; // Number of students per page
  currentPage = 1;
  totalPages = 1;

  // Sorting
  sortActive = ''; // Active column for sorting
  sortDirection = ''; // Sort direction ('asc' or 'desc')

  // Filtering
  filterValue = ''; // Search input value

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchStudents();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort; // Bind MatSort to the dataSource
  }
  // Fetch students from the API
  fetchStudents() {
    const url = 'http://127.0.0.1:8000/api/students/unallocationlists';
    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.allData = response.data.map((student: Student) => ({
          ...student,
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
        console.error('Error fetching students:', err);
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
  //All selected
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
    const dialogRef = this.dialog.open(AllocationModelComponent, {
      width: '800px',
      data: { selectedStudents$: this.selectedStudents$ },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.fetchStudents();
        this.clearSelection();
      }
    });
  }
}
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
