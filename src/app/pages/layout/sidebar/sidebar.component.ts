import {
  Component,
  NgModule,
  OnInit,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  logo = 'eTutoring';
  navItems: NavItem[] = [];
  userRole: string | null = null;
  @Input() isSidenavCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.setNavItemsBasedOnRole(this.userRole);
  }

  private setNavItemsBasedOnRole(role: string | null): void {
    switch (role) {
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
            label: 'Reports',
            icon: 'assessment',
            route: '/tutor/report',
          },
          {
            label: 'Settings',
            icon: 'settings',
            route: '/tutor/settings',
          },
        ];
        break;
      case 'student':
        this.navItems = [
          {
            label: 'Dashboard',
            icon: 'home',
            route: 'student/student-dashboard',
          },
          {
            label: 'Blog',
            icon: 'message',
            route: '/student/student-blog',
          },
          {
            label: 'Meetings',
            icon: 'event',
            route: '/student/student-meetings',
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

  toggleSidenav(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  logNavigation(route: string): void {
    console.log('Navigating to:', route);
  }
}
