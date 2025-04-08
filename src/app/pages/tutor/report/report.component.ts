import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';

interface Student {
  student_id: string;
  name: string;
  email: string;
  last_active: string;
  inactive_days: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SkeletonComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesChart') chartRef!: ElementRef<HTMLCanvasElement>;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  filterStatus: 'All' | 'Active' | 'Inactive' = 'All';
  sortColumn: keyof Student = 'student_id';
  sortDirection: 'asc' | 'desc' = 'asc';
  showFilterPanel: boolean = false;
  searchTerm: string = '';
  isLoading: boolean = true;
  messagesLast7Days: { [key: string]: number } = {};
  error: string | null = null;
  private chart: Chart | undefined;
  private dataLoaded: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(page: number = this.currentPage): void {
    this.isLoading = true;
    this.http
      .get<{
        data: {
          inactive_students: Student[];
          messages_last_7_days: { [key: string]: number };
        };
        meta: {
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
        };
      }>(`http://127.0.0.1:8000/api/tutor/report?page=${page}`)
      .subscribe({
        next: (response) => {
          this.students = response.data.inactive_students;
          this.messagesLast7Days = response.data.messages_last_7_days;
          this.filteredStudents = [...this.students];
          this.applyFiltersAndSorting();

          this.currentPage = response.meta.current_page;
          this.pageSize = response.meta.per_page;
          this.totalPages = response.meta.last_page;

          this.isLoading = false;
          this.dataLoaded = true;

          if (this.chartRef?.nativeElement) {
            this.initializeChart();
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.error = 'Failed to load data. Please try again later.';
          this.isLoading = false;
          this.dataLoaded = true;
        },
      });
  }
  ngAfterViewInit(): void {
    console.log(
      'ngAfterViewInit called, canvas:',
      this.chartRef?.nativeElement
    );

    const interval = setInterval(() => {
      if (this.dataLoaded && this.chartRef?.nativeElement) {
        console.log('Calling initializeChart from ngAfterViewInit');
        this.initializeChart();
        clearInterval(interval); // Stop the interval once the chart is initialized
      } else {
        console.warn(
          'Data not loaded yet or canvas unavailable in ngAfterViewInit'
        );
      }
    }, 50); // Retry every 50ms
  }

  initializeChart(): void {
    console.log('Attempting to initialize chart'); // Confirm method is called
    const canvas = this.chartRef?.nativeElement;
    console.log('Canvas element:', canvas); // Check if canvas exists
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    console.log('Canvas context:', ctx); // Check if context is available
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    console.log('Messages last 7 days:', this.messagesLast7Days); // Check data
    if (!Object.keys(this.messagesLast7Days).length) {
      console.warn('No messages data available');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
      console.log('Destroyed existing chart');
    }

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const data = days.map((day) => this.messagesLast7Days[day] || 0);
    console.log('Chart data:', data); // This should now appear

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Messages',
            data,
            backgroundColor: [
              '#4e73df',
              '#1cc88a',
              '#f6c23e',
              '#e74a3b',
              '#fd7e14',
              '#e83e8c',
              '#6610f2',
            ],
            borderWidth: 1,
            borderColor: '#000',
            minBarLength: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 30,
            ticks: { stepSize: 5 },
            grid: { display: true },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} messages`,
            },
          },
        },
      },
    });
    console.log('Chart initialized successfully');
  }

  applyFiltersAndSorting(): void {
    let tempStudents = [...this.students];
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      tempStudents = tempStudents.filter(
        (student) =>
          student.student_id.toLowerCase().includes(searchLower) ||
          student.name.toLowerCase().includes(searchLower)
      );
    }
    if (this.filterStatus !== 'All') {
      tempStudents = tempStudents.filter(
        (student) =>
          (this.filterStatus === 'Active' && student.inactive_days <= 7) ||
          (this.filterStatus === 'Inactive' && student.inactive_days > 7)
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
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchData(1);
  }

  onFilterChange(status: 'All' | 'Active' | 'Inactive'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.fetchData(1);
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
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
      this.fetchData(page);
    }
  }

  get paginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(startIndex, startIndex + this.pageSize);
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
