// admin-dashboard.component.ts
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
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule,
  ],
})
export class AdminDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance: Chart | null = null;
  chartError: string | null = null;

  totalTutors: number = 0;
  totalStudents: number = 0;
  unassignedStudents: number = 0;

  activeUsers: { name: string; activity: number }[] = [];
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartColors: string[] = ['#42A5F5', '#FF7043', '#FFCA28', '#B0BEC5'];

  tutors: Tutor[] = [];
  students: { name: string; email: string }[] = [];

  dashboardData = { tutors: this.tutors };
  loading = false;
  selectedDashboard: string = 'own';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchDashboardData();
    this.fetchTutors();
    this.fetchStudents();
  }

  ngAfterViewInit(): void {
    // Chart will be created after data is fetched
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  fetchDashboardData() {
    this.loading = true;
    this.http.get('http://127.0.0.1:8000/api/admin/dashboard').subscribe({
      next: (response: any) => {
        const data = response.data || {};
        this.totalTutors = data.total_tutors || 0;
        this.totalStudents = data.total_students || 0;
        this.unassignedStudents = data.total_unassigned_students || 0;

        this.activeUsers = (data.active_users || [])
          .slice(0, 5)
          .map((user: any) => ({
            name: user.name || 'Unknown',
            activity: Math.min(100, Math.max(0, user.count || 0)),
          }));

        this.pieChartLabels = (data.browsers || []).map(
          (b: any) => b.browser || 'Unknown'
        );
        this.pieChartData = (data.browsers || []).map((b: any) => b.count || 0);

        this.tutors = (data.avaliable_teacher || []).map((tutor: any) => ({
          tutorId: tutor.id || '',
          name: tutor.name || 'Unknown',
          email: tutor.email || '',
          assignments: tutor.allocations_count || 0,
        }));

        this.dashboardData.tutors = this.tutors;
        this.loading = false;

        if (this.pieChartCanvas) {
          this.createPieChart();
        } else {
          console.warn('Canvas not available yet, retrying...');
          setTimeout(() => this.createPieChart(), 100);
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.loading = false;
        this.chartError = 'Failed to load dashboard data';
      },
    });
  }

  fetchTutors() {
    this.http.get('http://127.0.0.1:8000/api/tutors').subscribe({
      next: (response: any) => {
        this.tutors = (response.tutors || []).map((tutor: any) => ({
          tutorId: tutor.id || '',
          name: tutor.name || 'Unknown',
          email: tutor.email || '',
          assignments: 0,
        }));
        this.dashboardData.tutors = this.tutors;
      },
      error: (error) => console.error('Error fetching tutors:', error),
    });
  }

  fetchStudents() {
    this.http.get('http://127.0.0.1:8000/api/students').subscribe({
      next: (response: any) => {
        this.students = (response.data || []).map((student: any) => ({
          name: student.name || 'Unknown',
          email: student.email || '',
        }));
      },
      error: (error) => console.error('Error fetching students:', error),
    });
  }

  private createPieChart(): void {
    if (!this.pieChartCanvas || !this.pieChartCanvas.nativeElement) {
      this.chartError = 'Chart container not found';
      console.error('Canvas element not available');
      return;
    }

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      this.chartError = 'Unable to initialize chart context';
      console.error('Failed to get 2D context for canvas');
      return;
    }

    if (!this.pieChartLabels.length || !this.pieChartData.length) {
      this.chartError = 'No browser data available';
      console.warn('No data available for pie chart');
      return;
    }

    this.destroyChart();

    try {
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
                font: { size: 14 },
              },
            },
          },
          cutout: '60%',
        },
      });
      this.chartError = null;
    } catch (error) {
      this.chartError = 'Error creating chart';
      console.error('Error creating pie chart:', error);
    }
  }

  private updateChart(): void {
    if (this.chartInstance) {
      this.chartInstance.data.labels = this.pieChartLabels;
      this.chartInstance.data.datasets[0].data = this.pieChartData;
      this.chartInstance.update();
      this.chartError = null;
    } else {
      this.createPieChart();
    }
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  onDashboardChange() {
    if (this.selectedDashboard === 'tutor') {
      this.openModal(
        'SWITCH TUTOR DASHBOARD',
        'Search Tutor by NAME or Email',
        this.tutors
      );
    } else if (this.selectedDashboard === 'student') {
      this.openModal(
        'SWITCH STUDENT DASHBOARD',
        'Search Student by NAME or Email',
        this.students
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
