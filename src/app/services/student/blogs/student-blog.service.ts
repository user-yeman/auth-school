import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError, BehaviorSubject } from 'rxjs';
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
  
  // Add a subject to notify components of blog changes
  private blogsSubject = new BehaviorSubject<Blog[]>([]);
  public blogs$ = this.blogsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastrService
  ) {
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();
    
    // Load blogs initially
    this.loadBlogs();
  }
  
  // Method to load blogs and update the subject
  private loadBlogs(): void {
    const studentId = this.loggedInUserId;
    this.http.get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${studentId}`).pipe(
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
    ).subscribe({
      next: (blogs) => {
        this.blogsSubject.next(blogs);
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
      }
    });
  }

  // Updated getBlogs to use the subject
  getBlogs(): Observable<Blog[]> {
    // Trigger a refresh of blogs
    this.loadBlogs();
    
    // Return the observable from the subject
    return this.blogs$;
  }

  addComment(blogId: number, content: string): Observable<Comment> {
    const comment: Partial<Comment> = {
      content: content.trim(),
      blog_id: blogId,
      student_id: this.loggedInUserRole === 'student' ? this.loggedInUserId : null,
      tutor_id: this.loggedInUserRole === 'tutor' ? this.loggedInUserId : null,
    };

    return this.http.post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment).pipe(
      tap(response => {
        // Update the blogs subject with the new comment
        const newComment = response.comment;
        const currentBlogs = this.blogsSubject.getValue();
        
        // Find the blog to update
        const updatedBlogs = currentBlogs.map(blog => {
          if (blog.id === blogId) {
            // Create a new blog object with the comment added
            return {
              ...blog,
              comments: blog.comments ? [...blog.comments, newComment] : [newComment]
            };
          }
          return blog;
        });
        
        // Update the subject with the new blogs array
        this.blogsSubject.next(updatedBlogs);
      }),
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

  // Update the addBlog method to be more flexible with response formats
  addBlog(blogData: any, files: File[] = []): Observable<Blog> {
    console.log('Adding blog with data:', blogData);
    
    const formData = new FormData();
    
    // Add blog data to form data
    if (blogData.title) formData.append('title', blogData.title);
    if (blogData.content) formData.append('content', blogData.content);
    if (blogData.author_role) formData.append('author_role', blogData.author_role);
    if (blogData.student_id) formData.append('student_id', String(blogData.student_id));
    
    // Add files if present
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`documents[${index}]`, file, file.name);
      });
    }
    
    // Log form data for debugging
    console.log('Sending form data:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    // Accept any response format
    return this.http.post<any>(`${this.apiUrl}/blogs`, formData).pipe(
      tap(response => console.log('Blog creation response:', response)),
      map(response => {
        // Handle different response formats
        if (response && response.data) {
          // Standard ApiResponse format
          return response.data;
        } else if (response && response.blog) {
          // Alternative format with 'blog' property
          return response.blog;
        } else if (response && response.id) {
          // Direct blog object
          return response;
        } else {
          // Log the actual response for debugging
          console.warn('Unexpected response format:', JSON.stringify(response));
          
          // Get username from auth service for use as author
          const username = this.authService.getUserName() || 'Anonymous';
          
          // Instead of throwing an error, try to construct a usable blog object
          return {
            id: response?.id || -new Date().getTime(),
            title: blogData.title || 'Untitled',
            content: blogData.content || '',
            student_id: blogData.student_id,
            author_role: blogData.author_role || 'student',
            author: username, // Add the required author property
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            comments: []
          } as unknown as Blog; // Use unknown as intermediary to avoid type check errors
        }
      }),
      catchError(error => {
        console.error('Error creating blog:', error);
        
        // Log more details about the error
        if (error.error) {
          console.error('Server error details:', error.error);
        }
        
        this.toast.error('Failed to create blog: ' + 
          (error.error?.message || error.message || 'Unknown error'));
          
        return throwError(() => error);
      })
    );
  }

  // Update updateBlog method to update the blogs in the subject
  updateBlog(blogId: number, data: { title: string, content: string }): Observable<Blog> {
    return this.http.put<ApiResponse<Blog>>(`${this.apiUrl}/blogs/${blogId}`, data).pipe(
      map(response => {
        if (response && response.data) {
          // Update the blog in the subject
          const updatedBlog = response.data;
          const currentBlogs = this.blogsSubject.getValue();
          const updatedBlogs = currentBlogs.map(blog => 
            blog.id === blogId ? updatedBlog : blog
          );
          this.blogsSubject.next(updatedBlogs);
          
          return updatedBlog;
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

  // Update deleteBlog method to update the blogs in the subject
  deleteBlog(blogId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/blogs/${blogId}`).pipe(
      tap(response => {
        console.log('Blog deleted successfully:', response);
        
        // Remove the deleted blog from the subject
        const currentBlogs = this.blogsSubject.getValue();
        const updatedBlogs = currentBlogs.filter(blog => blog.id !== blogId);
        this.blogsSubject.next(updatedBlogs);
      }),
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