import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-blog-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './edit-blog-dialog.component.html',
  styleUrls: ['./edit-blog-dialog.component.css']
})
export class EditBlogDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  // Properties for enhanced functionality
  selectedFiles: File[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;

  constructor(
    public dialogRef: MatDialogRef<EditBlogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string; 
      content: string;
      attachments?: any[]; // Existing attachments
      categories?: string; // Optional categories field
    }
  ) {
    // Initialize empty arrays if not provided
    if (!this.data.attachments) {
      this.data.attachments = [];
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      // Convert FileList to array and add to selectedFiles
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
    // Reset input to allow selecting the same file again
    this.fileInput.nativeElement.value = '';
  }

  removeAttachment(index: number): void {
    if (this.data.attachments) {
      // Mark for deletion instead of immediately removing
      this.data.attachments[index].toDelete = true;
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  isFormValid(): boolean {
    return !!this.data.title.trim() && 
           !!this.data.content.trim() && 
           this.data.content.length <= 2000;
  }

  getSubmitData(): any {
    // Prepare the data object to be returned when dialog closes
    return {
      title: this.data.title.trim(),
      content: this.data.content.trim(),
      newFiles: this.selectedFiles,
      attachments: this.data.attachments?.filter(a => !a.toDelete),
      categories: this.data.categories?.trim(),
    };
  }
}