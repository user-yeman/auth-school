import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-model-list',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './model-list.component.html',
  styleUrl: './model-list.component.css',
})
export class ModelListComponent {
  title: string;
  searchPlaceholder: string;
  list: { name: string; email: string }[];
  searchQuery: string = '';
  filteredList: { name: string; email: string }[];

  constructor(
    public dialogRef: MatDialogRef<ModelListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      searchPlaceholder: string;
      list: { name: string; email: string }[];
    }
  ) {
    this.title = data.title;
    this.searchPlaceholder = data.searchPlaceholder;
    this.list = data.list;
    this.filteredList = [...this.list];
  }

  filterList() {
    const query = this.searchQuery.toLowerCase();
    this.filteredList = this.list.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
    );
  }

  selectItem(item: { name: string; email: string }) {
    this.dialogRef.close(item);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
