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
import { DomSanitizer } from '@angular/platform-browser';

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

  // Add new properties for drag and drop
  isDragging = false;
  maxFileSizeMB = 10; // Maximum file size in MB

  constructor(
    public dialogRef: MatDialogRef<BlogModelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tutorId: number | null, mode: 'create' | 'edit', blog?: Blog },
    private authService: AuthService,
    private sanitizer: DomSanitizer // Add this for secure URL handling
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

  // Handle drag over event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  // Handle drag leave event
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  // Handle drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      // Process dropped files using your existing file handling logic
      this.handleDroppedFiles(event.dataTransfer.files);
    }
  }
  
  // Process the dropped files
  handleDroppedFiles(fileList: FileList): void {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Add the file to your existing arrays
      this.files.push(file);
      this.selectedFileNames.push(file.name);
    }
  }

  // Handle files from drag and drop or file input
  handleFiles(fileList: FileList): void {
    const maxSizeInBytes = this.maxFileSizeMB * 1024 * 1024;
    let hasInvalidFile = false;
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate file size
      if (file.size > maxSizeInBytes) {
        this.showFileError(`File "${file.name}" exceeds the maximum size of ${this.maxFileSizeMB}MB`);
        hasInvalidFile = true;
        continue;
      }
      
      // Add valid file to our arrays
      this.files.push(file);
      this.selectedFileNames.push(file.name);
    }
    
    if (!hasInvalidFile) {
      console.log('Files added successfully:', this.files);
    }
  }
  
  // Show error for invalid files
  showFileError(message: string): void {
    // You can replace this with your toast service if preferred
    alert(message);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleDroppedFiles(input.files);
      
      // Reset input to allow selecting the same files again if needed
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }

  // Add this method to get the file type icon display character
  getFileTypeChar(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return 'P';
      case 'doc':
      case 'docx':
        return 'W';
      case 'xls':
      case 'xlsx':
        return 'X';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'I';
      default:
        return 'T';
    }
  }

  // Update your existing getFileSize method to show sizes like in the Figma design
  getFileSize(index: number): string {
    const file = this.files[index];
    if (!file) return '';
    
    const kb = Math.round(file.size / 1024);
    
    if (kb < 1024) {
      return `${kb} KB`;
    } else {
      const mb = (kb / 1024).toFixed(1);
      return `${mb} MB`;
    }
  }

  // Add a click handler for the upload link
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
    
    // Create result object with both blog data and files
    const result = {
      blog: this.blog,
      files: this.files // Make sure files are included
    };
    
    // Close dialog and return result
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
