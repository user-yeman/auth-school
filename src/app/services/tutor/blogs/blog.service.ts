import { Injectable } from '@angular/core';
import {
  ApiCommentResponse,
  Blog,
  Comment,
} from '../../../model/tutor-blogs-model';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private loggedInUserId: number = 0;
  private loggedInUserRole: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastrService
  ) {
    this.loggedInUserId = this.authService.getUserId();
    console.log('loggedInUserId', this.loggedInUserId);
    this.loggedInUserRole = this.authService.getUserRole();
    console.log('loggedInUserRole', this.loggedInUserRole);
  }

  getBlogs(studentId: number): Observable<Blog[]> {
    // Add cache-busting query parameter
    const url = `${this.apiUrl}/blogs/${studentId}?t=${new Date().getTime()}`;
    return this.http.get<any>(url).pipe(
      tap((response) => console.log('Raw getBlogs response:', response)),
      map((response) => {
        if (response && response.data) {
          return response.data as Blog[];
        } else if (Array.isArray(response)) {
          return response as Blog[];
        } else {
          console.error('Invalid getBlogs response:', response);
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error in getBlogs:', error);
        this.toast.error('Failed to fetch blogs', 'Error');
        return throwError(() => new Error('Failed to fetch blogs'));
      })
    );
  }

  addBlog(blog: Partial<Blog>, files: File[]): Observable<void> {
    const formData = new FormData();
    formData.append('title', blog.title || '');
    formData.append('content', blog.content || '');
    formData.append('student_id', blog.student_id?.toString() || '0');
    formData.append(
      'tutor_id',
      this.loggedInUserRole === 'tutor' ? this.loggedInUserId.toString() : '0'
    );
    formData.append('author_role', this.loggedInUserRole || '');

    files.forEach((file, index) => {
      formData.append(`documents[${index}]`, file, file.name);
    });

    return this.http.post<any>(`${this.apiUrl}/blogs`, formData).pipe(
      tap((response) => console.log('Raw addBlog response:', response)),
      map((response) => {
        if (response && (response.status === 201 || response.status === 200)) {
          return;
        } else {
          console.error('Unexpected addBlog response:', response);
          throw new Error('Failed to add blog');
        }
      }),
      catchError((error) => {
        console.error('Error in addBlog:', error);
        this.toast.error('Failed to add blog', 'Error');
        return throwError(() => new Error('Failed to add blog'));
      })
    );
  }

  updateBlog(blog: Blog, files: File[]): Observable<void> {
    const formData = new FormData();
    formData.append('title', blog.title || '');
    formData.append('content', blog.content || '');
    formData.append('student_id', blog.student_id?.toString() || '0');
    formData.append('tutor_id', blog.tutor_id?.toString() || '0');
    formData.append(
      'author_role',
      blog.author_role || this.loggedInUserRole || 'tutor'
    );

    files.forEach((file, index) => {
      formData.append(`documents[${index}]`, file, file.name);
    });

    return this.http
      .post<any>(`${this.apiUrl}/blogs/${blog.id}`, formData)
      .pipe(
        tap((response) => console.log('Raw updateBlog response:', response)),
        map((response) => {
          if (response && response.status === 200) {
            return;
          } else {
            console.error('Unexpected updateBlog response:', response);
            throw new Error('Failed to update blog');
          }
        }),
        catchError((error) => {
          console.error('Error in updateBlog:', error);
          this.toast.error('Failed to update blog', 'Error');
          return throwError(() => new Error('Failed to update blog'));
        })
      );
  }

  deleteBlog(blogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/blogs/${blogId}`).pipe(
      catchError((error) => {
        this.toast.error('Failed to delete blog', 'Error');
        return throwError(() => new Error('Failed to delete blog'));
      })
    );
  }

  addComment(blogId: number, content: string): Observable<Comment> {
    const comment: Partial<Comment> = {
      content: content.trim(),
      blog_id: blogId,
      student_id:
        this.loggedInUserRole === 'student' ? this.loggedInUserId : null,
      tutor_id: this.loggedInUserRole === 'tutor' ? this.loggedInUserId : null,
    };

    return this.http
      .post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment)
      .pipe(
        map((response) => {
          const newComment = response.comment;
          // Add student/tutor object with name for optimistic UI update
          if (
            this.loggedInUserRole === 'student' &&
            newComment.student_id === this.loggedInUserId
          ) {
            newComment.student = {
              id: this.loggedInUserId,
              name: '',
              StudentID: '',
              email: '',
              phone_number: '',
              last_login_at: '',
              created_at: '',
              updated_at: '',
            };
          } else if (
            this.loggedInUserRole === 'tutor' &&
            newComment.tutor_id === this.loggedInUserId
          ) {
            newComment.tutor = {
              id: this.loggedInUserId,
              name: '',
              email: '',
              phone_number: '',
              specialization: '',
              last_login_at: '',
              created_at: '',
              updated_at: '',
            };
          }
          return newComment;
        }),
        catchError((error) => {
          this.toast.error('Failed to add comment', 'Error');
          return throwError(() => new Error('Failed to add comment'));
        })
      );
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http
      .put<ApiCommentResponse<Comment>>(
        `${this.apiUrl}/comments/${commentId}`,
        { content }
      )
      .pipe(
        map((response) => response.comment),
        catchError((error) => {
          this.toast.error('Failed to update comment', 'Error');
          return throwError(() => new Error('Failed to update comment'));
        })
      );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`).pipe(
      catchError((error) => {
        this.toast.error('Failed to delete comment', 'Error');
        return throwError(() => new Error('Failed to delete comment'));
      })
    );
  }

  downloadBlogFiles(blogId: number): Observable<HttpResponse<Blob>> {
    return this.http
      .get(`${this.apiUrl}/download/blog/all/${blogId}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        catchError((error) => {
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
