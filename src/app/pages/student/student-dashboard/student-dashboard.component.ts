import { Component, OnInit, ViewChild, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { StudentHeaderComponent } from '../student-header/student-header/student-header.component'; // Adjust the import path as needed

interface Document {
  file_name: string;
  status: string;
  uploaded_date: string;    
  deadline: string;
  displayStatus: string;   // No longer optional
}

// New interface for notifications
interface ScheduleNotification {
  topic: string;
  date: string;
  time: string;
  status: string;
}

interface ApiResponse {
  status: number;
  data: {
    user: {
      name: string;
      email: string;
      last_login_at: string;
    };
    tutor: {  // Add tutor interface
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
    upcoming_meetings?: any[]; // Add upcoming_meetings property
  };
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: [
    './student-dashboard.component.css',
    '../shared/student-responsive.css'
  ],
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
    FormsModule,
    StudentHeaderComponent // Add this import
  ]
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Mock data for schedule notifications
  scheduleNotifications: ScheduleNotification[] = [
    {
      topic: "Student's Progress Review",
      date: "March 18",
      time: "1:00 PM",
      status: "approved"
    },
    {
      topic: "Exam Preparation",
      date: "March 22",
      time: "2:00 PM",
      status: "rejected"
    },
    {
      topic: "Course Review",
      date: "March 23",
      time: "1:00 PM",
      status: "approved"
    }
  ];

  user = { 
    name: '', 
    email: '', 
    lastLogin: '' 
  };
  
  tutor = { // Add tutor property
    name: '',
    email: ''
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
  // Update your displayedColumns to match the property names in Document
  displayedColumns: string[] = ['file_name', 'status', 'uploaded_date', 'deadline'];
  documents: MatTableDataSource<Document> = new MatTableDataSource();
  filterValue: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  pages: number[] = [];
  upcomingMeetings: any[] = []; // Add upcomingMeetings property

  private apiUrl = 'http://127.0.0.1:8000/api/student/dashboard'; // API URL

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Fetch dashboard data
    this.fetchDashboardData();
    
    // Format the last login date consistently
    if (this.user && this.user.lastLogin) {
      this.user.lastLogin = this.formatLastLogin(this.user.lastLogin);
    }
    
    // Log the schedule notifications for testing
    console.log('Schedule Notifications:', this.scheduleNotifications);
  }

  ngAfterViewInit() {
    if (this.sort && this.paginator) {
      this.documents.sort = this.sort;
      this.documents.paginator = this.paginator;
      this.paginator.pageSize = 10; // Set the page size to 10
      this.paginator.page.subscribe(() => this.updatePagination());
      this.updatePagination();
    }
  }

  fetchDashboardData() {
    console.log('Fetching dashboard data from:', this.apiUrl);
    
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('API response received:', response);
        
        if (response.status === 200) {
          // Process user data
          this.user = {
            name: response.data.user?.name || '',
            email: response.data.user?.email || '',
            lastLogin: response.data.user?.last_login_at || ''
          };
          
          // Process tutor data
          this.tutor = {
            name: response.data.tutor?.name || '',
            email: response.data.tutor?.email || ''
          };
          
          // Process vlogs data
          this.vlogs = response.data.vlogs || {
            student: 0,
            tutor: 0,
            totalBlog: 0
          };
          
          // Process meetings data
          this.meetings = response.data.meetings || {
            count_online: 0,
            count_campus: 0,
            totalMeeting: 0
          };
          
          // Process upcoming meetings
          if (response.data.upcoming_meetings && Array.isArray(response.data.upcoming_meetings)) {
            this.upcomingMeetings = response.data.upcoming_meetings;
            console.log('Upcoming meetings:', this.upcomingMeetings);
          } else {
            this.upcomingMeetings = [];
          }
          
          // FIX: Check if documentsTotal exists before accessing it
          if (response.data.documentsTotal) {
            this.documentsTotal = {
              total: response.data.documentsTotal.total || 0,
              status: {
                finished: response.data.documentsTotal.status?.finished || 0,
                watched: response.data.documentsTotal.status?.watched || 0,
                accepted: response.data.documentsTotal.status?.accepted || 0,
                canceled: response.data.documentsTotal.status?.canceled || 0
              }
            };
          } else {
            // Set default values if documentsTotal is missing
            this.documentsTotal = {
              total: 0,
              status: {
                finished: 0,
                watched: 0,
                accepted: 0,
                canceled: 0
              }
            };
          }
          
          // Process documents if they exist
          if (response.data.documents && Array.isArray(response.data.documents)) {
            this.documents.data = response.data.documents;
          } else {
            this.documents.data = [];
          }
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
      },
      complete: () => {
        console.log('API request completed');
      }
    });
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
  
      // Special handling for status column to use displayStatus if available
      if (key === 'status') {
        valueA = a.displayStatus || a.status;
        valueB = b.displayStatus || b.status;
      }
  
      // Date handling for both uploaded_date and deadline
      if (key === 'uploaded_date' || key === 'deadline') {
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
    if (this.paginator) {
      this.paginator.pageIndex = page - 1;
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }

  /**
   * Checks if a deadline is approaching (within 3 days)
   */
  isDeadlineApproaching(dateString: string): boolean {
    if (!dateString) return false;
    
    // Create date with UTC timezone
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Create a UTC date for today to match the timezone of the deadline
    const todayUTC = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ));
    
    // Calculate days difference using UTC dates
    const diffTime = deadline.getTime() - todayUTC.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Consider deadline approaching if less than 3 days away
    return diffDays < 3 && diffDays >= 0;
  }

  /**
   * Formats the last login date string into a readable format.
   */
  formatLastLogin(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }

  /**
   * Formats a date string into a readable format.
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Formats a time string into a readable format.
   */
  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get display status for the UI
   */
  getDisplayStatus(status: string): string {
    // Map API status values to display values
    const statusMap: {[key: string]: string} = {
      'pending': 'Pending',
      'approved': 'Approved',
      'reject': 'Rejected',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled',
      'canceled': 'Cancelled',
      'rescheduled': 'Rescheduled'
    };
    
    return statusMap[status] || status;
  }
}