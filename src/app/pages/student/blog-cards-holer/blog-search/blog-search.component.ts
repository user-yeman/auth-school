import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './blog-search.component.html',
  styleUrl: './blog-search.component.css'
})
export class BlogSearchComponent {
  @Input() initialQuery: string = '';
  @Output() searchQuery = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  searchText: string = '';

  ngOnInit() {
    this.searchText = this.initialQuery;
  }

  onSearch() {
    this.searchQuery.emit(this.searchText);
  }

  onClear() {
    this.searchText = '';
    this.clearSearch.emit();
  }

  onInput() {
    // Emit the search event as user types
    this.searchQuery.emit(this.searchText);
  }
}
