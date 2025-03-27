import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define the Tutor interface
export interface Tutor {
  tutorId: string | number;
  name: string;
  email: string;
  assignments: string | number;
}

@Component({
  selector: 'app-tutor-list-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutor-list-table.component.html',
  styleUrls: ['./tutor-list-table.component.css'],
})
export class TutorListTableComponent implements OnInit {
  @Input() tutors: Tutor[] = [];
  displayedColumns: string[] = ['tutorId', 'name', 'email', 'assignments'];
  currentPage = 1;
  totalPages = 5;
  pageSize = 5;
  sortedData: Tutor[] = [];
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  ngOnInit() {
    this.updateTableData();
  }

  ngOnChanges() {
    this.updateTableData();
  }

  updateTableData() {
    if (this.tutors && this.tutors.length > 0) {
      this.sortedData = [...this.tutors];
      this.totalPages = Math.ceil(this.tutors.length / this.pageSize);
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortedData.sort((a, b) => {
      const valueA = a[column as keyof Tutor];
      const valueB = b[column as keyof Tutor];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc'
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }
    });
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPaginatedData(): Tutor[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.sortedData.slice(startIndex, endIndex);
  }

  getNextPage(): number | null {
    return this.currentPage < this.totalPages ? this.currentPage + 1 : null;
  }
}
