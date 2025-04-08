import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Blog, Comment } from '../../../../model/tutor-blogs-model';
import { EventEmitter } from '@angular/core';
import { BlogService } from '../../../../services/tutor/blogs/blog.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent {
  @Input() blog!: Blog & { documents?: any[] };
  @Input() canEdit: boolean = false;
  @Input() isOldBlog: boolean = false;
  @Output() editBlog = new EventEmitter<Blog>();
  @Output() deleteBlog = new EventEmitter<number>();
  @Output() addCommentEvent = new EventEmitter<string>();
  @Output() deleteCommentEvent = new EventEmitter<string>();

  showSettings = false;
  newComment = '';
  loggedInUserId: number | 0 | undefined;
  loggedInUserRole: string | null = null;

  constructor(
    private blogService: BlogService,
    private toastService: ToastrService
  ) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }
  downloadFiles() {
    if (!this.blog.id) {
      this.toastService.error(
        'Cannot download files: Blog ID is missing',
        'Error'
      );
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
      },
    });
  }
  ///////////////////Comment Section/////////////////////
  addComment() {
    if (this.newComment.trim()) {
      this.addCommentEvent.emit(this.newComment);
      this.newComment = '';
    }
  }
  deleteComment(commentId: number) {
    this.deleteCommentEvent.emit(commentId.toString());
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  getCommentAuthor(
    comment: Comment & { student_id?: number; tutor_id?: number }
  ): string {
    if (comment.student_id) {
      return `Student ${comment.student_id} (Student)`;
    } else if (comment.tutor_id) {
      return `Tutor ${comment.tutor_id} (Tutor)`;
    }
    return 'Unknown';
  }

  // canDeleteComment(comment: Comment): boolean {
  //   // Allow deletion if the logged-in user is the author of the comment
  //   return (
  //     (comment.student_id && comment.student_id === this.loggedInUserId) ||
  //     (comment.tutor_id && comment.tutor_id === this.loggedInUserId)
  //   );
  // }
}
