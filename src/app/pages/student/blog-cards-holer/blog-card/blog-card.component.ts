import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
import { of, Observable } from 'rxjs';

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
export class BlogCardComponent implements OnInit {
  @Input() blog!: Blog;
  @Input() isOldBlog: boolean = false;
  @Output() addCommentEvent = new EventEmitter<{ blogId: number, content: string }>();
  @Output() blogUpdated = new EventEmitter<void>();
  @Output() blogDeleted = new EventEmitter<number>();

  newComment = '';
  loggedInUserId: number;
  loggedInUserRole: string | null;
  isSubmittingComment = false;
  apiBaseUrl = 'http://127.0.0.1:8000/api';

  // Add these properties for comment editing
  editingCommentId: number | null = null;
  editCommentText: string = '';
  isSubmittingEditComment = false;

  constructor(
    private blogService: StudentBlogService,
    private toastService: ToastrService,
    private dialog: MatDialog
  ) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();
  }

  ngOnInit(): void {
    // This method is required when implementing OnInit interface
    // You can initialize component data or perform setup here
    console.log('Blog card initialized for:', this.blog.title);
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    
    this.isSubmittingComment = true;
    
    // Convert blog ID to a number
    const blogId = Number(this.blog.id);
    
    console.log('Attempting to add comment to blog ID:', blogId);
    
    // First ensure the blog exists in the backend
    this.blogService.ensureBlogExists(blogId).subscribe({
      next: (exists) => {
        if (!exists) {
          this.toastService.error('Cannot add comment: Blog not found in database');
          this.isSubmittingComment = false;
          return;
        }
        
        // Now that we know the blog exists, add the comment
        this.blogService.addComment(blogId, this.newComment).subscribe({
          next: (comment) => {
            console.log('Comment added successfully:', comment);
            // Add the new comment to the local array so it appears immediately
            if (!this.blog.comments) {
              this.blog.comments = [];
            }
            this.blog.comments.push(comment);
            
            this.newComment = '';
            this.toastService.success('Comment added successfully');
            this.isSubmittingComment = false;
          },
          error: (error) => {
            console.error('Error adding comment:', error);
            this.toastService.error(error.message || 'Failed to add comment');
            this.isSubmittingComment = false;
          }
        });
      },
      error: (error) => {
        console.error('Error checking if blog exists:', error);
        this.toastService.error('Failed to verify blog exists');
        this.isSubmittingComment = false;
      }
    });
  }

  downloadFiles(): void {
    if (!this.blog.id) {
      this.toastService.error('Cannot download files: Blog ID is missing', 'Error');
      return;
    }

    // Check if there are documents to download
    if (!this.blog.documents || this.blog.documents.length === 0) {
      this.toastService.warning('No documents attached to this blog', 'Warning');
      return;
    }

    // Use the first document ID or the blog ID as needed
    const documentId = this.blog.documents[0].id;
    
    // Use the correct API endpoint format as shown in your documentation
    this.blogService.downloadBlogFiles(documentId).subscribe({
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
    // Check for student comment (when tutor_id is null)
    if (comment.tutor_id === null && comment.student_id !== null) {
      if (comment.student && comment.student.name) {
        return comment.student.name; // Return the student name from nested object
      }
      
      // Extract only the numeric part for the student ID
      const studentId = String(comment.student_id).match(/^\d+/);
      return `Student #${studentId ? studentId[0] : comment.student_id}`;
    }
    
    // Check for tutor comment (when student_id is null)
    if (comment.student_id === null && comment.tutor_id !== null) {
      if (comment.tutor && comment.tutor.name) {
        return comment.tutor.name; // Return the tutor name from nested object
      }
      
      // Extract only the numeric part for the tutor ID
      const tutorId = String(comment.tutor_id).match(/^\d+/);
      return `Tutor #${tutorId ? tutorId[0] : comment.tutor_id}`;
    }
    
    // Fallback: if both or neither IDs are set, try to determine from objects
    if (comment.tutor && comment.tutor.name) {
      return comment.tutor.name;
    }
    
    if (comment.student && comment.student.name) {
      return comment.student.name;
    }
    
    return 'Unknown User';
  }

  // Add this method to check if the current user is the author of a comment
  isCommentAuthor(comment: Comment): boolean {
    if (!comment) return false;
    
    const currentUserId = Number(this.loggedInUserId);
    const currentUserRole = this.loggedInUserRole;
    
    console.log('Checking comment author:', {
      commentId: comment.id,
      commentTutorId: comment.tutor_id,
      commentStudentId: comment.student_id,
      currentUserId,
      currentUserRole
    });
    
    // For tutor comments (when student_id is null)
    if (currentUserRole === 'tutor' && comment.student_id === null && comment.tutor_id !== null) {
      return Number(comment.tutor_id) === currentUserId;
    }
    
    // For student comments (when tutor_id is null)
    if (currentUserRole === 'student' && comment.tutor_id === null && comment.student_id !== null) {
      return Number(comment.student_id) === currentUserId;
    }
    
    return false;
  }

  // Edit blog functionality - similar to tutor implementation
  editBlog(): void {
    const dialogRef = this.dialog.open(EditBlogDialogComponent, {
      width: '600px',
      data: {
        title: this.blog.title,
        content: this.blog.content,
        attachments: this.blog.documents || [], // Pass existing documents
        categories: this.blog.categories || '' // Now properly typed
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Create FormData for the request
        const formData = new FormData();
        
        // Add blog data to FormData
        formData.append('title', result.title);
        formData.append('content', result.content);
        
        if (result.categories) {
          formData.append('categories', result.categories);
        }
        
        // Add files to FormData - match the API's expected format
        if (result.newFiles && result.newFiles.length > 0) {
          // Use 'documents[]' based on the API documentation
          for (let i = 0; i < result.newFiles.length; i++) {
            formData.append('documents[]', result.newFiles[i]);
          }
        }
        
        // Add IDs of attachments to keep (if API supports this)
        if (result.attachments && result.attachments.length > 0) {
          // If the API expects an array of IDs, adjust accordingly
          const keepIds = result.attachments.map((a: any) => a.id);
          formData.append('keep_attachments', JSON.stringify(keepIds));
        }
        
        this.blogService.updateBlogWithFiles(this.blog.id, formData).subscribe({
          next: (updatedBlog) => {
            // Check if we received a valid response
            if (updatedBlog) {
              // Update the local blog data with the response
              Object.assign(this.blog, updatedBlog);
              this.toastService.success('Blog updated successfully');
              this.blogUpdated.emit();
            }
          },
          error: (error: Error) => {
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
        error: (error: Error) => { // Add explicit type for error parameter
          console.error('Error deleting blog:', error);
          this.toastService.error('Failed to delete blog');
        }
      });
    }
  }

  // Add a method to handle document downloads or views
  viewDocument(document: any): void {
    if (document.file_path) {
      // If we have a local URL (from newly uploaded files)
      window.open(document.file_path, '_blank');
    } else if (document.download_url) {
      // If we have a download URL from the API
      window.open(document.download_url, '_blank');
    } else {
      // Construct API URL
      const url = `${this.apiBaseUrl}/documents/${document.id}/download`;
      window.open(url, '_blank');
    }
  }

  // Start editing a comment
  editComment(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.content;
  }

  // Cancel editing
  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  // Save the edited comment
  saveEditedComment(): void {
    if (!this.editingCommentId || !this.editCommentText.trim() || this.isSubmittingEditComment) return;
    
    this.isSubmittingEditComment = true;
    
    this.blogService.updateComment(this.blog.id, this.editingCommentId, this.editCommentText)
      .subscribe({
        next: (updatedComment) => {
          // Find and update the comment in the local array
          const commentIndex = this.blog.comments.findIndex(c => c.id === this.editingCommentId);
          if (commentIndex !== -1) {
            this.blog.comments[commentIndex].content = this.editCommentText;
            if (updatedComment && updatedComment.updated_at) {
              this.blog.comments[commentIndex].updated_at = updatedComment.updated_at;
            }
          }
          
          this.toastService.success('Comment updated successfully');
          this.editingCommentId = null;
          this.editCommentText = '';
          this.isSubmittingEditComment = false;
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          this.toastService.error('Failed to update comment');
          this.isSubmittingEditComment = false;
        }
      });
  }

  // Delete a comment
  deleteComment(comment: Comment): void {
    if (!comment.id) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      this.blogService.deleteComment(this.blog.id, comment.id)
        .subscribe({
          next: () => {
            // Remove the deleted comment from the local array
            this.blog.comments = this.blog.comments.filter(c => c.id !== comment.id);
            this.toastService.success('Comment deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting comment:', error);
            this.toastService.error('Failed to delete comment');
          }
        });
    }
  }
}