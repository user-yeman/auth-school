import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog } from '../../../../model/student-blogs-model';
import { StudentBlogService } from '../../../../services/student/blogs/student-blog.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { StudentHeaderComponent } from '../../student-header/student-header/student-header.component';

@Component({
  selector: 'app-student-blog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BlogCardComponent,
    StudentHeaderComponent
  ],
  templateUrl: './student-blog.component.html',
  styleUrls: ['./student-blog.component.css']
})
export class StudentBlogComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  isLoading: boolean = true;
  filter: 'new' | 'old' = 'new';
  loggedInUserId: number = 0;
  loggedInUserRole: string | null = null;
  user = { name: '', email: '', lastLogin: '' };

  constructor(private blogService: StudentBlogService) {
    this.loggedInUserId = this.blogService.getLoggedInUserId();
    this.loggedInUserRole = this.blogService.getLoggedInUserRole();
  }

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.isLoading = true;
    this.blogService.getBlogs().subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filter = target.value as 'new' | 'old';
    this.applyFilter();
  }

  applyFilter(): void {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    if (this.filter === 'new') {
      this.filteredBlogs = this.blogs.filter(blog => {
        if (!blog || !blog.created_at) {
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt > thresholdDate;
      });
    } else {
      this.filteredBlogs = this.blogs.filter(blog => {
        if (!blog || !blog.created_at) {
          return false;
        }
        const createdAt = new Date(blog.created_at);
        return !isNaN(createdAt.getTime()) && createdAt <= thresholdDate;
      });
    }
  }

  onAddComment(blogId: number, content: string): void {
    this.blogService.addComment(blogId, content).subscribe({
      next: () => {
        this.fetchBlogs();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }
}