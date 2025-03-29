import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Define interfaces for the API response
interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  meeting_type: 'online' | 'offline';
  description: string;
  meeting_link: string | null;
  location: string | null;
  status: 'rescheduled' | 'upcomming' | 'completed';
  filter_status: 'postdue' | 'upcoming';
}

interface StudentData {
  id: number;
  name: string;
  email: string;
  student_id: string;
  meetings: {
    upcomming: Meeting[];
    postdue: Meeting[];
  };
}

interface ApiResponse {
  status: string;
  data: StudentData;
  message: string;
}

@Component({
  selector: 'app-student-meetings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule
  ],
  templateUrl: './student-meetings.component.html',
  styleUrl: './student-meetings.component.css'
})
export class StudentMeetingsComponent implements OnInit {
  studentData: StudentData | null = null;
  upcomingMeetings: Meeting[] = [];
  postdueMeetings: Meeting[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.fetchMeetingsData();
  }
  
  fetchMeetingsData(): void {
    // Replace with your actual API endpoint
    const apiUrl = 'http://127.0.0.1:8000/api/meetinglist/student';
    
    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        console.log('API response:', response);
        
        // Check if we got an error response (Laravel exception)
        if (response.exception) {
          console.error('Backend error:', response.message);
          this.errorMessage = 'Backend error: ' + response.message;
          this.isLoading = false;
          return;
        }
        
        if (response.status === '200' || response.status === 'success') {
          this.studentData = response.data;
          this.upcomingMeetings = response.data.meetings.upcomming || [];
          this.postdueMeetings = response.data.meetings.postdue || [];
        } else {
          this.errorMessage = response.message || 'Failed to load meetings';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching meetings:', error);
        this.errorMessage = 'Failed to connect to the server. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  joinMeeting(meeting: Meeting): void {
    if (meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank');
    } else {
      console.log('No meeting link available');
      // You could show a toast/notification here
    }
  }
  
  cancelMeeting(meetingId: number): void {
    console.log('Canceling meeting:', meetingId);
    // Fix the URL - you're missing a slash
    const apiUrl = `http://127.0.0.1:8000/api/meetinglist/student/${meetingId}/cancel`;
    // Previously: api/meetinglist/student${meetingId}/cancel (missing slash)
    
    this.http.post(apiUrl, {}).subscribe({
      next: (response: any) => {
        if (response.status === '200' || response.status === 'success') {
          // Remove the meeting from the lists
          this.upcomingMeetings = this.upcomingMeetings.filter(m => m.id !== meetingId);
          this.postdueMeetings = this.postdueMeetings.filter(m => m.id !== meetingId);
        } else {
          console.error('Failed to cancel meeting:', response.message);
        }
      },
      error: (error) => {
        console.error('Error canceling meeting:', error);
      }
    });
  }
  
  viewLocation(location: string): void {
    // This could open a map or display location details
    console.log('Viewing location:', location);
  }
  
  // Helper methods for the template
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
  
  getMeetingTypeIcon(type: 'online' | 'offline'): string {
    return type === 'online' ? 'videocam' : 'location_on';
  }
  
  getMeetingTypeText(meeting: Meeting): string {
    if (meeting.meeting_type === 'online') {
      return meeting.meeting_link ? 'Online Meeting' : 'Online';
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
}
