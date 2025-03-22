import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiDashboardResponse, CardData } from '../../../model/card-model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TutorDashboardService {
  cards: CardData[] = [];
  apiUrl = 'http://127.0.0.1:8000/api/tutor/dashboard';
  constructor(private http: HttpClient) {}
  getDashboardData(
    forceRefresh: boolean = false
  ): Observable<ApiDashboardResponse> {
    const headers = forceRefresh
      ? new HttpHeaders().set('X-Bypass-Cache', 'true')
      : undefined;

    return this.http.get<ApiDashboardResponse>(this.apiUrl, { headers });
  }

  // dummmyyyyyyyyy
  // Mock data to avoid API calls during development
  // private mockDashboardData: ApiDashboardResponse = {
  //   groups: {
  //     teacher_group: 10,
  //     class_5th: 9, // Adjusted from 'class_5' to match the interface
  //     class_6th: 5,
  //   },
  //   total_students: {
  //     count: 25, // Total number of students (updated to match the array below)
  //     active: 15,
  //     inactive: 10,
  //   },
  //   blogging_insights: {
  //     total_posts: 5,
  //     posts_by_students: 3,
  //     posts_by_you: 2,
  //     last_blog_date: '2025-03-10',
  //   },
  //   scheduled_meetings: {
  //     total: 3,
  //     online_count: 2,
  //     online_platforms: ['Zoom', 'Google Meet'],
  //     offline_count: 1,
  //     offline_locations: ['Room 101'],
  //   },
  //   students: [
  //     {
  //       id: 1,
  //       StudentID: 'STD001',
  //       name: 'Ocie Donnelly',
  //       email: 'ocie@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 2,
  //       StudentID: 'STD002',
  //       name: 'John Smith',
  //       email: 'john@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 3,
  //       StudentID: 'STD003',
  //       name: 'Jane Doe',
  //       email: 'jane@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 4,
  //       StudentID: 'STD004',
  //       name: 'Michael Brown',
  //       email: 'michael@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 5,
  //       StudentID: 'STD005',
  //       name: 'Sarah Johnson',
  //       email: 'sarah@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 6,
  //       StudentID: 'STD006',
  //       name: 'Robert Davis',
  //       email: 'robert@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 7,
  //       StudentID: 'STD007',
  //       name: 'Emily Wilson',
  //       email: 'emily@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 8,
  //       StudentID: 'STD008',
  //       name: 'David Lee',
  //       email: 'david@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 9,
  //       StudentID: 'STD009',
  //       name: 'Lisa Anderson',
  //       email: 'lisa@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 10,
  //       StudentID: 'STD010',
  //       name: 'James Taylor',
  //       email: 'james@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 11,
  //       StudentID: 'STD011',
  //       name: 'Mary White',
  //       email: 'mary@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 12,
  //       StudentID: 'STD012',
  //       name: 'Thomas Clark',
  //       email: 'thomas@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 13,
  //       StudentID: 'STD013',
  //       name: 'Patricia Harris',
  //       email: 'patricia@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 14,
  //       StudentID: 'STD014',
  //       name: 'William Martinez',
  //       email: 'william@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 15,
  //       StudentID: 'STD015',
  //       name: 'Jennifer Lewis',
  //       email: 'jennifer@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 16,
  //       StudentID: 'STD016',
  //       name: 'Charles Walker',
  //       email: 'charles@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 17,
  //       StudentID: 'STD017',
  //       name: 'Barbara Hall',
  //       email: 'barbara@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 18,
  //       StudentID: 'STD018',
  //       name: 'Daniel Allen',
  //       email: 'daniel@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 19,
  //       StudentID: 'STD019',
  //       name: 'Nancy Young',
  //       email: 'nancy@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 20,
  //       StudentID: 'STD020',
  //       name: 'Paul King',
  //       email: 'paul@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 21,
  //       StudentID: 'STD021',
  //       name: 'Linda Scott',
  //       email: 'linda@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 22,
  //       StudentID: 'STD022',
  //       name: 'Richard Green',
  //       email: 'richard@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 23,
  //       StudentID: 'STD023',
  //       name: 'Susan Adams',
  //       email: 'susan@example.com',
  //       status: 'Active',
  //     },
  //     {
  //       id: 24,
  //       StudentID: 'STD024',
  //       name: 'Mark Baker',
  //       email: 'mark@example.com',
  //       status: 'Inactive',
  //     },
  //     {
  //       id: 25,
  //       StudentID: 'STD025',
  //       name: 'Karen Hill',
  //       email: 'karen@example.com',
  //       status: 'Active',
  //     },
  //   ],
  // };

  // getDashboardData(
  //   forceRefresh: boolean = false
  // ): Observable<ApiDashboardResponse> {
  //   // Return mock data instead of making an HTTP request
  //   return of(this.mockDashboardData);
  // }
}
