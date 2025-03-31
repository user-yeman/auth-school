import { Component, HostListener, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ApiDashboardResponse } from '../../../model/card-model';
import { CommonModule, DatePipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { GroupsCardComponent } from '../dashboard-cards/groups-card/groups-card.component';
import { BloggingInsightsCardComponent } from '../dashboard-cards/blogging-insights-card/blogging-insights-card.component';
import { ScheduledMeetingsCardComponent } from '../dashboard-cards/scheduled-meetings-card/scheduled-meetings-card.component';
import { TotalStudentsCardComponent } from '../dashboard-cards/total-students-card/total-students-card.component';
import { TutorDashboardService } from '../../../services/API/tutor/tutor-dashboard.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { StudentTableComponent } from './student-table/student-table.component';
import { AuthService } from '../../../services/auth.service';
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';

@Component({
  selector: 'app-tutor-dashboard',
  templateUrl: './tutor-dashboard.component.html',
  styleUrls: ['./tutor-dashboard.component.css'],
  imports: [
    MatCardModule,
    CommonModule,
    MatGridListModule,
    BloggingInsightsCardComponent,
    ScheduledMeetingsCardComponent,
    TotalStudentsCardComponent,
    NgxSpinnerModule,
    StudentTableComponent,
    SkeletonComponent,
  ],
  providers: [DatePipe],
})
export class TutorDashboardComponent implements OnInit {
  dashboardData: ApiDashboardResponse | null = null;
  apiError: string | null = null;
  groups: any;
  loading: boolean = true;
  userName: string = '';
  lastLogin: string = '';

  constructor(
    private apiService: TutorDashboardService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchUserInfo();
  }

  fetchDashboardData(forceRefresh: boolean = false) {
    this.loading = true; // Ensure loading is true at the start
    this.spinner.show();
    this.apiService.getDashboardData(forceRefresh).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false; // Set loading to false on success
        this.spinner.hide();
        console.log('Dashboard data fetched:', this.dashboardData);
      },
      error: (err) => {
        this.apiError = 'Failed to load dashboard data';
        this.loading = false; // Set loading to false on error
        this.spinner.hide();
        console.error('Error fetching dashboard data:', err);
      },
    });
  }

  fetchUserInfo(): void {
    console.log('Fetching user info...' + this.authService.getUserName());
    this.userName = this.authService.getUserName();
    this.lastLogin = this.authService.getLastLogin();
  }

  formatLastLogin(date: string): string | null {
    return this.datePipe.transform(date, 'MMM d, yyyy, h:mm a');
  }

  refreshData() {
    this.fetchDashboardData(true); // Force refresh, bypassing cache
  }
}
