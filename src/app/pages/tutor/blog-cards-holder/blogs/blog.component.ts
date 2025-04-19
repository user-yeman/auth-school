import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Blog, Comment } from '../../../../model/tutor-blogs-model';
import { BlogService } from '../../../../services/tutor/blogs/blog.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent {
  @Input() blog!: Blog & { documents?: any[] };
  @Input() canEdit: boolean = false;
  @Input() isOldBlog: boolean = false;
  @Output() editBlog = new EventEmitter<Blog>();
  @Output() deleteBlog = new EventEmitter<number>();
  @Output() addCommentEvent = new EventEmitter<string>();
  @Output() refreshBlog = new EventEmitter<void>();

  showSettings = false;
  newComment = '';
  loggedInUserId: number | 0 | undefined;
  loggedInUserRole: string | null = null;
  commentSettingsMap: { [key: number]: boolean } = {};
  editCommentMap: { [key: number]: { isEditing: boolean; content: string } } =
    {};

  constructor(
    private blogService: BlogService,
    private toastService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  toggleCommentSettings(commentId: number) {
    this.commentSettingsMap[commentId] = !this.commentSettingsMap[commentId];
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
        let filename = 'blog-files.zip';
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

  addComment() {
    if (this.newComment.trim()) {
      this.addCommentEvent.emit(this.newComment);
      this.newComment = '';
    }
  }

  startEditComment(comment: Comment) {
    if (comment.id) {
      this.editCommentMap[comment.id] = {
        isEditing: true,
        content: comment.content,
      };
      this.commentSettingsMap[comment.id] = false;
    }
  }

  saveEditComment(comment: Comment) {
    if (comment.id && this.editCommentMap[comment.id]?.content.trim()) {
      const newContent = this.editCommentMap[comment.id].content;
      // Optimistically update the comment
      const updatedBlog = {
        ...this.blog,
        comments: this.blog.comments?.map((c) =>
          c.id === comment.id ? { ...c, content: newContent } : c
        ),
      };
      this.blog = updatedBlog as Blog & { documents?: any[] };
      this.editCommentMap[comment.id] = { isEditing: false, content: '' };

      this.blogService.updateComment(comment.id, newContent).subscribe({
        next: () => {
          this.toastService.success('Comment updated successfully', 'Success');
          console.log('Emitting refreshBlog after comment update');
          setTimeout(() => {
            this.refreshBlog.emit();
          }, 100);
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          this.toastService.error('Failed to update comment', 'Error');
          // Revert optimistic update
          this.refreshBlog.emit();
        },
      });
    }
  }

  cancelEditComment(commentId: number) {
    this.editCommentMap[commentId] = { isEditing: false, content: '' };
  }

  deleteComment(commentId: number) {
    // Optimistically remove the comment from the UI
    const originalComments = this.blog.comments ? [...this.blog.comments] : [];
    const updatedBlog = {
      ...this.blog,
      comments: this.blog.comments?.filter((c) => c.id !== commentId) || [],
    };
    this.blog = updatedBlog as Blog & { documents?: any[] };
    this.commentSettingsMap[commentId] = false;

    this.blogService.deleteComment(commentId).subscribe({
      next: () => {
        this.toastService.success('Comment deleted successfully', 'Success');
        console.log('Emitting refreshBlog after comment deletion');
        setTimeout(() => {
          this.refreshBlog.emit();
        }, 100);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.toastService.error('Failed to delete comment', 'Error');
        // Revert optimistic update
        this.blog = { ...this.blog, comments: originalComments } as Blog & {
          documents?: any[];
        };
        this.cdr.markForCheck();
      },
    });
  }

  canDeleteComment(comment: Comment): boolean {
    const canDelete =
      (this.loggedInUserRole === 'student' &&
        comment.student_id !== null &&
        Number(comment.student_id) === this.loggedInUserId) ||
      (this.loggedInUserRole === 'tutor' &&
        comment.tutor_id !== null &&
        Number(comment.tutor_id) === this.loggedInUserId);

    return canDelete;
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

  getCommentAuthor(comment: Comment): string {
    if (comment.student?.name) {
      return `${comment.student.name} (Student)`;
    } else if (comment.tutor?.name) {
      return `${comment.tutor.name} (Tutor)`;
    }
    return 'Unknown';
  }
}
