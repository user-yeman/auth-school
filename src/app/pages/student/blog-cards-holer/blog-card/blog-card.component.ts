import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Blog, Comment } from '../../../../model/student-blogs-model';
import { StudentBlogService } from '../../../../services/student/blogs/student-blog.service';
import { ToastrService } from 'ngx-toastr';
import { EditBlogDialogComponent } from '../edit-blog-dialog/edit-blog-dialog.component';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule
  ],
  templateUrl: './blog-card.component.html',
  styleUrls: ['./blog-card.component.css']
})
export class BlogCardComponent {
  @Input() blog!: Blog;
  @Input() isOldBlog: boolean = false;
  @Output() addCommentEvent = new EventEmitter<{ blogId: number, content: string }>();
  @Output() blogUpdated = new EventEmitter<void>();
  @Output() blogDeleted = new EventEmitter<number>();

  newComment = '';
  loggedInUserId: number;
  loggedInUserRole: string | null;

  constructor(
    private blogService: StudentBlogService,
    private toastService: ToastrService,
    private dialog: MatDialog
  ) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();
  }

  addComment(): void {
    if (this.newComment.trim()) {
      this.addCommentEvent.emit({ 
        blogId: this.blog.id, 
        content: this.newComment 
      });
      this.newComment = '';
    }
  }

  downloadFiles(): void {
    if (!this.blog.id) {
      this.toastService.error('Cannot download files: Blog ID is missing', 'Error');
      return;
    }

    this.blogService.downloadBlogFiles(this.blog.id).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'blog-files.zip'; // Default filename
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="(.+)"/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const blob = new Blob([response.body!], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Files downloaded successfully', 'Success');
      },
      error: (error) => {
        console.error('Error downloading files:', error);
        this.toastService.error('Failed to download files', 'Error');
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  getCommentAuthor(comment: Comment): string {
    if (comment.student_id) {
      return 'Student';
    } else if (comment.tutor_id) {
      return 'Tutor';
    }
    return 'Unknown';
  }

  // Edit blog functionality - similar to tutor implementation
  editBlog(): void {
    const dialogRef = this.dialog.open(EditBlogDialogComponent, {
      width: '600px',
      data: {
        title: this.blog.title,
        content: this.blog.content
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blogService.updateBlog(this.blog.id, result).subscribe({
          next: () => {
            this.toastService.success('Blog updated successfully');
            this.blogUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating blog:', error);
            this.toastService.error('Failed to update blog');
          }
        });
      }
    });
  }

  // Delete blog functionality - similar to tutor implementation
  deleteBlog(): void {
    if (confirm('Are you sure you want to delete this blog?')) {
      this.blogService.deleteBlog(this.blog.id).subscribe({
        next: () => {
          this.toastService.success('Blog deleted successfully');
          this.blogDeleted.emit(this.blog.id);
        },
        error: (error) => {
          console.error('Error deleting blog:', error);
          this.toastService.error('Failed to delete blog');
        }
      });
    }
  }
}