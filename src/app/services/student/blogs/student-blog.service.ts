import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError, BehaviorSubject, of, Subscription, filter, interval, EMPTY, switchMap } from 'rxjs';
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
export class StudentBlogService implements OnDestroy {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private loggedInUserId: number = 0;
  private loggedInUserRole: string | null = null;
  
  // Add a subject to notify components of blog changes
  private blogsSubject = new BehaviorSubject<Blog[]>([]);
  public blogs$ = this.blogsSubject.asObservable();

  // Add to class properties
  private pollingInterval: any;
  private subscription: Subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private toast: ToastrService,
    private authService: AuthService
  ) {
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();
    
    // Load blogs initially
    this.loadBlogs();
    
    // Start polling for updates
    this.startPolling();
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

  // Update the addComment method in student-blog.service.ts
  addComment(blogId: number, content: string): Observable<Comment> {
    console.log('Adding comment - blog ID type:', typeof blogId, 'Value:', blogId);
    
    // Make sure blogId is actually a number
    if (!blogId || isNaN(Number(blogId))) {
      this.toast.error('Invalid blog ID', 'Error');
      return throwError(() => new Error('Invalid blog ID'));
    }
    
    // Ensure blog ID exists in our current blogs
    const currentBlogs = this.blogsSubject.getValue();
    const blogExists = currentBlogs.some(blog => Number(blog.id) === Number(blogId));
    
    console.log('Blog exists in local state:', blogExists);
    if (!blogExists) {
      console.warn('Attempting to comment on blog that may not exist in database yet');
      // This could be the issue - the blog might not be properly synchronized with the backend
    }
    
    const comment: any = {
      content: content.trim(),
      blog_id: Number(blogId) // Ensure it's a number
    };
    
    if (this.loggedInUserRole === 'student') {
      comment.student_id = this.loggedInUserId;
    } else if (this.loggedInUserRole === 'tutor') {
      comment.tutor_id = this.loggedInUserId;
    }
    
    console.log('Sending comment data:', comment);
    
    return this.http.post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment).pipe(
      tap(response => console.log('Comment creation response:', response)),
      map(response => {
        if (!response || !response.comment) {
          throw new Error('Invalid response format');
        }
        
        this.updateBlogsWithNewComment(blogId, response.comment);
        
        return response.comment;
      }),
      catchError(error => {
        console.error('Error adding comment:', error);
        
        let errorMessage = 'Failed to add comment';
        if (error.error && error.error.message) {
          errorMessage += ': ' + error.error.message;
        } else if (error.error && typeof error.error === 'object') {
          const errorMessages = [];
          for (const key in error.error.errors || {}) {
            if (error.error.errors[key]) {
              errorMessages.push(...error.error.errors[key]);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage += ': ' + errorMessages.join(', ');
          }
        }
        
        this.toast.error(errorMessage, 'Error');
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Add this helper method
  private updateBlogsWithNewComment(blogId: number, newComment: Comment): void {
    const currentBlogs = this.blogsSubject.getValue();
    
    const updatedBlogs = currentBlogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          comments: blog.comments ? [...blog.comments, newComment] : [newComment]
        };
      }
      return blog;
    });
    
    this.blogsSubject.next(updatedBlogs);
  }

  downloadBlogFiles(docId: number): Observable<any> {
    // Use the correct endpoint format from your documentation
    const url = `${this.apiUrl}/download/blog/${docId}`;
    
    console.log('Making download request to:', url);
    
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/octet-stream'
      })
    }).pipe(
      catchError(error => {
        console.error('Error downloading file:', error);
        return throwError(() => new Error('Failed to download file'));
      })
    );
  }

  // Update the addBlog method in student-blog.service.ts
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
    
    // Make the request
    return this.http.post<any>(`${this.apiUrl}/blogs`, formData).pipe(
      tap(response => {
        console.log('Blog creation raw response:', response);
      }),
      map(response => {
        // Extract the blog from the response
        let blog: Blog;
        
        // Try to extract the blog data based on different response formats
        if (response && response.data) {
          blog = response.data;
        } else if (response && response.blog) {
          blog = response.blog;
        } else {
          // If no structured data, try to build a blog object
          blog = {
            id: response?.id || response?.data?.id || response?.blog?.id,
            title: blogData.title || 'Untitled',
            content: blogData.content || '',
            student_id: Number(blogData.student_id),
            author: this.authService.getUserName() || 'Anonymous',
            author_role: blogData.author_role || 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            comments: []
          } as Blog;
        }
        
        // CRITICAL: Make sure we have a numeric ID from the server
        if (typeof blog.id === 'string') {
          blog.id = Number(blog.id);
        }
        
        // IMPORTANT: Wait for a refresh from the server before allowing comments
        // This ensures that the blog ID exists in the database
        this.loadBlogs();
        
        console.log('Final processed blog:', blog);
        console.log('Blog ID for commenting:', blog.id, 'Type:', typeof blog.id);
        
        // Add documents to the UI representation if they're not returned from the server
        if (files && files.length > 0 && (!blog.documents || blog.documents.length === 0)) {
          blog.documents = files.map(file => ({
            id: Math.random(),
            name: file.name,
            size: file.size,
            file_path: URL.createObjectURL(file),
            mime_type: file.type,
            created_at: new Date().toISOString()
          }));
        }
        
        // Update local state with the new blog
        const currentBlogs = this.blogsSubject.getValue();
        this.blogsSubject.next([blog, ...currentBlogs]);
        
        return blog;
      }),
      catchError(error => {
        console.error('Error creating blog:', error);
        let errorMessage = 'Failed to create blog';
        if (error.error && error.error.message) {
          errorMessage += ': ' + error.error.message;
        }
        this.toast.error(errorMessage);
        return throwError(() => new Error(errorMessage));
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

  /**
   * Updates a blog with text content and optional file uploads
   * @param blogId The ID of the blog to update
   * @param formData FormData containing blog data and files
   * @returns Observable of the updated blog
   */
  updateBlogWithFiles(blogId: number, formData: FormData): Observable<any> {
    // Update to use the correct API endpoint
    const url = `${this.apiUrl}/blogs/${blogId}`;
    
    // Use PUT method for updates instead of POST, and set correct headers
    return this.http.post<any>(url, formData, {
      headers: new HttpHeaders({
        // Don't set Content-Type header when using FormData - browser will set it automatically with boundary
        'Accept': 'application/json'
      }),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      // Filter for response events
      filter(event => event.type === HttpEventType.Response),
      map(event => {
        if (event.type === HttpEventType.Response) {
          return event.body;
        }
        return null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating blog with files:', error);
        return throwError(() => new Error('Failed to update blog with files. Please try again later.'));
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

  /**
   * Updates a comment
   * @param blogId The ID of the blog
   * @param commentId The ID of the comment to update
   * @param content The updated comment content
   * @returns Observable of the updated comment
   */
  updateComment(blogId: number, commentId: number, content: string): Observable<Comment> {
    const url = `${this.apiUrl}/comments/${commentId}`;
    
    return this.http.put<any>(url, { content }).pipe(
      map(response => {
        // Extract the updated comment from the response
        let updatedComment;
        if (response && response.data) {
          updatedComment = response.data;
        } else if (response && response.comment) {
          updatedComment = response.comment;
        } else {
          updatedComment = response;
        }
        
        return updatedComment;
      }),
      catchError(error => {
        console.error('Error updating comment:', error);
        return throwError(() => new Error('Failed to update comment'));
      })
    );
  }

  /**
   * Deletes a comment
   * @param blogId The ID of the blog
   * @param commentId The ID of the comment to delete
   * @returns Observable of the delete operation result
   */
  deleteComment(blogId: number, commentId: number): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}`;
    
    return this.http.delete(url).pipe(
      catchError(error => {
        console.error('Error deleting comment:', error);
        return throwError(() => new Error('Failed to delete comment'));
      })
    );
  }

  getLoggedInUserId(): number {
    return this.loggedInUserId;
  }

  getLoggedInUserRole(): string | null {
    return this.loggedInUserRole;
  }

  // Add this to student-blog.service.ts
  ensureBlogExists(blogId: number): Observable<boolean> {
    // First check if it exists in our local state
    const currentBlogs = this.blogsSubject.getValue();
    const blogExists = currentBlogs.some(blog => Number(blog.id) === Number(blogId));
    
    if (blogExists) {
      return of(true);
    }
    
    // If not in local state, force a refresh from the server
    console.log('Blog not found in local state, refreshing from server...');
    return this.loadBlogsAsync().pipe(
      map(blogs => {
        const exists = blogs.some(blog => Number(blog.id) === Number(blogId));
        console.log(`After refresh, blog ${blogId} exists: ${exists}`);
        return exists;
      })
    );
  }

  // Add this async version of loadBlogs
  loadBlogsAsync(): Observable<Blog[]> {
    const studentId = this.loggedInUserId;
    return this.http.get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${studentId}`).pipe(
      map(response => {
        if (response && response.data) {
          // Update our subject
          this.blogsSubject.next(response.data);
          return response.data;
        } else {
          console.error('Invalid getBlogs response:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error in loadBlogsAsync:', error);
        return throwError(() => new Error('Failed to fetch blogs'));
      })
    );
  }

  // Add these methods
  startPolling(): void {
    // Poll every 30 seconds for updates
    this.pollingInterval = setInterval(() => {
      console.log('Polling for updates...');
      this.loadBlogsAsync().subscribe({
        next: () => console.log('Blogs refreshed through polling'),
        error: (error) => console.error('Error polling blogs:', error)
      });
    }, 30000); // 30 seconds
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.stopPolling(); // Only need to call this once
    // Other cleanup code...
  }

  getCommentAuthor(comment: Comment): string {
    // For tutor comments
    if (comment.tutor_id && comment.tutor && comment.tutor.name) {
      return comment.tutor.name; // Just return the tutor's name
    }
    
    // For student comments
    if (comment.student_id && comment.student && comment.student.name) {
      return comment.student.name; // Just return the student's name
    }
    
    // Fallback if objects aren't included but we know the role
    if (comment.tutor_id) {
      return `User #${comment.tutor_id}`;
    }
    
    if (comment.student_id) {
      return `User #${comment.student_id}`;
    }
    
    // Ultimate fallback
    return 'Anonymous User';
  }
}