import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { 
  ApiCommentResponse, 
  ApiResponse, 
  Blog, 
  Comment 
} from '../../../model/student-blogs-model';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class StudentBlogService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private loggedInUserId: number = 0;
  private loggedInUserRole: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastrService
  ) {
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();
  }

  getBlogs(): Observable<Blog[]> {
    const studentId = this.loggedInUserId;
    return this.http.get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${studentId}`).pipe(
      tap(response => console.log('Raw getBlogs response:', response)),
      map(response => {
        if (response && response.data) {
          return response.data;
        } else {
          console.error('Invalid getBlogs response:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error in getBlogs:', error);
        this.toast.error('Failed to fetch blogs', 'Error');
        return throwError(() => new Error('Failed to fetch blogs'));
      })
    );
  }

  addComment(blogId: number, content: string): Observable<Comment> {
    const comment: Partial<Comment> = {
      content: content.trim(),
      blog_id: blogId,
      student_id: this.loggedInUserRole === 'student' ? this.loggedInUserId : null,
      tutor_id: this.loggedInUserRole === 'tutor' ? this.loggedInUserId : null,
    };

    return this.http.post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment).pipe(
      map(response => response.comment),
      catchError(error => {
        this.toast.error('Failed to add comment', 'Error');
        return throwError(() => new Error('Failed to add comment'));
      })
    );
  }

  downloadBlogFiles(blogId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/download/blog/${blogId}`, {
      responseType: 'blob',
      observe: 'response',
    }).pipe(
      catchError(error => {
        this.toast.error('Failed to download files', 'Error');
        return throwError(() => new Error('Failed to download files'));
      })
    );
  }

  getLoggedInUserId(): number {
    return this.loggedInUserId;
  }

  getLoggedInUserRole(): string | null {
    return this.loggedInUserRole;
  }
}