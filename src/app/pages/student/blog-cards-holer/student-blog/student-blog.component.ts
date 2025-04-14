import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog } from '../../../../model/student-blogs-model';
import { StudentBlogService } from '../../../../services/student/blogs/student-blog.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { StudentHeaderComponent } from '../../student-header/student-header/student-header.component';
import { BlogModelDialogComponent } from '../blog-model-dialog/blog-model-dialog.component';
import { AuthService } from '../../../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-blog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    BlogCardComponent,
    StudentHeaderComponent,
    HttpClientModule
  ],
  templateUrl: './student-blog.component.html',
  styleUrls: ['./student-blog.component.css']
})
export class StudentBlogComponent implements OnInit, OnDestroy {
  studentData: any;
  lastLoginFromSession: string | undefined;
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  isLoading = true;
  filter: 'new' | 'old' = 'new';
  loggedInUserId: number = 0;
  loggedInUserRole: string | null = null;

  private subscription = new Subscription();

  constructor(
    private blogService: StudentBlogService,
    private dialog: MatDialog,
    private toastService: ToastrService,
    private authService: AuthService
  ) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();

    // Get last login from session storage
    const storedLastLogin = sessionStorage.getItem('lastLogin');
    if (storedLastLogin) {
      this.lastLoginFromSession = storedLastLogin;
    }

    // Get student data - Modified approach to avoid the subscribe error
    this.loadUserData();
  }

  // Updated method to load user data
  loadUserData(): void {
    try {
      // Instead of checking the observable, use the AuthService directly
      // and get user details from session storage if needed

      // Get username from auth service or session storage
      const userName = sessionStorage.getItem('userName') || 'Student';

      // Get user ID from session storage or auth service
      const userId = sessionStorage.getItem('userId') || this.loggedInUserId.toString();

      // Create a basic student data object from available info
      this.studentData = {
        name: userName,
        id: userId,
        last_login_at: this.lastLoginFromSession,
        // Add other required properties
        tutor_id: sessionStorage.getItem('tutorId') || null
      };

      // If your AuthService has a method that returns user info synchronously, use it here
      // For example: this.studentData = this.authService.getUserDetailsSync();

      // If you need to fetch fresh data from an API, you would need to modify the AuthService
      // to return an Observable<UserData> instead of void
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  }

  ngOnInit(): void {
    this.fetchBlogs();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  fetchBlogs(): void {
    this.isLoading = true;

    // Subscribe to the blogs$ observable from the service
    this.subscription.add(
      this.blogService.blogs$.subscribe({
        next: (blogs) => {
          this.blogs = blogs;
          this.filteredBlogs = [...blogs]; // Copy the array
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching blogs:', error);
          this.toastService.error('Failed to load blogs');
          this.isLoading = false;
        }
      })
    );

    // Trigger loading of blogs
    this.blogService.getBlogs();
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filter = target.value as 'new' | 'old';
    this.applyFilter();
  }

  applyFilter(): void {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    if (this.filter === 'new') {
      this.filteredBlogs = this.blogs.filter(blog => {
        if (!blog || !blog.created_at) {
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt > thresholdDate;
      });
    } else {
      this.filteredBlogs = this.blogs.filter(blog => {
        if (!blog || !blog.created_at) {
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt <= thresholdDate;
      });
    }
  }

  onAddComment(blogId: number, content: string): void {
    this.blogService.addComment(blogId, content).subscribe({
      next: () => {
        this.fetchBlogs();
        this.toastService.success('Comment added successfully');
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.toastService.error('Failed to add comment');
      }
    });
  }

  onBlogUpdated(): void {
    // No need to manually refresh - the service handles that
    console.log('Blog updated');
  }

  onBlogDeleted(blogId: number): void {
    // No need to manually update arrays - the service handles that
    console.log('Blog deleted:', blogId);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(BlogModelDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        mode: 'create',
        tutorId: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        
        console.log('Dialog returned:', result);
        
        // Get the blog data from the result
        const blogData = result.blog || {};
        
        // Ensure title and content are not undefined
        blogData.title = blogData.title || 'Untitled';
        blogData.content = blogData.content || '';
        
        // Make sure student_id is set
        if (!blogData.student_id) {
          blogData.student_id = this.authService.getUserId();
        }
        
        // Call the service to add the blog
        this.blogService.addBlog(blogData, result.files || []).subscribe({
          next: (createdBlog) => {
            console.log('Blog created successfully:', createdBlog);
            
            // The service now handles updating the blogs array via the subject
            // No need to manually update arrays here
            
            this.toastService.success('Blog created successfully');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating blog:', error);
            this.toastService.error('Failed to create blog. Please try again.');
            this.isLoading = false;
          }
        });
      }
    });
  }
}