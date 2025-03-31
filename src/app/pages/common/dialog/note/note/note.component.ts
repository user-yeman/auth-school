import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'failed';
  file?: File;
  url?: string;
}

@Component({
  selector: 'app-note',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './note.component.html',
  styleUrl: './note.component.css',
})
export class NoteComponent {
  notes: string = '';
  files: UploadFile[] = [];
  fileLimitReached: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<NoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Prepopulate with existing notes and file
    this.notes = data.existingNotes || '';
    if (data.existingFile) {
      this.files = [
        {
          name: data.existingFile.name,
          size: 0, // Size not available in existing file data
          progress: 100,
          status: 'success',
          file: undefined,
          url: data.existingFile.url,
        },
      ];
      this.fileLimitReached = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    // Prepare the result object
    const result = {
      notes: this.notes,
      uploadedDocument: this.files.length > 0 ? this.files[0].file : undefined, // Take the first file, if any
    };
    this.dialogRef.close(result);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Remove existing file if any
      this.files = [];
      this.uploadFile(input.files[0]);
      this.fileLimitReached = true;
    }
  }

  uploadFile(file: File) {
    const upload: UploadFile = {
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      file: file,
    };

    this.files.push(upload);

    const interval = setInterval(() => {
      if (upload.progress >= 100) {
        upload.status = 'success';
        clearInterval(interval);
      } else {
        upload.progress += 10;
      }
    }, 500);
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
    this.fileLimitReached = false;
  }
}
