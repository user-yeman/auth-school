import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TableComponent } from '../../common/table/table.component';
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Chart } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';

interface StudentWithTutor {
  student_code: string;
  name: string;
  email: string;
  last_active: string;
  inactive_days: number;
  tutor_name: string;
  status?: string;
}

interface StudentWithoutTutor {
  StudentID: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-admin-report',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    SkeletonComponent,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css'],
})
export class AdminReportComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesChart') chartRef!: ElementRef<HTMLCanvasElement>;

  currentView: 'statistics' | 'exception' = 'statistics';
  isLoading: boolean = true;
  error: string | null = null;
  private chart: Chart | undefined;
  private dataLoaded: boolean = false;
  exceptionSearchTerm: string = '';

  // Chart Data
  averageInteraction: { [key: string]: number } = {};

  // Students with Tutor Table
  studentsWithTutor: StudentWithTutor[] = [];
  studentColumns = [
    { field: 'student_code', header: 'Student ID', sortable: true },
    { field: 'name', header: 'Student Name', sortable: true },
    { field: 'email', header: 'Student Email', sortable: true },
    { field: 'last_active', header: 'Last Active', sortable: true },
    { field: 'inactive_days', header: 'Inactive Days', sortable: true },
    { field: 'tutor_name', header: 'Assigned Tutor', sortable: true },
  ];
  studentFilterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];
  pageSizeWithTutor: number = 5;
  currentPageWithTutor: number = 1;
  totalPagesWithTutor: number = 1;

  // Students without Tutor Table
  studentsWithoutTutor: StudentWithoutTutor[] = [];
  studentsWithoutTutorColumns = [
    { field: 'StudentID', header: 'Student ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
  ];
  pageSizeWithoutTutor: number = 5;
  currentPageWithoutTutor: number = 1;
  totalPagesWithoutTutor: number = 1;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit(): void {
    const interval = setInterval(() => {
      if (
        this.dataLoaded &&
        this.chartRef?.nativeElement &&
        this.currentView === 'statistics'
      ) {
        this.initializeChart();
        clearInterval(interval);
      }
    }, 50);
  }

  fetchData(): void {
    this.isLoading = true;
    this.http
      .get<{
        Average_Interaction: { [key: string]: number };
        group_login_calculated: StudentWithTutor[];
        student_without_personalTutor: StudentWithoutTutor[];
      }>('http://127.0.0.1:8000/api/admin/report')
      .subscribe({
        next: (response) => {
          this.averageInteraction = response.Average_Interaction;
          this.studentsWithTutor = response.group_login_calculated.map(
            (student) => ({
              ...student,
              status: student.inactive_days <= 7 ? 'Active' : 'Inactive',
              inactive_days: Math.round(student.inactive_days),
            })
          );
          this.totalPagesWithTutor = Math.ceil(
            this.studentsWithTutor.length / this.pageSizeWithTutor
          );
          this.studentsWithoutTutor = response.student_without_personalTutor;
          this.totalPagesWithoutTutor = Math.ceil(
            this.studentsWithoutTutor.length / this.pageSizeWithoutTutor
          );
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

    if (!Object.keys(this.averageInteraction).length) {
      console.warn('No average interaction data available');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const tutors = Object.keys(this.averageInteraction).slice(0, 10);
    const data = tutors.map((tutor) => this.averageInteraction[tutor]);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tutors,
        datasets: [
          {
            label: 'Average Messages',
            data,
            backgroundColor: '#4e73df',
            borderWidth: 1,
            borderColor: '#000',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 200,
            ticks: { stepSize: 20 },
            grid: { display: true },
          },
          y: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.x} messages`,
            },
          },
          title: {
            display: true,
            text: 'Average number of messages for each personal tutor (Top 10)',
            padding: {
              top: 10,
              bottom: 30,
            },
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  switchView(view: 'statistics' | 'exception'): void {
    this.currentView = view;
    this.exceptionSearchTerm = '';
    if (view === 'statistics' && this.dataLoaded) {
      setTimeout(() => this.initializeChart(), 0);
    }
  }

  onPageChangeWithTutor(page: number): void {
    this.currentPageWithTutor = page;
  }

  onPageChangeWithoutTutor(page: number): void {
    this.currentPageWithoutTutor = page;
  }

  onExceptionSearch(): void {
    this.currentPageWithTutor = 1;
    this.currentPageWithoutTutor = 1;
    // No need for cdr.detectChanges() here; the child components will handle updates
  }
}
