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
import { TableComponent } from '../../common/table/table.component';

interface Student {
  student_id: string;
  name: string;
  email: string;
  last_active: string;
  inactive_days: number;
  status?: string; // Added for filtering
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SkeletonComponent,
    TableComponent,
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesChart') chartRef!: ElementRef<HTMLCanvasElement>;
  students: Student[] = [];
  studentColumns = [
    { field: 'student_id', header: 'Student ID', sortable: true },
    { field: 'name', header: 'Student Name', sortable: true },
    { field: 'email', header: 'Student Email', sortable: true },
    { field: 'last_active', header: 'Last Active', sortable: true },
    { field: 'inactive_days', header: 'Inactive Days', sortable: true },
  ];
  studentFilterOptions = [
    { label: 'All', value: 'All' },
    { label: '>7 days', value: '7' },
    { label: '>14 days', value: '14' },
    { label: '>28 days', value: '28' },
    { label: '>60 days', value: '60' },
  ];
  isLoading: boolean = true;
  messagesLast7Days: { [key: string]: number } = {};
  error: string | null = null;
  private chart: Chart | undefined;
  private dataLoaded: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit(): void {
    const interval = setInterval(() => {
      if (this.dataLoaded && this.chartRef?.nativeElement) {
        this.initializeChart();
        clearInterval(interval);
      }
    }, 50);
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
          // Add status field based on inactive_days for filtering
          this.students = response.data.inactive_students.map((student) => ({
            ...student,
            status: student.inactive_days <= 7 ? 'Active' : 'Inactive',
          }));
          this.messagesLast7Days = response.data.messages_last_7_days;
          this.currentPage = response.meta.current_page;
          this.pageSize = response.meta.per_page;
          this.totalPages = response.meta.last_page;
          this.isLoading = false;
          this.dataLoaded = true;
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.error = 'Failed to load data. Please try again later.';
          this.isLoading = false;
          this.dataLoaded = true;
        },
      });
  }

  initializeChart(): void {
    const canvas = this.chartRef?.nativeElement;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    if (!Object.keys(this.messagesLast7Days).length) {
      console.warn('No messages data available');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
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
  }

  onPageChange(page: number): void {
    this.fetchData(page);
  }
}
