import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BlogComponent } from './blogs/blog.component';
import { BlogService } from '../../../services/tutor/blogs/blog.service';
import { Blog, Comment } from '../../../model/tutor-blogs-model';
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

        this.fetchBlogs();
      } else {
        console.error('Student ID not found in route');
        this.toastService.error('Student ID not found in route', 'Error');
      }
    });
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUserRole = this.authService.getUserRole();
  }

  ngOnDestroy() {
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

    this.loading = true;
    this.cdr.markForCheck();
    this.blogService.getBlogs(studentId).subscribe({
      next: (blogs) => {
        this.blogs = [...(blogs || [])];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
        console.log('Blogs updated:', this.blogs);
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.toastService.error('Failed to fetch blogs', 'Error');
        this.blogs = [];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
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
    this.filteredBlogs = [
      ...this.blogs.filter((blog) => {
        if (!blog || !blog.created_at) {
          console.warn('Blog missing created_at:', blog);
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return (
          !isNaN(createdAt.getTime()) &&
          (this.filter === 'new'
            ? createdAt > thresholdDate
            : createdAt <= thresholdDate)
        );
      }),
    ];

    this.cdr.markForCheck();
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
            this.fetchBlogs();
          },
          error: (error) => {
            console.error('Error adding blog:', error);
            this.toastService.error('Failed to add blog', 'Error');
          },
        });
      }
    });
  }

  onEditBlog(blog: Blog) {
    const dialogRef = this.dialog.open(BlogModelDialogComponent, {
      width: '500px',
      data: { blog },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if (!result || !result.blog) {
      //   console.error('Invalid result from dialog:', result);
      //   this.toastService.error('Failed to update blog: Invalid data', 'Error');
      //   return;
      // }

      result.blog.student_id = this.studentId;
      this.blogService.updateBlog(result.blog, result.files).subscribe({
        next: () => {
          console.log('Blog updated successfully');
          this.toastService.success('Blog updated successfully', 'Success');
          this.fetchBlogs();
        },
        error: (error) => {
          console.error('Error updating blog:', error);
          this.toastService.error('Failed to update blog', 'Error');
        },
      });
    });
  }

  onDeleteBlog(blogId: number) {
    this.blogService.deleteBlog(blogId).subscribe({
      next: () => {
        this.toastService.success('Blog deleted successfully', 'Success');
        this.fetchBlogs();
      },
      error: (error) => {
        console.error('Error deleting blog:', error);
        this.toastService.error('Failed to delete blog', 'Error');
      },
    });
  }

  onAddComment(blogId: number, content: string) {
    this.blogService.addComment(blogId, content).subscribe({
      next: (newComment) => {
        this.toastService.success('Comment added successfully', 'Success');
        // Optimistically update the blog with the new comment
        this.blogs = this.blogs.map((blog) => {
          if (blog.id === blogId) {
            return {
              ...blog,
              comments: [...(blog.comments || []), newComment],
            };
          }
          return blog;
        });
        this.applyFilter();
        this.cdr.markForCheck();
        // Still fetch blogs to ensure consistency
        this.fetchBlogs();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.toastService.error('Failed to add comment', 'Error');
      },
    });
  }

  onRefreshBlog() {
    console.log('Refresh blog event received');
    this.fetchBlogs();
  }
}
