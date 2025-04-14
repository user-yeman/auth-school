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
    // Ensure we have valid user ID information before proceeding
    if (!this.loggedInUserId) {
      console.error('Cannot add comment: No logged-in user ID');
      this.toast.error('You must be logged in to comment', 'Error');
      return throwError(() => new Error('No logged-in user ID'));
    }

    // Create the comment object with correct properties based on API requirements
    const comment: any = {
      content: content.trim(),
      blog_id: blogId
    };

    // Add the correct ID field based on user role
    if (this.loggedInUserRole === 'student') {
      comment.student_id = this.loggedInUserId;
    } else if (this.loggedInUserRole === 'tutor') {
      comment.tutor_id = this.loggedInUserId;
    } else {
      console.error('Cannot add comment: Unknown user role', this.loggedInUserRole);
      this.toast.error('Unknown user role', 'Error');
      return throwError(() => new Error('Unknown user role'));
    }

    console.log('Sending comment data:', comment);

    return this.http.post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment).pipe(
      tap(response => console.log('Comment creation response:', response)),
      map(response => {
        // Check if response has the expected structure
        if (!response || !response.comment) {
          console.error('Invalid comment response format:', response);
          throw new Error('Invalid response format');
        }

        // Update the blogs subject with the new comment
        const newComment = response.comment;
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
        
        return response.comment;
      }),
      catchError(error => {
        console.error('Error adding comment:', error);
        
        // Get more detailed error information if available
        let errorMessage = 'Failed to add comment';
        if (error.error && error.error.message) {
          errorMessage += ': ' + error.error.message;
        } else if (error.error && error.error.errors) {
          // Laravel validation errors often come in this format
          const validationErrors = Object.values(error.error.errors).flat();
          if (validationErrors.length > 0) {
            errorMessage += ': ' + validationErrors.join(', ');
          }
        }
        
        this.toast.error(errorMessage, 'Error');
        return throwError(() => new Error(errorMessage));
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
    console.log('Files to upload:', files);
    
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
    
    // Accept any response format
    return this.http.post<any>(`${this.apiUrl}/blogs`, formData).pipe(
      tap(response => console.log('Blog creation response:', response)),
      map(response => {
        // Handle different response formats
        let blog: Blog;
        
        if (response && response.data) {
          blog = response.data;
        } else if (response && response.blog) {
          blog = response.blog;
        } else if (response && response.id) {
          blog = response;
        } else {
          // Create a basic blog structure if the response doesn't match expected formats
          const username = this.authService.getUserName() || 'Anonymous';
          blog = {
            id: response?.id || -new Date().getTime(),
            title: blogData.title || 'Untitled',
            content: blogData.content || '',
            student_id: blogData.student_id,
            author_role: blogData.author_role || 'student',
            author: username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            comments: [],
            documents: [] // Initialize empty documents array
          } as unknown as Blog;
        }
        
        // If the API doesn't return documents/files, but we have local files,
        // add them to the blog object for UI display purposes
        if (files && files.length > 0 && (!blog.documents || blog.documents.length === 0)) {
          blog.documents = files.map(file => ({
            id: Math.random(), // Temporary ID
            name: file.name,
            size: file.size,
            file_path: URL.createObjectURL(file), // Create temporary URL for display
            mime_type: file.type,
            created_at: new Date().toISOString()
          }));
        }
        
        // Update the blogs subject with the new blog
        const currentBlogs = this.blogsSubject.getValue();
        this.blogsSubject.next([blog, ...currentBlogs]);
        
        return blog;
      }),
      catchError(error => {
        console.error('Error creating blog:', error);
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