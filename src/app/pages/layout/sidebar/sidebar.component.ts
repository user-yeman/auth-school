import { Component, NgModule, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginComponent } from '../../login/login.component';
import { MatDividerModule } from '@angular/material/divider';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatExpansionModule,
    CommonModule,
    RouterModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  logo = 'eTutoring';
  navItems: NavItem[] = [];
  userRole: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    this.navItems = this.navItems;
    this.userRole = this.authService.getUserRole();
    console.log('User Role:', this.userRole);
    this.setNavItemsBasedOnRole(this.userRole);
  }
  private setNavItemsBasedOnRole(role: string): void {
    switch (this.userRole) {
      case 'admin':
        this.navItems = [
          {
            label: 'Dashboard',
            icon: 'home',
            route: '/admin/admin-dashboard',
          },
          {
            label: 'Allocation',
            icon: 'group_add',
            children: [
              {
                label: 'Allocation',
                icon: 'add',
                route: '/admin/allocation/create-allocation',
              },
              {
                label: 'Allocation List',
                icon: 'description',
                route: '/admin/allocation/allocationlist',
              },
            ],
          },
          {
            label: 'Settings',
            icon: 'settings',
            route: '/admin/settings',
          },
        ];
        break;
      case 'tutor':
        this.navItems = [
          {
            label: 'Dashboard',
            icon: 'home',
            route: '/tutor/tutor-dashboard',
          },

          {
            label: 'Student Management',
            icon: 'group',
            route: '/tutor/student-management',
          },
          {
            label: 'Reschedule Requests',
            icon: 'chat',
            route: '/tutor/request',
          },
          {
            label: 'Settings',
            icon: 'settings',
            route: '/admin/settings',
          },
        ];
        break;
      case 'student':
        this.navItems = [
          {
            label: 'Dashboard',
            icon: 'home',
            route: '/student/student-dashboard',
          },
          {
            label: 'Blog',
            icon: 'message',
            route: '/student/Blog',
          },
          {
            label: 'Documents',
            icon: 'folder',
            route: '/student/Documents',
          },
          {
            label: 'Meetings',
            icon: 'event',
            route: '/student/Meetings',
          },
          {
            label: 'Settings',
            icon: 'settings',
            route: '/student/settings',
          },
        ];
        break;
      default:
        this.navItems = [];
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  logNavigation(route: string): void {
    console.log('Navigating to:', route);
  }
}
