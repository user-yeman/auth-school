import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import {
  ApiResponse,
  reschedule,
  RescheduleResponse,
} from '../../../../model/tutor-meeting-model';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private mockApiData = {
    status: 'success',
    data: {
      id: 1,
      name: 'Karianne Zboncak',
      email: 'zgaylord@example.net',
      student_id: 'STD001',
      meetings: {
        upcoming: [
          {
            id: 2,
            title: 'Project Kickoff Meeting',
            date: '2025-03-27T14:30:00.000000Z',
            time: '2025-03-27T14:30:00.000000Z',
            meeting_type: 'online',
            description: 'Initial discussion about project scope and timeline',
            meeting_link: 'https://zoom.us/j/123456789',
            location: null,
            status: 'rescheduled',
            filter_status: 'upcoming',
          },
          {
            id: 1,
            title: 'Template Checking',
            date: '2025-03-27T14:30:00.000000Z',
            time: '2025-03-27T14:30:00.000000Z',
            meeting_type: 'online',
            description: 'Initial discussion about project scope and timeline',
            meeting_link: 'https://zoom.us/j/123456789',
            location: null,
            status: 'upcomming',
            filter_status: 'upcoming',
          },
        ],
        pastdue: [
          {
            id: 3,
            title: 'Progress Checking',
            date: '2025-03-25T14:30:00.000000Z',
            time: '2025-03-25T14:30:00.000000Z',
            meeting_type: 'offline',
            description: 'I wanna check progress of the applciation',
            meeting_link: 'https://zoom.us/j/123456789',
            location: 'second floor kfc',
            status: 'completed',
            filter_status: 'pastdue',
          },
        ],
      },
    },
    id: '',
    message: 'Meeting Fetched Successfully',
  };

  private meetingListUrl = 'http://127.0.0.1:8000/api/meetinglist';
  private addScheduleUrl = 'http://127.0.0.1:8000/api/arranging';
  private rescheduleUrl = 'http://127.0.0.1:8000/api/tutor/meetingrequest';

  constructor(private http: HttpClient) {}

  getData(userId: number): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(`${this.meetingListUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }
  // getRescheduleData(): Observable<reschedule> {
  //   return this.http
  //     .get<reschedule>(`${this.rescheduleUrl}`)
  //     .pipe(catchError(this.handleError));
  // }

  scheduleMeeting(meetingData: any): Observable<any> {
    return this.http
      .post(this.addScheduleUrl, meetingData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
