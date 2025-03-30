import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { BloggingInsightsCardComponent } from '../../../tutor/dashboard-cards/blogging-insights-card/blogging-insights-card.component';
import { ScheduledMeetingsCardComponent } from '../../../tutor/dashboard-cards/scheduled-meetings-card/scheduled-meetings-card.component';
import { TotalStudentsCardComponent } from '../../../tutor/dashboard-cards/total-students-card/total-students-card.component';
import { StudentTableComponent } from '../../../tutor/tutor-dashboard/student-table/student-table.component';
import { ApiDashboardResponse } from '../../../../model/card-model';
import { TutorDashboardService } from '../../../../services/API/tutor/tutor-dashboard.service';

@Component({
  selector: 'app-tutor-switch',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatGridListModule,
    BloggingInsightsCardComponent,
    ScheduledMeetingsCardComponent,
    TotalStudentsCardComponent,
    StudentTableComponent,
  ],
  templateUrl: './tutor-switch.component.html',
  styleUrls: ['./tutor-switch.component.css'],
})
export class TutorSwitchComponent implements OnInit {
  @Input() dashboardData: ApiDashboardResponse | null = null;
  apiError: string | null = null;
  loading: boolean = false; // Local loading state for refresh
  userName: string = '';
  lastLogin: string = '';

  constructor(private apiService: TutorDashboardService) {}

  ngOnInit(): void {
    this.loading = true;
    this.apiService.getDashboardData(true).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.apiError = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Error fetching dashboard data:', err);
      },
    });
  }
}
