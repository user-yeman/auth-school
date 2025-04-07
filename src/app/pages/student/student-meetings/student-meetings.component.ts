import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { StudentHeaderComponent } from '../student-header/student-header/student-header.component';
import { MatDialog } from '@angular/material/dialog';
import { RescheduleDialogComponent } from './reschedule-dialog/reschedule-dialog.component';

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
    MatSnackBarModule,
    StudentHeaderComponent // Add this line!
  ],
  templateUrl: './student-meetings.component.html',
  styleUrls: ['./student-meetings.component.css','../shared/student-responsive.css']
})
export class StudentMeetingsComponent implements OnInit {
  studentData: StudentData | null = null;
  upcomingMeetings: Meeting[] = [];
  pastMeetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  activeFilter: 'all' | 'upcoming' | 'pastdue' = 'upcoming'; // Default to upcoming
  lastLoginFromSession: string = '';
  
  private useMockData = true; // Set to false when backend is stable
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
    private snackBar: MatSnackBar, // Add this
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
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
    // Only access browser APIs in browser context
    if (isPlatformBrowser(this.platformId)) {
      // Get login time from sessionStorage
      this.lastLoginFromSession = sessionStorage.getItem('lastLoginTime') || '';
      console.log('Last login from sessionStorage:', this.lastLoginFromSession);
    }
    
    // Fetch meetings data (works in both server and browser)
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
  
  // Update processMeetingsResponse to compare dates and use the most recent one
  private processMeetingsResponse(response: ApiResponse): void {
    if (response.status !== 'success') {
      this.errorMessage = response.message || 'Failed to load meetings';
      this.isLoading = false;
      return;
    }
    
    this.studentData = response.data;
    
    // Only update session storage in browser context
    if (isPlatformBrowser(this.platformId) && this.studentData?.last_login_at) {
      const apiLoginTime = this.studentData.last_login_at;
      const sessionLoginTime = sessionStorage.getItem('lastLoginTime') || '';
      
      // Compare dates to use the most recent one
      let useApiTime = false;
      
      try {
        const apiDate = new Date(apiLoginTime);
        const sessionDate = new Date(sessionLoginTime);
        
        // Only use API time if it's newer than session time
        if (isNaN(sessionDate.getTime()) || apiDate > sessionDate) {
          useApiTime = true;
          console.log('API login time is more recent than session storage time');
        } else {
          console.log('Session storage login time is more recent than API time');
        }
      } catch (e) {
        console.error('Error comparing dates:', e);
        useApiTime = true; // Default to API time on error
      }
      
      // Update sessionStorage if API time is newer
      if (useApiTime) {
        sessionStorage.setItem('lastLoginTime', apiLoginTime);
        console.log('Updated sessionStorage with API login time:', apiLoginTime);
        this.lastLoginFromSession = apiLoginTime;
      } else {
        this.lastLoginFromSession = sessionLoginTime;
      }
    }
    
    // Rest of your existing code...
    this.upcomingMeetings = response.data.meetings.upcoming || [];
    this.pastMeetings = response.data.meetings.pastdue || [];
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
      // Replace alert with snackbar
      this.showSnackBar(`Joining meeting: ${meeting.title}`);
      
      // Open the meeting link in a new tab
      if (isPlatformBrowser(this.platformId)) {
        window.open(meeting.meeting_link, '_blank');
      }
    } else {
      // Show error message with snackbar instead of alert
      this.showSnackBar('No meeting link available. Please contact your tutor.', true);
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
  
  rescheduleMeeting(meeting: any): void {
    // Format the current date properly for the date input
    const today = new Date();
    const formattedDate = this.formatDateToYYYYMMDD(today);
    
    // Format the time properly for the time input (24-hour format)
    const formattedTime = this.convert12HourTo24Hour(meeting.time || '09:00 AM');
    
    // Create the form
    const rescheduleForm = this.fb.group({
      topic: [{value: meeting.title || 'Meeting', disabled: true}],
      originalDateTime: [{value: `${this.formatDate(meeting.date)}, ${this.formatTime(meeting.time)}`, disabled: true}],
      meetingType: [meeting.meeting_type === 'online' ? 'Online' : 'Campus', Validators.required],
      location: [meeting.location || 'Zoom', Validators.required],
      newDate: [formattedDate, Validators.required], // Use string format yyyy-MM-dd
      newTime: [formattedTime, Validators.required], // Use string format HH:mm (24-hour)
      reason: ['', Validators.required]
    });
    
    // Define available locations based on meeting type
    const locations = meeting.meeting_type === 'online' 
      ? ['Zoom', 'Microsoft Teams', 'Google Meet'] 
      : ['Room 101', 'Room 102', 'Conference Hall', 'Library'];
    
    // Store the selected meeting
    this.selectedMeeting = meeting;
    
    // Open dialog
    const dialogRef = this.dialog.open(RescheduleDialogComponent, {
      width: '680px', // Match the exact width from specs
      panelClass: 'reschedule-dialog-container',
      data: {
        form: rescheduleForm,
        availableLocations: locations
      },
      disableClose: true
    });
    
    // Handle dialog close
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitRescheduleRequest(meeting.id, result);
      }
    });
  }
  
  private submitRescheduleRequest(meetingId: number, formData: any): void {
    console.log('Submitting reschedule request', meetingId, formData);
    
    // Display loading state
    this.isLoading = true;
    
    // Get the tutor_id from the selected meeting
    const tutor_id = this.selectedMeeting?.tutor_id || 1;
    
    // Create request data object with properly formatted fields
    const requestData = {
      tutor_id: tutor_id,
      arrange_date: formData.newDate, // Already in YYYY-MM-DD format
      meeting_time: formData.newTime, // Already in 24-hour format
      meeting_type: formData.meetingType === 'Online' ? 'online' : 'offline',
      reason: formData.reason,
      meeting_place: formData.meetingType === 'Online' ? 'N/A' : formData.location,
      meeting_app: formData.meetingType === 'Online' ? formData.location : 'N/A'
    };
    
    if (this.useMockData) {
      // Mock data implementation - simulates successful API call
      setTimeout(() => {
        this.isLoading = false;
        this.showSnackBar('Meeting rescheduled successfully! (Mock Mode)');
        // Refresh the meetings data
        this.fetchMeetingsData();
      }, 1000);
    } else {
      // Real API implementation
      const apiUrl = `http://127.0.0.1:8000/api/meetingrequest/${meetingId}`;
      
      this.http.post(apiUrl, requestData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          if (response.status === 'success') {
            this.showSnackBar('Meeting rescheduled successfully!');
            this.fetchMeetingsData();
          } else {
            this.showSnackBar('Failed to reschedule meeting: ' + (response.message || 'Unknown error'), true);
          }
        },
        error: (error) => {
          console.error('Error rescheduling meeting:', error);
          this.isLoading = false;
          
          // Handle specific error cases
          if (error.error?.exception === 'ErrorException' && 
              error.error?.message?.includes('Undefined variable')) {
            this.showSnackBar('Server error. Please try again later.', true);
          } else {
            this.showSnackBar('Failed to reschedule meeting: ' + (error.error?.message || 'Network error'), true);
          }
        }
      });
    }
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
    // Replace alert with snackbar
    this.showSnackBar(`Location: ${location}`);
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

  // Helper methods for date and time formatting
  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private convert12HourTo24Hour(timeString: string): string {
    try {
      // Already in 24-hour format
      if (timeString.match(/^\d{2}:\d{2}$/) && !timeString.includes(' ')) {
        return timeString;
      }
      
      // Parse 12-hour format (e.g. "11:30 PM")
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Format as 24-hour (e.g. "23:30")
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('Error converting time format:', e);
      return '09:00'; // Default fallback time
    }
  }
}
