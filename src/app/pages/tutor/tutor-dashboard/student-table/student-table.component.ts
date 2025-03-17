// src/app/pages/tutor/student-table/student-table.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../../../model/card-model';

@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentTableComponent implements OnInit {
  @Input() students: Student[] = [];

  filteredStudents: Student[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  filterStatus: 'All' | 'Active' | 'Inactive' = 'All';
  sortColumn: keyof Student = 'StudentID';
  sortDirection: 'asc' | 'desc' = 'asc';
  showFilterPanel: boolean = false;

  ngOnInit(): void {
    this.applyFiltersAndSorting();
  }

  applyFiltersAndSorting(): void {
    let tempStudents = [...this.students];

    if (this.filterStatus !== 'All') {
      tempStudents = tempStudents.filter(
        (student) => student.status === this.filterStatus
      );
    }

    tempStudents.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];
      const direction = this.sortDirection === 'asc' ? 1 : -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * direction;
      }
      return (valueA > valueB ? 1 : -1) * direction;
    });

    this.filteredStudents = tempStudents;
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  onFilterChange(status: 'All' | 'Active' | 'Inactive'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
    console.log('Filter panel toggled:', this.showFilterPanel);
  }

  sort(column: keyof Student): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSorting();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(startIndex, startIndex + this.pageSize);
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 3; // Show up to 3 pages around the current page

    let startPage = Math.max(1, this.currentPage - 1);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (this.currentPage <= 3) {
      startPage = 1;
      endPage = Math.min(3, this.totalPages);
    } else if (this.currentPage >= this.totalPages - 2) {
      startPage = Math.max(1, this.totalPages - 2);
      endPage = this.totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
