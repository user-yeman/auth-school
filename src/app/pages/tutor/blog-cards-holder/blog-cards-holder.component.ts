import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BlogComponent } from './blogs/blog.component';
import { BlogService } from '../../../services/tutor/blogs/blog.service';
import { Blog } from '../../../model/tutor-blogs-model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogModelDialogComponent } from './blog-model-dialog/blog-model-dialog.component';
import { SkeletonComponent } from '../../../common/loading/skeleton/skeleton/skeleton.component';

@Component({
  selector: 'app-blog-cards-holder',
  standalone: true,
  imports: [BlogComponent, CommonModule, MatDialogModule, SkeletonComponent],
  templateUrl: './blog-cards-holder.component.html',
  styleUrls: ['./blog-cards-holder.component.css'],
})
export class BlogCardsHolderComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  filter: 'new' | 'old' = 'new';
  loggedInUserId: number = 0;
  studentId: number = 0;
  loggedInUserRole: string | null = null;
  loading: boolean = false;

  private userSubscription: Subscription | undefined;
  private routeSubscription: Subscription | undefined;

  constructor(
    private blogService: BlogService,
    private dialog: MatDialog,
    private authService: AuthService,
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const studentId = params.get('id');
      if (studentId) {
        this.studentId = +studentId;
        console.log('Student ID from route:', this.studentId);
        this.fetchBlogs();
      } else {
        console.error('Student ID not found in route');
        this.toastService.error('Student ID not found in route', 'Error');
      }
    });
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();
    console.log('Logged in user:', this.loggedInUserId, this.loggedInUserRole);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  fetchBlogs(studentId: number = this.studentId) {
    if (!studentId) {
      this.toastService.error(
        'Cannot fetch blogs: Student ID is not set',
        'Error'
      );
      return;
    }
    console.log('Fetching blogs for student ID:', studentId);
    this.loading = true;
    console.log('Loading set to true:', this.loading);
    this.cdr.detectChanges(); // Force UI update to show skeleton
    this.blogService.getBlogs(studentId).subscribe({
      next: (blogs) => {
        console.log('Fetched blogs:', blogs);
        this.blogs = blogs || [];
        this.applyFilter();
        this.loading = false;
        console.log('Loading set to false:', this.loading);
        this.cdr.detectChanges(); // Force UI update after fetching
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.toastService.error('Failed to fetch blogs', 'Error');
        this.blogs = [];
        this.applyFilter();
        this.loading = false;
        console.log('Loading set to false (error):', this.loading);
        this.cdr.detectChanges(); // Force UI update on error
      },
    });
  }

  onFilterChange(event: Event) {
    this.filter = (event.target as HTMLSelectElement).value as 'new' | 'old';
    console.log('Filter changed to:', this.filter);
    this.applyFilter();
  }

  applyFilter() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    if (this.filter === 'new') {
      this.filteredBlogs = this.blogs.filter((blog) => {
        if (!blog || !blog.created_at) {
          console.warn('Blog missing created_at:', blog);
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt > thresholdDate;
      });
    } else {
      this.filteredBlogs = this.blogs.filter((blog) => {
        if (!blog || !blog.created_at) {
          console.warn('Blog missing created_at:', blog);
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt <= thresholdDate;
      });
    }
    console.log('Filtered blogs:', this.filteredBlogs);
    this.cdr.detectChanges();
  }

  canEdit(blog: Blog): boolean {
    return (
      blog.author_role === 'tutor' && blog.tutor_id === this.loggedInUserId
    );
  }

  openAddDialog() {
    console.log('Opening add blog dialog');
    const dialogRef = this.dialog.open(BlogModelDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with result:', result);
      if (result) {
        result.blog.student_id = this.studentId;
        result.blog.tutor_id = this.loggedInUserId;
        console.log(
          'Adding blog with data:',
          result.blog,
          'Files:',
          result.files
        );
        this.blogService.addBlog(result.blog, result.files).subscribe({
          next: () => {
            console.log('Blog added successfully');
            this.toastService.success('Blog added successfully', 'Success');
            this.fetchBlogs(); // Refresh the blog list
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error adding blog:', error);
            this.toastService.error('Failed to add blog', 'Error');
            this.cdr.detectChanges();
          },
        });
      } else {
        console.log('Dialog closed without adding a blog');
      }
    });
  }

  onEditBlog(blog: Blog) {
    const dialogRef = this.dialog.open(BlogModelDialogComponent, {
      width: '500px',
      data: { blog },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || !result.blog) {
        console.error('Invalid result from dialog:', result);
        this.toastService.error('Failed to update blog: Invalid data', 'Error');
        this.cdr.detectChanges();
        return;
      }

      result.blog.student_id = this.studentId;

      this.blogService.updateBlog(result.blog, result.files).subscribe({
        next: () => {
          console.log('Blog updated successfully');
          this.fetchBlogs();
          this.toastService.success('Blog updated successfully', 'Success');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating blog:', error);
          this.toastService.error('Failed to update blog', 'Error');
          this.cdr.detectChanges();
        },
      });
    });
  }

  onDeleteBlog(blogId: number) {
    this.blogService.deleteBlog(blogId).subscribe({
      next: () => {
        this.fetchBlogs();
        this.toastService.success('Blog deleted successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting blog:', error);
        this.toastService.error('Failed to delete blog', 'Error');
        this.cdr.detectChanges();
      },
    });
  }

  onAddComment(blogId: number, content: string) {
    this.blogService.addComment(blogId, content).subscribe({
      next: (newComment) => {
        this.fetchBlogs();
        this.toastService.success('Comment added successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.toastService.error('Failed to add comment', 'Error');
        this.cdr.detectChanges();
      },
    });
  }
}
