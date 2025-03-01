import { Component, NgModule } from '@angular/core';
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
export class SidebarComponent {
  logo = 'eTutoring';

  constructor(private authService: AuthService, private router: Router) {}

  navItems: NavItem[] = [
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  logNavigation(route: string): void {
    console.log('Navigating to:', route);
  }
}
