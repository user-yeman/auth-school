import { Component, HostListener, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  ApiDashboardResponse,
  userInfoDashboard,
} from '../../../model/card-model';
import { CommonModule, DatePipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { GroupsCardComponent } from '../dashboard-cards/groups-card/groups-card.component';
import { BloggingInsightsCardComponent } from '../dashboard-cards/blogging-insights-card/blogging-insights-card.component';
import { ScheduledMeetingsCardComponent } from '../dashboard-cards/scheduled-meetings-card/scheduled-meetings-card.component';
import { TotalStudentsCardComponent } from '../dashboard-cards/total-students-card/total-students-card.component';
import { TutorDashboardService } from '../../../services/API/tutor/tutor-dashboard.service';
import { StudentTableComponent } from './student-table/student-table.component';
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
    StudentTableComponent,
    SkeletonComponent,
  ],
  providers: [DatePipe],
})
export class TutorDashboardComponent implements OnInit {
  dashboardData: ApiDashboardResponse | null = null;
  apiError: string | null = null;
  groups: any;
  userInfo: any;
  loading: boolean = true;
  lastLogin: any;

  constructor(
    private apiService: TutorDashboardService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.loading = true; // Ensure loading is true at the start

    this.apiService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log('date', data.data.userInfo.last_login_at);
        this.lastLogin = data.data.userInfo.last_login_at;
        this.loading = false; // Set loading to false on success

        console.log('Dashboard data fetched:', this.dashboardData);
      },
      error: (err) => {
        this.apiError = 'Failed to load dashboard data';
        this.loading = false; // Set loading to false on error

        console.error('Error fetching dashboard data:', err);
      },
    });
  }

  formatLastLogin(date: string): string | null {
    return date ? this.datePipe.transform(date, 'MMM d, yyyy, h:mm a') : null;
  }

  refreshData() {
    this.fetchDashboardData(); // Force refresh, bypassing cache
  }
}
