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

  addBlog(blog: Partial<Blog>, files: File[]): Observable<Blog> {
    const formData = new FormData();
    
    // Add blog data to the form
    formData.append('title', blog.title || '');
    formData.append('content', blog.content || '');
    
    // Add user identification
    formData.append('student_id', this.loggedInUserId.toString());
    
    // Add tutor_id if available
    if (blog.tutor_id) {
      formData.append('tutor_id', blog.tutor_id.toString());
    }
    
    // Mark as student authored
    formData.append('author_role', 'student');
    
    // Set author name if available
    if (blog.author) {
      formData.append('author', blog.author);
    } else {
      // Try to get username from session if available
      const userName = sessionStorage.getItem('userName');
      formData.append('author', userName || 'Student');
    }
    
    // Add files if any
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`documents[${index}]`, file, file.name);
      });
    }
    
    // Log what we're sending
    console.log('Sending blog data:', {
      title: blog.title,
      content: blog.content,
      student_id: this.loggedInUserId,
      tutor_id: blog.tutor_id,
      files: files.map(f => f.name)
    });
    
    // Send the request
    return this.http.post<ApiResponse<Blog>>(`${this.apiUrl}/blogs`, formData).pipe(
      map(response => {
        console.log('Blog created successfully:', response);
        if (response && response.data) {
          return response.data;
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError(error => {
        console.error('Error creating blog:', error);
        this.toast.error('Failed to create blog', 'Error');
        return throwError(() => new Error('Failed to create blog'));
      })
    );
  }

  updateBlog(blogId: number, data: { title: string, content: string }): Observable<Blog> {
    return this.http.put<ApiResponse<Blog>>(`${this.apiUrl}/blogs/${blogId}`, data).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError(error => {
        console.error('Error updating blog:', error);
        this.toast.error('Failed to update blog', 'Error');
        return throwError(() => new Error('Failed to update blog'));
      })
    );
  }

  deleteBlog(blogId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/blogs/${blogId}`).pipe(
      tap(response => console.log('Blog deleted successfully:', response)),
      catchError(error => {
        console.error('Error deleting blog:', error);
        this.toast.error('Failed to delete blog', 'Error');
        return throwError(() => new Error('Failed to delete blog'));
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