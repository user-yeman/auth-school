import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { StudentHeaderComponent } from '../student-header/student-header/student-header.component';

@Component({
  selector: 'app-student-blog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    StudentHeaderComponent
  ],
  templateUrl: './student-blog.component.html',
  styleUrls: ['../shared/student-responsive.css', './student-blog.component.css']
})
export class StudentBlogComponent implements OnInit {
  user = {
    name: '',
    email: '',
    lastLogin: ''
  };
  
  blogs: any[] = [];
  isLoading = true;
  errorMessage = '';
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit(): void {
    this.fetchUserData();
    this.fetchBlogs();
  }
  
  fetchUserData(): void {
    setTimeout(() => {
      this.user = {
        name: 'John Student',
        email: 'john.student@example.com',
        lastLogin: new Date().toISOString()
      };
      
      if (isPlatformBrowser(this.platformId)) {
        try {
          sessionStorage.setItem('lastLoginTime', this.user.lastLogin);
        } catch (error) {
          console.error('Error storing login time:', error);
        }
      }
    }, 500);
  }
  
  fetchBlogs(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.blogs = [
        {
          id: 1,
          title: "Introduction to Machine Learning",
          author: "Dr. Smith",
          role: "Tutor",
          description: "This blog post introduces the basic concepts of machine learning and how they can be applied in various domains. We'll cover supervised learning, unsupervised learning, and reinforcement learning.",
          attachments: [
            { name: "ML-Introduction.pdf", url: "#" },
            { name: "Code-Examples.zip", url: "#" }
          ],
          comments: [
            { author: "Jane Doe", role: "Student", text: "This was really helpful, thanks!" },
            { author: "Dr. Smith", role: "Tutor", text: "Glad you found it useful, Jane!" }
          ]
        },
        {
          id: 2,
          title: "Preparing for Your Final Exams",
          author: "Academic Support",
          role: "Admin",
          description: "Here are some tips and strategies to help you prepare effectively for your upcoming final examinations. We cover time management, study techniques, and stress management.",
          attachments: [
            { name: "Exam-Prep-Guide.pdf", url: "#" }
          ],
          comments: [
            { author: "John Student", role: "Student", text: "The time management tips were exactly what I needed!" },
            { author: "Sarah", role: "Student", text: "Could you share more about stress management techniques?" }
          ]
        }
      ];
    }, 1000);
  }
}
