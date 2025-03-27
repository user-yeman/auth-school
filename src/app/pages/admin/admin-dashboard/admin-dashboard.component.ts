import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { TutorListTableComponent } from '../admin-dashbaord/tutor-list-table/tutor-list-table.component';
import { ModelListComponent } from '../../common/dashboardModelList/model-list/model-list.component';

// Define the Tutor interface
export interface Tutor {
  tutorId: string | number;
  name: string;
  email: string;
  assignments: string | number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatButtonModule,
    CommonModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    TutorListTableComponent,
  ],
})
export class AdminDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance: Chart | null = null;

  // Card Data
  totalTutors = 50;
  totalStudents = 500;
  unassignedStudents = 150;

  // Bar Chart Data (Most Active Users)
  activeUsers = [
    { name: 'Jame', activity: 96 },
    { name: 'William', activity: 93 },
    { name: 'Jordan', activity: 90 },
    { name: 'Amma', activity: 87 },
    { name: 'John', activity: 86 },
  ];

  // Pie Chart Data (Most Used Browsers)
  pieChartLabels: string[] = ['Safari', 'Firefox', 'Chrome', 'Others'];
  pieChartData: number[] = [20, 25, 40, 15];
  pieChartColors: string[] = ['#42A5F5', '#FF7043', '#FFCA28', '#B0BEC5'];

  // Table Data
  tutors: Tutor[] = [
    {
      tutorId: 'TU001',
      name: 'John',
      email: 'john1@email.com',
      assignments: '7/20',
    },
    {
      tutorId: 'TU031',
      name: 'Wood',
      email: 'wood2@email.com',
      assignments: '13/20',
    },
    {
      tutorId: 'TU008',
      name: 'Ray',
      email: 'ray2@email.com',
      assignments: '18/20',
    },
    {
      tutorId: 'TU022',
      name: 'Jame',
      email: 'jame3@email.com',
      assignments: '10/20',
    },
    {
      tutorId: 'TU015',
      name: 'William',
      email: 'william3@email.com',
      assignments: '3/20',
    },
    {
      tutorId: 'TU005',
      name: 'Jordan',
      email: 'jordan1@email.com',
      assignments: '5/20',
    },
    {
      tutorId: 'TU003',
      name: 'Amma',
      email: 'amma1@email.com',
      assignments: '11/20',
    },
  ];

  // Dashboard Data
  dashboardData = { tutors: this.tutors };
  loading = false;

  selectedDashboard: string = 'own';

  tutorList = [
    { name: 'John', email: 'john#@email.com' },
    { name: 'Jack', email: 'jack3@email.com' },
    { name: 'William', email: 'william3@email.com' },
    { name: 'Wood', email: 'wood1@email.com' },
    { name: 'Amma', email: 'amma@email.com' },
  ];

  studentList = [
    { name: 'Jane', email: 'jane1@email.com' },
    { name: 'Bob', email: 'bob2@email.com' },
    { name: 'Terry', email: 'terry2@email.com' },
    { name: 'Alex', email: 'alex2@email.com' },
    { name: 'Jordan', email: 'jordan3@email.com' },
  ];

  constructor(private dialog: MatDialog, private router: Router) {}

  ngAfterViewInit(): void {
    this.initializeChartWithRetry();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  initializeChartWithRetry(retryCount = 0, maxRetries = 5): void {
    if (!this.pieChartCanvas) {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          this.initializeChartWithRetry(retryCount + 1, maxRetries);
        }, 100);
      } else {
        console.error('Failed to initialize chart: Canvas not available');
      }
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    this.createPieChart();
  }

  createPieChart(): void {
    try {
      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context for canvas');
      }

      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.pieChartLabels,
          datasets: [
            {
              data: this.pieChartData,
              backgroundColor: this.pieChartColors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 14,
                },
              },
            },
          },
          cutout: '60%',
        },
      });
    } catch (error) {
      console.error('Error creating pie chart:', error);
    }
  }

  onDashboardChange() {
    if (this.selectedDashboard === 'tutor') {
      this.openModal(
        'SWITCH TUTOR DASHBOARD',
        'Search Tutor by NAME or Email',
        this.tutorList
      );
    } else if (this.selectedDashboard === 'student') {
      this.openModal(
        'SWITCH STUDENT DASHBOARD',
        'Search Student by NAME or Email',
        this.studentList
      );
    }
  }

  openModal(
    title: string,
    searchPlaceholder: string,
    list: { name: string; email: string }[]
  ) {
    const dialogRef = this.dialog.open(ModelListComponent, {
      width: '500px',
      data: { title, searchPlaceholder, list },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.selectedDashboard === 'tutor') {
          this.router.navigate(['/tutor', result.email]);
        } else if (this.selectedDashboard === 'student') {
          this.router.navigate(['/student', result.email]);
        }
      } else {
        this.selectedDashboard = 'own';
      }
    });
  }
}
