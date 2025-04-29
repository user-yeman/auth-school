import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
}

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    SkeletonComponent,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges {
  @Input() title: string = 'Table';
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() showSearch: boolean = true;
  @Input() showFilter: boolean = true;
  @Input() filterOptions: FilterOption[] = [];
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;
  @Input() useExternalSearch: boolean = false;
  @Input() externalSearchTerm: string = '';
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  filteredData: any[] = [];
  paginatedData: any[] = [];
  searchTerm: string = '';
  filterStatus: string = 'All';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  showFilterPanel: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['currentPage'] ||
      changes['pageSize'] ||
      changes['totalPages'] ||
      changes['externalSearchTerm']
    ) {
      this.filteredData = [...this.data];
      this.applyFiltersAndSorting();
    }
  }

  applyFiltersAndSorting(): void {
    let tempData = [...this.data];

    const activeSearchTerm = this.useExternalSearch
      ? this.externalSearchTerm
      : this.searchTerm;

    // Allow search to execute if either showSearch is true (for internal search) or useExternalSearch is true (for external search)
    if (activeSearchTerm && (this.showSearch || this.useExternalSearch)) {
      const searchLower = activeSearchTerm.toLowerCase().trim();
      tempData = tempData.filter((item) => {
        const matches = this.columns.some((column) => {
          const value = item[column.field];
          if (value === null || value === undefined) {
            return false;
          }
          const stringValue = value.toString().toLowerCase().trim();
          const match = stringValue.includes(searchLower);
          return match;
        });
        return matches;
      });
    }

    if (this.filterStatus !== 'All' && this.showFilter) {
      const inactiveDaysThreshold = parseInt(this.filterStatus, 10);
      tempData = tempData.filter(
        (item) => item.inactive_days > inactiveDaysThreshold
      );
    }

    if (this.sortColumn) {
      tempData.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];
        const direction = this.sortDirection === 'asc' ? 1 : -1;
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB) * direction;
        }
        return (valueA > valueB ? 1 : -1) * direction;
      });
    }

    this.filteredData = tempData;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);

    this.updatePaginatedData();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
    this.pageChange.emit(this.currentPage);
    this.searchChange.emit(this.searchTerm);
  }

  onFilterChange(status: string): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.applyFiltersAndSorting();
    this.pageChange.emit(this.currentPage);
  }

  toggleFilterPanel(): void {
    if (!this.isLoading) {
      this.showFilterPanel = !this.showFilterPanel;
    }
  }

  sort(column: string): void {
    const col = this.columns.find((c) => c.field === column);
    if (!col?.sortable || this.isLoading) return;
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSorting();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.updatePaginatedData();
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.filteredData.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 3;
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
