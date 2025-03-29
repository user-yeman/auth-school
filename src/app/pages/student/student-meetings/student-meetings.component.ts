import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Define interfaces for the API response
interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  meeting_type: 'online' | 'offline';
  description: string | null;
  meeting_link: string | null;
  location: string | null;
  status: 'rescheduled' | 'upcomming' | 'completed';
  filter_status: 'pastdue' | 'upcoming';
}

interface StudentData {
  id: number;
  name: string;
  email: string;
  student_id: string;
  last_login_at?: string; // Add this field for the last login time
  meetings: {
    pastdue: Meeting[]; // Note: API uses "pastdue" not "postdue"
    upcoming: Meeting[]; // Note: API uses "upcoming" not "upcomming"
  };
}

interface ApiResponse {
  status: string;
  data: StudentData;
  id: string;
  message: string;
}

type FilterType = 'all' | 'upcoming' | 'pastdue';

@Component({
  selector: 'app-student-meetings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './student-meetings.component.html',
  styleUrl: './student-meetings.component.css'
})
export class StudentMeetingsComponent implements OnInit {
  studentData: StudentData | null = null;
  upcomingMeetings: Meeting[] = [];
  pastMeetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  activeFilter: 'all' | 'upcoming' | 'pastdue' = 'upcoming'; // Default to upcoming
  
  private useMockData = false; // Set to false when backend is stable
  private mockApiResponse: ApiResponse = {
    "status": "success",
    "data": {
      "id": 1,
      "name": "Maximillian Fahey MD",
      "email": "dbarrows@example.net",
      "student_id": "STD001",
      "last_login_at": "2025-03-25T14:30:00.000000Z", // Add this field
      "meetings": {
        "pastdue": [
          {
            "id": 1,
            "title": "Sample Meeting Topic",
            "date": "2025-03-27T00:00:00.000000Z",
            "time": "2025-03-27T00:00:00.000000Z",
            "meeting_type": "online",
            "description": null,
            "meeting_link": null,
            "location": "Zoom",
            "status": "rescheduled",
            "filter_status": "pastdue"
          },
          {
            "id": 3,
            "title": "Sample Meeting Topic",
            "date": "2025-03-27T00:00:00.000000Z",
            "time": "2025-03-27T00:00:00.000000Z",
            "meeting_type": "online",
            "description": null,
            "meeting_link": null,
            "location": "Zoom",
            "status": "upcomming",
            "filter_status": "pastdue"
          },
          {
            "id": 5,
            "title": "Sample Meeting Topic",
            "date": "2025-03-27T00:00:00.000000Z",
            "time": "2025-03-27T00:00:00.000000Z",
            "meeting_type": "online",
            "description": null,
            "meeting_link": null,
            "location": "Zoom",
            "status": "upcomming",
            "filter_status": "pastdue"
          },
          {
            "id": 4,
            "title": "Sample Meeting Topic",
            "date": "2025-03-27T00:00:00.000000Z",
            "time": "2025-03-27T00:00:00.000000Z",
            "meeting_type": "online",
            "description": null,
            "meeting_link": null,
            "location": "Zoom",
            "status": "upcomming",
            "filter_status": "pastdue"
          },
          {
            "id": 2,
            "title": "Sample Meeting Topic",
            "date": "2025-03-27T00:00:00.000000Z",
            "time": "2025-03-27T00:00:00.000000Z",
            "meeting_type": "online",
            "description": null,
            "meeting_link": null,
            "location": "Zoom",
            "status": "upcomming",
            "filter_status": "pastdue"
          }
        ],
        "upcoming": [
          {
            "id": 6,
            "title": "Project Discussion",
            "date": "2025-04-15T00:00:00.000000Z",
            "time": "2025-04-15T14:30:00.000000Z",
            "meeting_type": "online",
            "description": "Discuss semester project progress",
            "meeting_link": "https://zoom.us/j/123456789",
            "location": null,
            "status": "upcomming",
            "filter_status": "upcoming"
          },
          {
            "id": 7,
            "title": "Thesis Review",
            "date": "2025-04-20T00:00:00.000000Z",
            "time": "2025-04-20T10:00:00.000000Z",
            "meeting_type": "offline",
            "description": "Review thesis draft",
            "meeting_link": null,
            "location": "Room 305, Building B",
            "status": "upcomming",
            "filter_status": "upcoming"
          }
        ]
      }
    },
    "id": "",
    "message": "Meeting Fetched Successfully"
  };
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.fetchMeetingsData();
  }
  
  fetchMeetingsData(): void {
    // Always set loading to true initially
    this.isLoading = true;
    
    if (this.useMockData) {
      // Use mock data
      setTimeout(() => {
        try {
          const response = this.mockApiResponse;
          console.log('Mock API response:', response);
          this.processMeetingsResponse(response);
        } catch (error) {
          console.error('Error processing mock data:', error);
          this.errorMessage = 'Error processing data';
          this.isLoading = false;
        }
      }, 1000); // Simulate network delay
    } else {
      // Use real API
      const apiUrl = 'http://127.0.0.1:8000/api/meetinglist/student';
      
      this.http.get<ApiResponse>(apiUrl).subscribe({
        next: (response) => {
          console.log('API response:', response);
          this.processMeetingsResponse(response);
        },
        error: (error) => {
          console.error('Error fetching meetings:', error);
          this.errorMessage = 'Failed to connect to the server. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }
  
  // New helper method to process responses (both mock and real)
  private processMeetingsResponse(response: ApiResponse): void {
    if (response.status !== 'success') {
      this.errorMessage = response.message || 'Failed to load meetings';
      this.isLoading = false;
      return;
    }
    
    this.studentData = response.data;
    
    // Note: The API uses "upcoming" and "pastdue"
    this.upcomingMeetings = response.data.meetings.upcoming || [];
    this.pastMeetings = response.data.meetings.pastdue || [];
    
    // Apply default filter (upcoming)
    this.applyFilter(this.activeFilter);
    
    this.isLoading = false;
  }
  
  filterMeetings(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.activeFilter = select.value as 'all' | 'upcoming' | 'pastdue';
    this.applyFilter(this.activeFilter);
  }
  
  applyFilter(filterType: FilterType): void {
    this.activeFilter = filterType;
    
    if (filterType === 'all') {
      // Combine both lists but put upcoming first
      this.filteredMeetings = [...this.upcomingMeetings, ...this.pastMeetings];
    } else if (filterType === 'upcoming') {
      this.filteredMeetings = this.upcomingMeetings;
    } else {
      this.filteredMeetings = this.pastMeetings;
    }
  }
  
  joinMeeting(meeting: Meeting): void {
    if (meeting.meeting_link) {
      // For this example, we'll just show the link
      alert(`Meeting link: ${meeting.meeting_link}`);
      // In a real app, you might open the meeting link
      // window.open(meeting.meeting_link, '_blank');
    } else {
      alert('No meeting link available');
    }
  }
  
  cancelMeeting(meetingId: number): void {
    console.log('Canceling meeting:', meetingId);
    
    if (this.useMockData) {
      // Mock cancellation
      setTimeout(() => {
        // Remove the meeting from the lists
        this.upcomingMeetings = this.upcomingMeetings.filter(m => m.id !== meetingId);
        this.pastMeetings = this.pastMeetings.filter(m => m.id !== meetingId);
        
        // Re-apply the current filter
        this.applyFilter(this.activeFilter);
        
        alert('Meeting cancelled successfully');
      }, 500); // Simulate network delay
    } else {
      // Real API call
      const apiUrl = `http://127.0.0.1:8000/api/meetinglist/student/${meetingId}/cancel`;
      
      this.http.post(apiUrl, {}).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Remove the meeting from the lists
            this.upcomingMeetings = this.upcomingMeetings.filter(m => m.id !== meetingId);
            this.pastMeetings = this.pastMeetings.filter(m => m.id !== meetingId);
            
            // Re-apply the current filter
            this.applyFilter(this.activeFilter);
            
            alert('Meeting cancelled successfully');
          } else {
            console.error('Failed to cancel meeting:', response.message);
            alert('Failed to cancel meeting: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error canceling meeting:', error);
          alert('Error canceling meeting');
        }
      });
    }
  }
  
  // Your existing helper methods remain the same
  viewLocation(location: string): void {
    alert(`Location: ${location}`);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
  
  formatTime(timeString: string): string {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getMeetingTypeIcon(type: 'online' | 'offline'): string {
    return type === 'online' ? 'videocam' : 'location_on';
  }
  
  getMeetingTypeText(meeting: Meeting): string {
    if (meeting.meeting_type === 'online') {
      return meeting.meeting_link || 'Online Meeting';
    } else {
      return meeting.location || 'On Campus';
    }
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'rescheduled': return 'status-rescheduled';
      case 'upcomming': return 'status-upcoming';
      default: return '';
    }
  }
  
  formatLastLogin(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
