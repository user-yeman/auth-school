import { Component, OnInit } from '@angular/core';
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
    StudentHeaderComponent
  ],
  templateUrl: './student-blog.component.html',
  styleUrls: ['./student-blog.component.css']
})
export class StudentBlogComponent implements OnInit {
  studentData: any;
  lastLoginFromSession: string|undefined;
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  isLoading: boolean = true;
  filter: 'new' | 'old' = 'new';
  loggedInUserId: number = 0;
  loggedInUserRole: string | null = null;

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

  fetchBlogs(): void {
    this.isLoading = true;
    this.blogService.getBlogs().subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load blogs');
      }
    });
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
    this.fetchBlogs();
  }

  onBlogDeleted(blogId: number): void {
    this.blogs = this.blogs.filter(blog => blog.id !== blogId);
    this.applyFilter();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(BlogModelDialogComponent, {
      width: '600px',
      data: { 
        tutorId: this.studentData?.tutor_id || null,
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // The dialog returns a blog object and optionally files
        this.blogService.addBlog(result.blog, result.files || []).subscribe({
          next: () => {
            this.toastService.success('Blog created successfully');
            this.fetchBlogs();
          },
          error: (error: Error) => { // Specify the type as Error
            console.error('Error creating blog:', error);
            this.toastService.error('Failed to create blog');
          }
        });
      }
    });
  }
}