import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';
import { TutorSwitchComponent } from '../switch-tutor-dashboard/tutor-switch/tutor-switch.component';
import { StudentSwitchComponent } from '../switch-student-dashboard/student-switch/student-switch.component';
import { MatTableModule } from '@angular/material/table';

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
    SkeletonComponent,
    TutorSwitchComponent,
    StudentSwitchComponent,
    MatTableModule,
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
  students: { id: string | number; name: string; email: string }[] = [];
  dashboardData = { tutors: this.tutors };
  tutorDashboardData: any = null;
  studentDashboardData: any = null;
  isLoading: boolean = false; // Start as false
  selectedDashboard: string = 'own';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchDashboardData();
    this.fetchTutors();
    this.fetchStudents();
  }

  ngAfterViewInit(): void {
    if (this.pieChartCanvas && !this.isLoading) {
      // Observe the canvas element for size changes
      const resizeObserver = new ResizeObserver(() => {
        if (
          this.pieChartCanvas.nativeElement.offsetWidth > 0 &&
          this.pieChartCanvas.nativeElement.offsetHeight > 0
        ) {
          this.createPieChart();
          resizeObserver.disconnect(); // Stop observing after the chart is created
        }
      });

      resizeObserver.observe(this.pieChartCanvas.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  fetchDashboardData() {
    this.isLoading = true;
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

        // Ensure data is ready before creating the chart
        this.dashboardData.tutors = this.tutors;
        this.isLoading = false;

        this.cdr.detectChanges();

        // Check if the view is initialized and create the chart
        if (this.pieChartCanvas && !this.chartInstance) {
          this.createPieChart();
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.isLoading = false;
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
          id: student.id || student.student_id || '',
          name: student.name || 'Unknown',
          email: student.email || '',
        }));
      },
      error: (error) => console.error('Error fetching students:', error),
    });
  }

  fetchTutorDashboardData(tutorId: string | number) {
    console.log('tutorId', tutorId);
    this.isLoading = true;
    this.http
      .get(`http://127.0.0.1:8000/api/admin/tutor/dashboard/${tutorId}`)
      .subscribe({
        next: (response: any) => {
          this.tutorDashboardData = response;
          this.selectedDashboard = 'tutor';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching tutor dashboard data:', error);
          this.isLoading = false;
          this.selectedDashboard = 'own';
          this.tutorDashboardData = null;
          this.fetchDashboardData();
        },
      });
  }

  fetchStudentDashboardData(studentId: string | number) {
    this.isLoading = true;
    this.tutorDashboardData = null; // Clear previous data
    this.http
      .get(`http://127.0.0.1:8000/api/admin/student/dashboard/${studentId}`)
      .subscribe({
        next: (response: any) => {
          this.studentDashboardData = response.data || response;
          this.selectedDashboard = 'student';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching student dashboard data:', error);
          this.isLoading = false;
          this.selectedDashboard = 'own';
          this.studentDashboardData = null;
          this.fetchDashboardData();
        },
      });
  }
  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private createPieChart(): void {
    if (!this.pieChartCanvas || !this.pieChartCanvas.nativeElement) {
      this.chartError = 'Chart container not found';
      return;
    }
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      this.chartError = 'Unable to initialize chart context';
      return;
    }
    if (!this.pieChartLabels.length || !this.pieChartData.length) {
      this.chartError = 'No browser data available';
      return;
    }
    this.destroyChart();
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
            labels: { boxWidth: 15, padding: 15, font: { size: 14 } },
          },
        },
        cutout: '60%',
      },
    });
    this.chartError = null;
  }

  onDashboardChange() {
    // Don’t change selectedDashboard yet, just open the modal if needed
    if (this.selectedDashboard === 'tutor') {
      this.tutorDashboardData = null; // Clear previous data
      this.openModal(
        'SWITCH TUTOR DASHBOARD',
        'Search Tutor by NAME or Email',
        this.tutors
      );
    } else if (this.selectedDashboard === 'student') {
      this.studentDashboardData = null; // Clear previous data
      this.isLoading = true; // Show loading state while modal is open
      this.openModal(
        'SWITCH STUDENT DASHBOARD',
        'Search Student by NAME or Email',
        this.students
      );
    } else {
      this.tutorDashboardData = null;
      this.studentDashboardData = null;
      this.isLoading = false;
      this.fetchDashboardData();
    }
    this.cdr.detectChanges();
  }

  openModal(
    title: string,
    searchPlaceholder: string,
    list: { id?: string | number; name: string; email: string }[]
  ) {
    const dialogRef = this.dialog.open(ModelListComponent, {
      width: '500px',
      data: { title, searchPlaceholder, list },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = false; // Reset loading after modal closes
      if (result) {
        if (this.selectedDashboard === 'tutor') {
          const tutor = this.tutors.find((t) => t.email === result.email);
          if (tutor) {
            this.fetchTutorDashboardData(tutor.tutorId);
          } else {
            this.selectedDashboard = 'own';
            this.fetchDashboardData();
          }
        } else if (this.selectedDashboard === 'student') {
          const student = this.students.find((s) => s.email === result.email);
          if (student && student.id) {
            this.fetchStudentDashboardData(student.id);
          } else {
            console.error('Student ID not found for:', result);
            this.selectedDashboard = 'own';
            this.studentDashboardData = null;
            this.fetchDashboardData();
          }
        }
      } else {
        // If modal is closed without selection, revert to 'own'
        this.selectedDashboard = 'own';
        this.tutorDashboardData = null;
        this.studentDashboardData = null;
        this.fetchDashboardData();
      }
    });
  }

  selectedTutor: Tutor | null = null;

  onTutorSelected(tutor: Tutor) {
    this.selectedTutor = tutor;
    this.fetchTutorDashboardData(tutor.tutorId);
  }
}
