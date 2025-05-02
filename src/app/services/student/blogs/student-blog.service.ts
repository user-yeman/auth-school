import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpHeaders,
  HttpErrorResponse,
  HttpEventType,
} from '@angular/common/http';
import {
  Observable,
  catchError,
  map,
  tap,
  throwError,
  BehaviorSubject,
  of,
  Subscription,
  filter,
  interval,
  EMPTY,
  switchMap,
} from 'rxjs';
import {
  ApiCommentResponse,
  ApiResponse,
  Blog,
  Comment,
} from '../../../model/student-blogs-model';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';
// Add these imports
import { Router, NavigationStart, Event as RouterEvent } from '@angular/router';

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

  // Add these properties to track state
  private recentlyAddedBlogIds: Set<number> = new Set();
  private deletedBlogIds: Set<number> = new Set();
  private lastPollTime: string = new Date().toISOString();

  constructor(
    private http: HttpClient,
    private toast: ToastrService,
    private authService: AuthService,
    private router: Router // Add router
  ) {
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();

    // Load blogs initially
    this.loadBlogs();

    // Start polling only if we're on the blog page
    if (this.router.url.includes('/student/student-blog')) {
      this.startPolling();
    }

    // Add navigation event listener
    this.subscription.add(
      this.router.events.subscribe((event: RouterEvent) => {
        if (event instanceof NavigationStart) {
          const navigatingToBlog = event.url.includes('/student/student-blog');
          const currentlyOnBlog = this.router.url.includes('/student/student-blog');

          // If navigating away from blog page, stop polling
          if (currentlyOnBlog && !navigatingToBlog) {
            console.log('Navigating away from blogs, stopping polling');
            this.stopPolling();
          }

          // If navigating to blog page and not currently on it, start polling
          if (!currentlyOnBlog && navigatingToBlog) {
            console.log('Navigating to blogs, starting polling');
            this.startPolling();
          }
        }
      })
    );
  }

  // Modify the loadBlogs method to preserve author information during refresh
  private loadBlogs(): void {
    const studentId = this.loggedInUserId;
    this.http
      .get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${studentId}`)
      .pipe(
        tap((response) => console.log('Raw getBlogs response:', response)),
        map((response) => {
          if (response && response.data) {
            // Get current blogs from our subject to preserve important details
            const currentBlogs = this.blogsSubject.getValue();

            // Merge server data with current data to preserve author info
            return response.data.map((serverBlog) => {
              // Find matching blog in our current list
              const existingBlog = currentBlogs.find(
                (blog) => blog.id === serverBlog.id
              );

              // If we have a local version with author info, preserve it
              if (existingBlog && !serverBlog.author && existingBlog.author) {
                return {
                  ...serverBlog,
                  author: existingBlog.author,
                  author_role: existingBlog.author_role || 'student',
                };
              }

              return serverBlog;
            });
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
      )
      .subscribe({
        next: (blogs) => {
          // Also preserve author info for blogs created locally
          const currentBlogs = this.blogsSubject.getValue();
          const mergedBlogs = blogs.map((serverBlog) => {
            const localBlog = currentBlogs.find((b) => b.id === serverBlog.id);
            if (localBlog && localBlog.author && !serverBlog.author) {
              return {
                ...serverBlog,
                author: localBlog.author,
                author_role: localBlog.author_role,
              };
            }
            return serverBlog;
          });

          this.blogsSubject.next(mergedBlogs);
        },
        error: (error) => {
          console.error('Error loading blogs:', error);
        },
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
    console.log(
      'Adding comment - blog ID type:',
      typeof blogId,
      'Value:',
      blogId
    );

    // Make sure blogId is actually a number
    if (!blogId || isNaN(Number(blogId))) {
      this.toast.error('Invalid blog ID', 'Error');
      return throwError(() => new Error('Invalid blog ID'));
    }

    // Ensure blog ID exists in our current blogs
    const currentBlogs = this.blogsSubject.getValue();
    const blogExists = currentBlogs.some(
      (blog) => Number(blog.id) === Number(blogId)
    );

    console.log('Blog exists in local state:', blogExists);
    if (!blogExists) {
      console.warn(
        'Attempting to comment on blog that may not exist in database yet'
      );
      // This could be the issue - the blog might not be properly synchronized with the backend
    }

    const comment: any = {
      content: content.trim(),
      blog_id: Number(blogId), // Ensure it's a number
    };

    if (this.loggedInUserRole === 'student') {
      comment.student_id = this.loggedInUserId;
    } else if (this.loggedInUserRole === 'tutor') {
      comment.tutor_id = this.loggedInUserId;
    }

    console.log('Sending comment data:', comment);

    return this.http
      .post<ApiCommentResponse<Comment>>(`${this.apiUrl}/comments`, comment)
      .pipe(
        tap((response) => console.log('Comment creation response:', response)),
        map((response) => {
          if (!response || !response.comment) {
            throw new Error('Invalid response format');
          }

          this.updateBlogsWithNewComment(blogId, response.comment);

          return response.comment;
        }),
        catchError((error) => {
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

    const updatedBlogs = currentBlogs.map((blog) => {
      if (blog.id === blogId) {
        return {
          ...blog,
          comments: blog.comments
            ? [...blog.comments, newComment]
            : [newComment],
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

    return this.http
      .get(url, {
        observe: 'response',
        responseType: 'blob',
        headers: new HttpHeaders({
          Accept: 'application/octet-stream',
        }),
      })
      .pipe(
        catchError((error) => {
          console.error('Error downloading file:', error);
          return throwError(() => new Error('Failed to download file'));
        })
      );
  }

  // Fix the tempBlog undefined error in the addBlog method
  addBlog(blogData: any, files: File[] = []): Observable<Blog> {
    console.log('Adding blog with data:', blogData);

    const formData = new FormData();

    // Add blog data to form data
    if (blogData.title) formData.append('title', blogData.title);
    if (blogData.content) formData.append('content', blogData.content);

    // Always include author info explicitly
    const authorName = blogData.author || 'Anonymous';
    formData.append('author', authorName);
    formData.append(
      'author_role',
      blogData.author_role || this.loggedInUserRole || 'student'
    );

    if (blogData.student_id)
      formData.append('student_id', String(blogData.student_id));

    // Add files if present
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`documents[${index}]`, file, file.name);
      });
    }

    // Make the request
    return this.http.post<any>(`${this.apiUrl}/blogs`, formData).pipe(
      tap((response) => {
        console.log('Blog creation raw response:', response);

        // Display success message from API if available
        if (response && response.message) {
          this.toast.success(response.message);
        }
      }),
      switchMap((response) => {
        // Extract blog ID if available in response
        let blogId: number | undefined;

        if (response && response.data && response.data.id) {
          blogId = response.data.id;
        } else if (response && response.blog && response.blog.id) {
          blogId = response.blog.id;
        }

        // Create a temporary blog entry immediately for the UI
        const tempBlog: Blog = {
          id: blogId || 0, // Using 0 as fallback if no ID is available
          title: blogData.title || 'Untitled',
          content: blogData.content || '',
          student_id: this.loggedInUserId,
          author: blogData.author || 'Anonymous',
          author_role: this.loggedInUserRole || 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          comments: [],
        };

        // Only add to tracking and UI if we have a valid ID
        if (blogId) {
          // Add to tracking
          this.recentlyAddedBlogIds.add(blogId);

          // Add to UI immediately
          const currentBlogs = this.blogsSubject.getValue();
          this.forceUiRefresh([tempBlog, ...currentBlogs]);
        }

        // Then refresh from server
        return new Observable<Blog>((observer) => {
          setTimeout(() => {
            // Explicitly call API to get fresh data
            this.http
              .get<ApiResponse<Blog[]>>(
                `${this.apiUrl}/blogs/${this.loggedInUserId}`
              )
              .subscribe({
                next: (response) => {
                  if (response && response.data) {
                    // Update with server data
                    let serverBlogs = response.data;

                    // Find the newly created blog
                    let newBlog = blogId
                      ? serverBlogs.find((blog) => blog.id === blogId)
                      : null;

                    // Update our subject with latest data from server
                    this.blogsSubject.next(serverBlogs);

                    // Complete the observable with the new blog
                    observer.next(newBlog || tempBlog);
                    observer.complete();
                  } else {
                    // If server doesn't return data, use our temp blog
                    observer.next(tempBlog);
                    observer.complete();
                  }
                },
                error: (error) => {
                  console.error(
                    'Error fetching updated blogs after creation:',
                    error
                  );
                  observer.next(tempBlog); // Return temp blog on error
                  observer.complete();
                },
              });
          }, 300); // Reduced from 1000ms to 300ms for faster response
        });
      }),
      catchError((error) => {
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

  // Optimize updateBlog to reduce unnecessary API calls
  updateBlog(
    blogId: number,
    data: { title: string; content: string }
  ): Observable<Blog> {
    // Create FormData to match API expectations
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);

    // First update UI immediately for better UX
    const currentBlogs = this.blogsSubject.getValue();
    const existingBlog = currentBlogs.find((blog) => blog.id === blogId);

    if (existingBlog) {
      // Create an updated version
      const updatedBlog: Blog = {
        ...existingBlog,
        title: data.title || existingBlog.title,
        content: data.content || existingBlog.content,
        updated_at: new Date().toISOString(),
      };

      // Update in our subject immediately for responsive UI
      const updatedBlogs = currentBlogs.map((blog) =>
        blog.id === blogId ? updatedBlog : blog
      );
      this.forceUiRefresh(updatedBlogs);
    }

    // Use POST as specified in your API documentation
    return this.http.post<any>(`${this.apiUrl}/blogs/${blogId}`, formData).pipe(
      tap((response) => {
        console.log('Blog update response:', response);

        // Show success message if available
        if (response && response.message) {
          this.toast.success(response.message);
        } else {
          this.toast.success('Blog updated successfully');
        }

        // Immediately trigger refresh - no delay
        this.refreshSingleBlog(blogId).subscribe({
          next: (updatedBlog) => {
            if (updatedBlog) {
              // Update was already handled in refreshSingleBlog
              console.log('Blog refreshed successfully from server');
            }
          },
          error: (err) => console.error('Error refreshing single blog:', err),
        });
      }),
      map(() => {
        // Return the locally updated blog for immediate use
        const blogs = this.blogsSubject.getValue();
        const blog = blogs.find((b) => b.id === blogId);
        if (!blog) {
          throw new Error('Blog not found');
        }
        return blog;
      }),
      catchError((error) => {
        console.error('Error updating blog:', error);
        this.toast.error('Failed to update blog', 'Error');
        return throwError(() => new Error('Failed to update blog'));
      })
    );
  }

  // Add a method to refresh a single blog instead of the whole list
  private refreshSingleBlog(blogId: number): Observable<Blog | null> {
    console.log(`Refreshing single blog: ${blogId}`);
    return this.http
      .get<ApiResponse<Blog>>(`${this.apiUrl}/blogs/${blogId}`)
      .pipe(
        tap((response) =>
          console.log('Single blog refresh response:', response)
        ),
        map((response) => {
          if (response && response.data) {
            // Got single blog data
            const serverBlog = response.data;

            // Preserve important fields if needed
            const currentBlogs = this.blogsSubject.getValue();
            const localBlog = currentBlogs.find((blog) => blog.id === blogId);

            // Update local collection immediately
            if (localBlog) {
              // If server doesn't provide author but we have it locally, preserve it
              if (!serverBlog.author && localBlog.author) {
                serverBlog.author = localBlog.author;
                serverBlog.author_role = localBlog.author_role;
              }

              // Update this one blog immediately
              const updatedBlogs = currentBlogs.map((blog) =>
                blog.id === blogId ? serverBlog : blog
              );
              this.blogsSubject.next(updatedBlogs);
            }

            return serverBlog;
          }
          return null;
        }),
        catchError((error) => {
          console.error(`Error fetching single blog ${blogId}:`, error);
          return of(null);
        })
      );
  }

  // Optimize updateBlogWithFiles similarly
  updateBlogWithFiles(blogId: number, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/blogs/${blogId}`;

    return this.http
      .post<any>(url, formData, {
        headers: new HttpHeaders({ Accept: 'application/json' }),
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        filter((event) => event.type === HttpEventType.Response),
        tap((event) => {
          if (event.type === HttpEventType.Response) {
            const response = event.body;

            // Show success message
            if (response && response.message) {
              this.toast.success(response.message);
            } else {
              this.toast.success('Blog updated successfully');
            }

            // Refresh just this blog - immediately, no delay
            this.refreshSingleBlog(blogId).subscribe({
              next: (updatedBlog) => {
                // Already handled in refreshSingleBlog
                console.log('Blog with files refreshed successfully');
              },
            });
          }
        }),
        map((event) => {
          if (event.type === HttpEventType.Response) {
            return event.body;
          }
          return null;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating blog with files:', error);
          this.toast.error('Failed to update blog with files');
          return throwError(
            () => new Error('Failed to update blog with files')
          );
        })
      );
  }

  // Update deleteBlog to track deleted blogs
  deleteBlog(blogId: number): Observable<any> {
    // First update UI immediately for better UX
    const currentBlogs = this.blogsSubject.getValue();
    const updatedBlogs = currentBlogs.filter((blog) => blog.id !== blogId);
    this.forceUiRefresh(updatedBlogs);
    this.deletedBlogIds.add(blogId);

    // Then send request to server
    return this.http.delete<any>(`${this.apiUrl}/blogs/${blogId}`).pipe(
      tap((response) => {
        console.log('Blog deleted successfully:', response);

        // Show success notification
        if (response && response.message) {
          this.toast.success(response.message);
        } else {
          this.toast.success('Blog deleted successfully');
        }

        // Refresh from server after deletion to ensure synchronization
        setTimeout(() => {
          this.http
            .get<ApiResponse<Blog[]>>(
              `${this.apiUrl}/blogs/${this.loggedInUserId}`
            )
            .subscribe({
              next: (response) => {
                if (response && response.data) {
                  // Update with filtered data
                  const serverBlogs = response.data.filter(
                    (blog) => !this.deletedBlogIds.has(blog.id)
                  );
                  this.blogsSubject.next(serverBlogs);
                }
              },
              error: (error) =>
                console.error(
                  'Error fetching updated blogs after deletion:',
                  error
                ),
            });
        }, 300); // Reduced from 1000ms to 300ms
      }),
      catchError((error) => {
        console.error('Error deleting blog:', error);
        this.toast.error('Failed to delete blog', 'Error');

        // Revert UI change on error
        this.blogsSubject.next(currentBlogs);
        this.deletedBlogIds.delete(blogId);

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
  updateComment(
    blogId: number,
    commentId: number,
    content: string
  ): Observable<Comment> {
    const url = `${this.apiUrl}/comments/${commentId}`;

    return this.http.put<any>(url, { content }).pipe(
      map((response) => {
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
      catchError((error) => {
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
      catchError((error) => {
        console.error('Error deleting comment:', error);
        return throwError(() => new Error('Failed to delete comment'));
      })
    );
  }

  getLoggedInUserId(): number {
    return this.loggedInUserId;
  }

  getLoggedInUserRole(): string | null {
    // Always get the fresh role directly from the auth service
    const currentRole = this.authService.getUserRole();
    
    // Update our cached value
    this.loggedInUserRole = currentRole;
    
    console.log('Current user role from auth service:', currentRole);
    return currentRole;
  }

  // Add this to student-blog.service.ts
  ensureBlogExists(blogId: number): Observable<boolean> {
    // First check if it exists in our local state
    const currentBlogs = this.blogsSubject.getValue();
    const blogExists = currentBlogs.some(
      (blog) => Number(blog.id) === Number(blogId)
    );

    if (blogExists) {
      return of(true);
    }

    // If not in local state, force a refresh from the server
    console.log('Blog not found in local state, refreshing from server...');
    return this.loadBlogsAsync().pipe(
      map((blogs) => {
        const exists = blogs.some((blog) => Number(blog.id) === Number(blogId));
        console.log(`After refresh, blog ${blogId} exists: ${exists}`);
        return exists;
      })
    );
  }

  // Also update loadBlogsAsync similarly to ensure author consistency
  loadBlogsAsync(): Observable<Blog[]> {
    const studentId = this.loggedInUserId;
    return this.http
      .get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${studentId}`)
      .pipe(
        map((response) => {
          if (response && response.data) {
            // Filter out any blogs that have been deleted locally
            let serverBlogs = response.data.filter(
              (blog) => !this.deletedBlogIds.has(blog.id)
            );

            // Get current blogs from our subject
            const currentBlogs = this.blogsSubject.getValue();

            // Preserve author info during merge
            serverBlogs = serverBlogs.map((serverBlog) => {
              const existingBlog = currentBlogs.find(
                (blog) => blog.id === serverBlog.id
              );
              if (existingBlog && !serverBlog.author && existingBlog.author) {
                return {
                  ...serverBlog,
                  author: existingBlog.author,
                  author_role: existingBlog.author_role,
                };
              }
              return serverBlog;
            });

            // Merge any pending local changes with server data
            serverBlogs = this.mergeLocalChanges(currentBlogs, serverBlogs);

            // Update our subject
            this.blogsSubject.next(serverBlogs);
            return serverBlogs;
          } else {
            console.error('Invalid getBlogs response:', response);
            return [];
          }
        }),
        catchError((error) => {
          console.error('Error in loadBlogsAsync:', error);
          return throwError(() => new Error('Failed to fetch blogs'));
        })
      );
  }

  // Update your mergeLocalChanges method to ensure author consistency
  private mergeLocalChanges(localBlogs: Blog[], serverBlogs: Blog[]): Blog[] {
    // Find locally added blogs that aren't on the server yet
    const newLocalBlogs = localBlogs.filter(
      (localBlog) =>
        this.recentlyAddedBlogIds.has(localBlog.id) &&
        !serverBlogs.some((serverBlog) => serverBlog.id === localBlog.id)
    );

    if (newLocalBlogs.length > 0) {
      console.log(
        'Keeping newly added blogs that are not yet on server:',
        newLocalBlogs.map((b) => b.id)
      );

      // Add these to our server blogs list
      serverBlogs = [...newLocalBlogs, ...serverBlogs];
    }

    // Also ensure consistent author info for any modified blogs
    serverBlogs = serverBlogs.map((serverBlog) => {
      const localBlog = localBlogs.find((b) => b.id === serverBlog.id);
      // If local blog has author info but server doesn't, preserve the local author info
      if (localBlog && localBlog.author && !serverBlog.author) {
        return {
          ...serverBlog,
          author: localBlog.author,
          author_role: localBlog.author_role,
        };
      }
      return serverBlog;
    });

    return serverBlogs;
  }

  /**
   * Refreshes blog data from the server after operations
   * @param blogId Optional specific blog ID to refresh
   * @returns Observable of refreshed blogs
   */
  private refreshAfterOperation(blogId?: number): Observable<Blog[]> {
    console.log(
      'Refreshing blog data after operation',
      blogId ? `for blog ID: ${blogId}` : 'for all blogs'
    );

    return this.http
      .get<ApiResponse<Blog[]>>(`${this.apiUrl}/blogs/${this.loggedInUserId}`)
      .pipe(
        map((response) => {
          if (response && response.data) {
            // Filter out deleted blogs
            let serverBlogs = response.data.filter(
              (blog) => !this.deletedBlogIds.has(blog.id)
            );

            // Get current blogs for author preservation
            const currentBlogs = this.blogsSubject.getValue();

            // Ensure author information is preserved
            serverBlogs = serverBlogs.map((serverBlog) => {
              const localBlog = currentBlogs.find(
                (b) => b.id === serverBlog.id
              );
              if (localBlog && localBlog.author && !serverBlog.author) {
                return {
                  ...serverBlog,
                  author: localBlog.author,
                  author_role: localBlog.author_role || 'student',
                };
              }
              return serverBlog;
            });

            // Update subject with refreshed data
            this.blogsSubject.next(serverBlogs);
            return serverBlogs;
          } else {
            console.error('Invalid response during refresh:', response);
            return this.blogsSubject.getValue();
          }
        }),
        catchError((error) => {
          console.error('Error refreshing after operation:', error);
          return of(this.blogsSubject.getValue());
        })
      );
  }

  // Update the polling mechanism to be more efficient
  startPolling(): void {
    // First stop any existing polling to prevent duplicates
    this.stopPolling();

    console.log('Starting blog polling');
    this.pollingInterval = setInterval(() => {
      console.log('Polling for blog updates...');
      this.efficientPoll().subscribe({
        next: () => console.log('Blogs refreshed through polling'),
        error: (error) => console.error('Error polling blogs:', error),
      });
    }, 30000); // 30 seconds
  }

  // Efficient polling that only updates what's needed
  private efficientPoll(): Observable<boolean> {
    return this.http
      .get<ApiResponse<Blog[]>>(
        `${this.apiUrl}/blogs/${this.loggedInUserId}?updatedSince=${this.lastPollTime}`
      )
      .pipe(
        map((response) => {
          if (response && response.data) {
            // Filter out deleted blogs
            const serverBlogs = response.data.filter(
              (blog) => !this.deletedBlogIds.has(blog.id)
            );

            // Only update what's changed
            this.smartMergeWithExistingBlogs(serverBlogs);

            // Update last poll time
            this.lastPollTime = new Date().toISOString();
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error('Error during poll:', error);
          return of(false);
        })
      );
  }

  // Add a smart merge function
  private smartMergeWithExistingBlogs(serverBlogs: Blog[]): void {
    // Get current blogs
    const currentBlogs = this.blogsSubject.getValue();

    // Create a new list for the result
    const mergedBlogs = [...currentBlogs];

    // For each server blog, update or add it
    for (const serverBlog of serverBlogs) {
      const index = mergedBlogs.findIndex((blog) => blog.id === serverBlog.id);

      if (index !== -1) {
        // Blog exists, update it while preserving important fields
        if (!serverBlog.author && mergedBlogs[index].author) {
          serverBlog.author = mergedBlogs[index].author;
          serverBlog.author_role = mergedBlogs[index].author_role;
        }
        mergedBlogs[index] = serverBlog;
      } else {
        // Blog doesn't exist, add it
        mergedBlogs.unshift(serverBlog); // Add to the front
      }
    }

    // Update the subject
    this.blogsSubject.next(mergedBlogs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      console.log('Stopping blog polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
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

  /**
   * Checks if the current user is the author of a comment
   * @param comment The comment to check
   * @returns Boolean indicating if the user is the author
   */
  isCommentAuthor(comment: Comment): boolean {
    const userId = this.getLoggedInUserId();
    const userRole = this.getLoggedInUserRole();
    
    // Log for debugging
    console.log('Checking comment author:', {
      commentId: comment.id,
      commentTutorId: comment.tutor_id,
      commentStudentId: comment.student_id,
      currentUserId: userId,
      currentUserRole: userRole
    });
    
    // Compare based on the current user's role
    if (userRole === 'student') {
      return comment.student_id === userId;
    } else if (userRole === 'tutor') {
      return comment.tutor_id === userId;
    }
    
    return false;
  }

  // Add this method to ensure changes are reflected immediately in the UI
  private forceUiRefresh(updatedBlogs: Blog[]): void {
    // This creates a new array reference, which forces Angular change detection
    this.blogsSubject.next([...updatedBlogs]);
  }

  // Add a new utility method to handle quick refresh when needed
  quickRefreshBlog(blogId: number): void {
    console.log(`Quick refreshing blog ${blogId}`);
    this.http
      .get<ApiResponse<Blog>>(`${this.apiUrl}/blogs/${blogId}`)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            const serverBlog = response.data;
            const currentBlogs = this.blogsSubject.getValue();
            const localBlog = currentBlogs.find((blog) => blog.id === blogId);

            if (localBlog) {
              // Preserve author if needed
              if (!serverBlog.author && localBlog.author) {
                serverBlog.author = localBlog.author;
                serverBlog.author_role = localBlog.author_role;
              }

              // Update immediately
              const updatedBlogs = currentBlogs.map((blog) =>
                blog.id === blogId ? serverBlog : blog
              );
              this.forceUiRefresh(updatedBlogs);
            }
          }
        },
        error: (error) => console.error(`Error in quick refresh: ${error}`),
      });
  }
}
