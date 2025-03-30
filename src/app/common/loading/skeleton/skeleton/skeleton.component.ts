import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-skeleton',
  imports: [CommonModule, MatCardModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  @Input() type: 'table' | 'card' | 'list' | 'pie-chart' | 'bar-chart' =
    'table';
  @Input() rows: number = 5; // Number of rows for table/list/bar-chart
  @Input() columns: number = 5; // Number of columns for table/bar-chart
  @Input() width: string = '100%'; // Custom width
  @Input() height: string = 'auto'; // Custom height
  randomHeights: string[] = [];

  get skeletonRows(): number[] {
    return Array(this.rows).fill(0);
  }
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.getRandomHeight();
  }
  get skeletonColumns(): number[] {
    return Array(this.columns).fill(0);
  }
  getRandomHeight() {
    this.randomHeights = this.skeletonColumns.map(
      () => `${Math.floor(Math.random() * 50) + 20}px`
    );
    this.cdr.detectChanges(); // Ensure change detection runs after initialization
  }
}
