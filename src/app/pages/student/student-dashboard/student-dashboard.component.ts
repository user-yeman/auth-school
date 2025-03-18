import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Document {
  file_name: string;
  status: string;
  created_at: string;
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
    MatPaginatorModule,
    HttpClientModule,
    FormsModule
  ]
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
  documentsTotal = {
    total: 0,
    status: {
      finished: 0,
      watched: 0,
      accepted: 0,
      canceled: 0
    }
  };
  displayedColumns: string[] = ['file_name', 'status', 'uploadedDate'];
  documents: MatTableDataSource<Document> = new MatTableDataSource();
  filterValue: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  pages: number[] = [];

  private apiUrl = 'http://127.0.0.1:8000/api/student/dashboard'; // API URL

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  ngAfterViewInit() {
    this.documents.sort = this.sort;
    this.documents.paginator = this.paginator;
    this.paginator.pageSize = 10; // Set the page size to 10
    this.paginator.page.subscribe(() => this.updatePagination());
    this.updatePagination();
  }

  fetchDashboardData() {
    this.http.get<ApiResponse>(this.apiUrl).subscribe(response => {
      if (response.status === 200) {
        this.user.name = response.data.user.name;
        this.user.email = response.data.user.email;
        this.user.lastLogin = response.data.user.last_login_at;
        this.vlogs = response.data.vlogs;
        this.meetings = response.data.meetings;
        this.documentsTotal = response.data.documentsTotal;
        this.documents.data = response.data.documents; // Update documents data
        this.updatePagination();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.documents.filter = filterValue.trim().toLowerCase();
  }

  applySorting(sortState: Sort) {
    if (!sortState.active || sortState.direction === '') {
      return;
    }
  
    const key = sortState.active as keyof Document;
  
    this.documents.data = [...this.documents.data].sort((a, b) => {
      let valueA: any = a[key];
      let valueB: any = b[key];
  
      if (key === 'created_at') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
  
      return (valueA < valueB ? -1 : 1) * (sortState.direction === 'asc' ? 1 : -1);
    });
  }

  updatePagination() {
    if (this.paginator) {
      this.totalPages = Math.ceil(this.documents.data.length / this.paginator.pageSize);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.paginator.pageIndex = page - 1;
    this.paginator._changePageSize(this.paginator.pageSize);
  }
}