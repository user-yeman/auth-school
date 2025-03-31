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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

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
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './student-switch.component.html',
  styleUrls: ['./student-switch.component.css'],
})
export class StudentSwitchComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
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
  displayedColumns: string[] = ['file_name', 'status', 'uploadedDate'];
  documents: MatTableDataSource<Document> = new MatTableDataSource();
  filterValue: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  pages: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  ngAfterViewInit() {
    if (this.sort && this.paginator) {
      this.documents.sort = this.sort;
      this.documents.paginator = this.paginator;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(() => this.updatePagination());
      this.updatePagination();
    }
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
      this.documents.data = data.documents || [];
      this.updatePagination();

      if (this.paginator) {
        this.paginator.pageSize = 10;
        this.paginator.pageIndex = 0;
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.documents.filter = filterValue.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
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

      return (
        (valueA < valueB ? -1 : 1) * (sortState.direction === 'asc' ? 1 : -1)
      );
    });
  }

  updatePagination() {
    if (this.paginator) {
      this.totalPages = Math.ceil(
        this.documents.data.length / this.paginator.pageSize
      );
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    if (this.paginator) {
      this.paginator.pageIndex = page - 1;
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }
}
