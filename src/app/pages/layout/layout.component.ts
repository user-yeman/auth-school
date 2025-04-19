import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  title = 'eTutoring';
  isSidenavCollapsed: boolean = false;

  toggleSidebar(): void {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }
}
