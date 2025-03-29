import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

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
  tutor_id?: number; // Add this optional property
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
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule // Add this
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
            "filter_status": "pastdue",
            "tutor_id": 101
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
            "filter_status": "pastdue",
            "tutor_id": 101
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
            "filter_status": "pastdue",
            "tutor_id": 101
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
            "filter_status": "pastdue",
            "tutor_id": 101
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
            "filter_status": "pastdue",
            "tutor_id": 101
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
            "filter_status": "upcoming",
            "tutor_id": 102
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
            "filter_status": "upcoming",
            "tutor_id": 102
          }
        ]
      }
    },
    "id": "",
    "message": "Meeting Fetched Successfully"
  };
  
  showRescheduleForm = false;
  selectedMeeting: Meeting | null = null;
  rescheduleForm: FormGroup;

  availableLocations: string[] = [];
  onCampusLocations: string[] = [
    'Room 101', 
    'Room 102', 
    'Room 103', 
    'Room 201', 
    'Room 202',
    'Room 305, Building B',
    'Conference Room A',
    'Library Study Room'
  ];

  constructor(
    private http: HttpClient, 
    private fb: FormBuilder,
    private snackBar: MatSnackBar // Add this
  ) {
    this.rescheduleForm = this.fb.group({
      topic: ['', Validators.required],
      originalDateTime: [''],
      meetingType: ['Online', Validators.required],
      location: ['', Validators.required],
      newDate: ['', Validators.required],
      newTime: ['10:00', Validators.required], // Format: HH:MM (24-hour format)
      reason: ['', Validators.required]
    });
  }
  
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
  
  rescheduleMeeting(meeting: Meeting): void {
    console.log('Rescheduling meeting called with:', meeting);
    this.selectedMeeting = meeting;
    
    // Prepare original date time string
    const originalDate = this.formatDate(meeting.date);
    const originalTime = this.formatTime(meeting.time);
    
    // Map API meeting type to UI labels
    // API uses 'online'/'offline' but UI shows 'Online'/'Campus'
    const uiMeetingType = meeting.meeting_type === 'online' ? 'Online' : 'Campus';
    
    // Set location options based on meeting type
    if (uiMeetingType === 'Online') {
      this.availableLocations = ['Zoom', 'Teams', 'Google Meeting'];
    } else {
      this.availableLocations = [...this.onCampusLocations];
    }
    
    // Determine the current location/platform
    let currentLocation = '';
    if (uiMeetingType === 'Online') {
      if (meeting.meeting_link?.includes('teams')) {
        currentLocation = 'Teams';
      } else if (meeting.meeting_link?.includes('google') || meeting.meeting_link?.includes('meet.google')) {
        currentLocation = 'Google Meeting';
      } else {
        currentLocation = 'Zoom'; // Default for online
      }
    } else {
      currentLocation = meeting.location || this.availableLocations[0];
    }
    
    // Format the time for the time input
    const timeDate = new Date(meeting.time);
    const hours = timeDate.getHours().toString().padStart(2, '0');
    const minutes = timeDate.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    // Set form values
    this.rescheduleForm.patchValue({
      topic: meeting.title || 'Meeting',
      originalDateTime: `${originalDate}, ${originalTime}`,
      meetingType: uiMeetingType, // Use the mapped UI value
      location: currentLocation,
      newDate: new Date(meeting.date).toISOString().split('T')[0],
      newTime: formattedTime, // Format: HH:MM (24-hour format)
      reason: ''
    });
    
    // Show the form
    this.showRescheduleForm = true;
    console.log('Form should be visible now. showRescheduleForm =', this.showRescheduleForm);
  }

  onMeetingTypeChange(): void {
    console.log('Meeting type changed');
    const meetingType = this.rescheduleForm.get('meetingType')?.value;
    
    if (meetingType === 'Online') {
      // For online meetings, set available locations to the online platforms
      this.availableLocations = ['Zoom', 'Teams', 'Google Meeting'];
      this.rescheduleForm.get('location')?.setValue('Zoom'); // Default to Zoom
    } else if (meetingType === 'Campus') { // Be explicit about the condition
      // For campus meetings, use the campus locations
      this.availableLocations = [...this.onCampusLocations];
      this.rescheduleForm.get('location')?.setValue(this.availableLocations[0]);
    }
  }

  calculateEndTime(timeString: string): string {
    const time = new Date(timeString);
    time.setMinutes(time.getMinutes() + 45); // 45-min meetings
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onConfirmReschedule(): void {
    if (this.rescheduleForm.valid && this.selectedMeeting) {
      console.log('Reschedule form submitted:', this.rescheduleForm.value);
      
      // Get form values
      const formValues = this.rescheduleForm.value;
      
      // Get the tutor_id safely
      const tutor_id = this.selectedMeeting.tutor_id || 1;
      
      // Map the UI meeting type to API values
      // UI shows 'Online'/'Campus' but API expects 'online'/'offline'
      const apiMeetingType = formValues.meetingType === 'Online' ? 'online' : 'offline';
      
      const requestData = {
        tutor_id: tutor_id,
        arrange_date: formValues.newDate,
        meeting_time: formValues.newTime,
        meeting_type: apiMeetingType, // Use mapped value for API
        reason: formValues.reason,
        // Always include both fields, but set appropriate values based on meeting type
        meeting_place: formValues.meetingType === 'Online' ? 'N/A' : formValues.location,
        meeting_app: formValues.meetingType === 'Online' ? formValues.location : 'N/A'
      };
      
      console.log('Sending reschedule request with data:', requestData);
      
      // Endpoint for the reschedule API
      const apiUrl = `http://127.0.0.1:8000/api/meetingrequest/${this.selectedMeeting.id}`;
      
      // Display loading state
      this.isLoading = true;
      
      // Send the POST request to the API
      this.http.post(apiUrl, requestData).subscribe({
        next: (response: any) => {
          console.log('Reschedule response:', response);
          this.isLoading = false;
          
          if (response.status === 'success') {
            // Replace alert with snackbar
            this.showSnackBar('Meeting rescheduled successfully!');
            
            this.closeRescheduleForm();
            this.fetchMeetingsData();
          } else {
            // Replace alert with snackbar
            this.showSnackBar('Failed to reschedule meeting: ' + (response.message || 'Unknown error'), true);
          }
        },
        error: (error) => {
          console.error('Error rescheduling meeting:', error);
          this.isLoading = false;
          
          if (error.error?.exception === 'ErrorException' && 
              error.error?.message?.includes('Undefined variable')) {
            // Replace alert with snackbar
            this.showSnackBar('The meeting request could not be processed due to a system error. Our technical team has been notified.', true);
          } else {
            // Replace alert with snackbar
            const errorMessage = error.error?.message || 'Unknown error';
            const validationErrors = error.error?.errors ? Object.values(error.error.errors).flat().join(', ') : '';
            this.showSnackBar(`Error: ${errorMessage} ${validationErrors}`, true);
          }
        }
      });
      
      // For mock data
      if (this.useMockData) {
        setTimeout(() => {
          this.isLoading = false;
          // Replace alert with snackbar
          this.showSnackBar('Meeting rescheduled successfully! (Mock Mode)');
          this.closeRescheduleForm();
          // Update mock data...
        }, 1000);
      }
    } else {
      // Replace alert with snackbar
      this.showSnackBar('Please fill in all required fields', true);
      
      // Mark all form controls as touched...
      Object.keys(this.rescheduleForm.controls).forEach(key => {
        const control = this.rescheduleForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.closeRescheduleForm();
  }
  
  closeRescheduleForm(): void {
    this.showRescheduleForm = false;
    this.selectedMeeting = null;
    this.rescheduleForm.reset({
      newTime: '10:00'
    });
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

  // Add this at the bottom of your component
  debugResponse(error: any): void {
    console.group('API Error Details');
    console.log('Status:', error.status);
    console.log('Status Text:', error.statusText);
    console.log('Error body:', error.error);
    
    if (error.error && error.error.errors) {
      console.log('Validation Errors:');
      Object.entries(error.error.errors).forEach(([field, messages]) => {
        console.log(`- ${field}:`, messages);
      });
    }
    console.groupEnd();
  }

  // Add this method to your component class
  private showSnackBar(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'center', // Keep centered horizontally 
      verticalPosition: 'top',      // Change from 'bottom' to 'top'
    });
  }
}
