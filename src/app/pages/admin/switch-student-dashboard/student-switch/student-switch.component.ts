import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

interface Document {
  file_name: string;
  status: string;
  created_at: string;
}

interface Meeting {
  topic: string;
  date: string;
  time: string;
  location: string;
}

interface ApiResponse {
  status: number;
  data: {
    user: {
      name: string;
      email: string;
      last_login_at: string;
    };
    tutor: {
      name: string;
      email: string;
    };
    vlogs: {
      student: number;
      tutor: number;
      totalBlog: number;
    };
    meetings: {
      count_online: number;
      count_campus: number;
      totalMeeting: number;
    };
    documentsTotal: {
      total: number;
      status: {
        finished: number;
        watched: number;
        accepted: number;
        canceled: number;
      };
    };
    documents: Document[];
    upcoming_meetings: any[];
  };
}

@Component({
  selector: 'app-student-switch',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './student-switch.component.html',
  styleUrls: ['./student-switch.component.css'],
})
export class StudentSwitchComponent {
  @Input() dashboardData: any;

  user = {
    name: '',
    email: '',
    lastLogin: '',
  };

  tutor = {
    name: '',
    email: '',
  };

  vlogs = {
    student: 0,
    tutor: 0,
    totalBlog: 0,
  };

  meetings = {
    count_online: 0,
    count_campus: 0,
    totalMeeting: 0,
  };

  documentsTotal = {
    total: 0,
    status: {
      finished: 0,
      watched: 0,
      accepted: 0,
      canceled: 0,
    },
  };

  upcomingMeetings: Meeting[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    if (this.dashboardData) {
      const data = this.dashboardData.data || this.dashboardData;
      if (data.tutor) {
        this.tutor.name = data.tutor.name || '';
        this.tutor.email = data.tutor.email || '';
      }
      this.user = {
        name: data.user?.name || '',
        email: data.user?.email || '',
        lastLogin: data.user?.last_login_at || '',
      };
      this.vlogs = data.vlogs || this.vlogs;
      this.meetings = data.meetings || this.meetings;
      this.documentsTotal = data.documentsTotal || this.documentsTotal;

      // Populate upcoming meetings
      this.upcomingMeetings = [
        {
          topic: 'EWSD Coursework Discussion',
          date: 'Tue March 18, 2025',
          time: '10:00',
          location: 'online',
        },
        {
          topic: 'RM Coursework Discussion',
          date: 'Tue March 18, 2025',
          time: '1:00',
          location: 'campus',
        },
        {
          topic: 'Mobile Coursework Discussion',
          date: 'Fri March 21, 2025',
          time: '1:00',
          location: 'online',
        },
      ];
    }
  }
}
