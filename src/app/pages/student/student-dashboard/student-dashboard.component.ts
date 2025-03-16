import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Document {
  name: string;
  status: string;
  uploadedDate: string;
  deadline: string;
}

interface ApiResponse {
  status: number;
  data: {
    user: {
      name: string;
      email: string;
      last_login_at: string;
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
  };
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatSortModule,
    HttpClientModule
  ]
})
export class StudentDashboardComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;

  user = { 
    name: '', 
    email: '', 
    lastLogin: '' 
  };
  vlogs = {
    student: 0,
    tutor: 0,
    totalBlog: 0
  };
  meetings = {
    count_online: 0,
    count_campus: 0,
    totalMeeting: 0
  };
  displayedColumns: string[] = ['name', 'status', 'uploadedDate', 'deadline'];
  documents = new MatTableDataSource<Document>([]);

  private apiUrl = 'http://127.0.0.1:8000/api/student/dashboard'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  ngAfterViewInit() {
    this.documents.sort = this.sort;
  }

  fetchDashboardData() {
    this.http.get<ApiResponse>(this.apiUrl).subscribe(response => {
      if (response.status === 200) {
        this.user.name = response.data.user.name;
        this.user.email = response.data.user.email;
        this.user.lastLogin = response.data.user.last_login_at;
        this.vlogs = response.data.vlogs;
        this.meetings = response.data.meetings;
      }
    });
  }

  applySorting(sortState: Sort) {
    if (!sortState.active || sortState.direction === '') {
      return;
    }
  
    const key = sortState.active as keyof Document;
  
    this.documents.data = [...this.documents.data].sort((a, b) => {
      let valueA: any = a[key];
      let valueB: any = b[key];
  
      if (key === 'uploadedDate' || key === 'deadline') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
  
      return (valueA < valueB ? -1 : 1) * (sortState.direction === 'asc' ? 1 : -1);
    });
  }
}