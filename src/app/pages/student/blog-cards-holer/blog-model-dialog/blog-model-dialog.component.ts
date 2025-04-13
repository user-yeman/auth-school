import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Blog } from '../../../../model/student-blogs-model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'success';
}

@Component({
  selector: 'app-blog-model-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './blog-model-dialog.component.html',
  styleUrl: './blog-model-dialog.component.css',
})
export class BlogModelDialogComponent {
  blog: Blog;
  isEditMode: boolean;
  uploadedFiles: UploadedFile[] = [];
  private allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  private allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];

  constructor(
    public dialogRef: MatDialogRef<BlogModelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { blog?: Blog },
    private toastr: ToastrService
  ) {
    this.isEditMode = !!data.blog;
    this.blog = this.isEditMode
      ? {
          id: data.blog?.id ?? 0, // Provide a default value for id
          author: data.blog?.author || '', // Default to an empty string
          title: data.blog?.title || '', // Default to an empty string
          content: data.blog?.content || '', // Default to an empty string
          author_role: data.blog?.author_role ?? 'tutor', // Default to 'tutor'
          student_id: data.blog?.student_id ?? 0, // Default to 0
          tutor_id: data.blog?.tutor_id ?? 0, // Default to 0
          created_at: data.blog?.created_at || '', // Default to an empty string
          updated_at: data.blog?.updated_at || '', // Default to an empty string
          deleted_at: data.blog?.deleted_at || '', // Default to an empty string
          comments: data.blog?.comments || [], // Default to an empty array
        }
      : {
          id: 0,
          author: '',
          title: '',
          content: '',
          author_role: 'tutor',
          student_id: 0,
          tutor_id: 0,
          created_at: '',
          updated_at: '',
          deleted_at: '',
          comments: [],
        };
  }

  ngOnInit() {
    if (this.isEditMode && this.data.blog?.documents) {
      this.uploadedFiles = this.data.blog.documents.map((doc) => ({
        file: null as any,
        name: doc.BlogDocumentFile.split('/').pop() || 'Unknown File',
        size: 'Unknown Size', // You can calculate size if available
        progress: 100,
        status: 'success',
      }));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      // Validate file type
      const isValidType = this.allowedFileTypes.includes(file.type);
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isValidExtension =
        extension && this.allowedExtensions.includes(extension);

      if (!isValidType && !isValidExtension) {
        this.toastr.error(
          `File "${file.name}" is not allowed. Only PDF, DOC, DOCX, and TXT files are permitted.`,
          'Invalid File Type'
        );
        return;
      }
      const uploadedFile: UploadedFile = {
        file: file,
        name: file.name,
        size: this.formatFileSize(file.size),
        progress: 0,
        status: 'uploading',
      };
      this.uploadedFiles.push(uploadedFile);

      // Simulate file upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        uploadedFile.progress = progress;
        if (progress >= 100) {
          uploadedFile.status = 'success';
          clearInterval(interval);
        }
      }, 200);
    });
  }

  removeFile(file: UploadedFile) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => f !== file);
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onPost() {
    const filesToUpload = this.uploadedFiles
      .filter((f) => f.status === 'success' && f.file) // Only include files that are successfully "uploaded" and have a File object
      .map((f) => f.file);
    this.dialogRef.close({
      blog: this.blog,
      files: filesToUpload,
    });
  }
}
