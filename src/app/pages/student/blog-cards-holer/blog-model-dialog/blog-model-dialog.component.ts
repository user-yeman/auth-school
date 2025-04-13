import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Blog } from '../../../../model/student-blogs-model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-blog-model-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './blog-model-dialog.component.html',
  styleUrls: ['./blog-model-dialog.component.css']
})
export class BlogModelDialogComponent {
  blog: Partial<Blog> = {
    title: '',
    content: '',
    tutor_id: undefined,
    student_id: undefined,
    author_role: 'student'
  };
  
  files: File[] = [];
  selectedFileNames: string[] = [];
  
  // For form validation
  titleError: string = '';
  contentError: string = '';
  formSubmitted: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BlogModelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tutorId: number | null, mode: 'create' | 'edit', blog?: Blog },
    private authService: AuthService
  ) {
    // If editing an existing blog, populate the form
    if (data.mode === 'edit' && data.blog) {
      this.blog = { 
        ...data.blog,
        // Make sure we preserve the original author role
        author_role: data.blog.author_role || 'student'
      };
    } else {
      // For new blogs, set the student ID from the auth service
      this.blog.student_id = this.authService.getUserId();
      
      // Try to get student name
      const userName = sessionStorage.getItem('userName');
      if (userName) {
        this.blog.author = userName;
      }
    }
    
    // Set tutor ID from data
    if (data.tutorId) {
      this.blog.tutor_id = data.tutorId;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Check file size - limit to 10MB per file as an example
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      let validFiles = true;
      
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.size > maxSizeInBytes) {
          validFiles = false;
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          break;
        }
      }
      
      if (validFiles) {
        for (let i = 0; i < input.files.length; i++) {
          this.files.push(input.files[i]);
          this.selectedFileNames.push(input.files[i].name);
        }
      }
      
      // Reset input to allow selecting the same files again if needed
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }

  getFileSize(index: number): string {
    if (index >= 0 && index < this.files.length) {
      const fileSizeInBytes = this.files[index].size;
      if (fileSizeInBytes < 1024) {
        return `${fileSizeInBytes} B`;
      } else if (fileSizeInBytes < 1024 * 1024) {
        return `${(fileSizeInBytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    }
    return '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    // Validate form
    this.validateForm();
    
    // If there are errors, don't proceed
    if (this.titleError || this.contentError) {
      return;
    }
    
    console.log('Submitting blog:', this.blog);
    console.log('Files:', this.files);
    
    // Create the result object to return
    const result = {
      blog: this.blog,
      files: this.files
    };
    
    // Close the dialog and return the result
    this.dialogRef.close(result);
  }

  validateForm(): void {
    // Reset errors
    this.titleError = '';
    this.contentError = '';
    
    // Validate title
    if (!this.blog.title || this.blog.title.trim() === '') {
      this.titleError = 'Title is required';
    }
    
    // Validate content
    if (!this.blog.content || this.blog.content.trim() === '') {
      this.contentError = 'Content is required';
    }
  }
}
