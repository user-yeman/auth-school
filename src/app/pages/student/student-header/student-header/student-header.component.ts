import { Component, Input, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './student-header.component.html',
  styleUrls: ['./student-header.component.css']
})
export class StudentHeaderComponent implements OnInit {
  @Input() userName: string = '';
  @Input() lastLogin: string = '';
  @Input() lastLoginRaw: string | undefined = ''; // Allow undefined
  @Input() showWelcome: boolean = true;
  @Input() isMeetingsMode: boolean = false;
  @Input() fixedPosition: boolean = false; // Allow fixed positioning
  @Input() topPosition: string = ''; // Allow top positioning
  
  // Storage for last login that works on server side
  private _lastLoginFromStorage: string = '';
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit(): void {
    // Only access browser APIs when in browser context
    if (isPlatformBrowser(this.platformId)) {
      console.log('StudentHeaderComponent initializing with raw login:', this.lastLoginRaw);
      
      if (this.lastLoginRaw) {
        this.saveLastLoginToSession(this.lastLoginRaw);
      }
      
      if (!this.lastLogin && !this.lastLoginRaw) {
        const sessionLogin = this.getLastLoginFromSession();
        if (sessionLogin) {
          this.lastLoginRaw = sessionLogin;
          this._lastLoginFromStorage = sessionLogin;
        }
      }
    }
  }
  
  // Save last login to sessionStorage
  saveLastLoginToSession(loginTime: string): void {
    if (!isPlatformBrowser(this.platformId) || !loginTime) return;
    
    try {
      const sessionLogin = sessionStorage.getItem('lastLoginTime');
      let shouldUpdate = true;
      
      if (sessionLogin) {
        try {
          const newDate = new Date(loginTime);
          const sessionDate = new Date(sessionLogin);
          
          if (isNaN(newDate.getTime()) || sessionDate >= newDate) {
            shouldUpdate = false;
          }
        } catch (e) {
          console.error('Error comparing dates:', e);
        }
      }
      
      if (shouldUpdate) {
        sessionStorage.setItem('lastLoginTime', loginTime);
        this._lastLoginFromStorage = loginTime;
      }
      
      // Clean up localStorage if needed
      if (localStorage.getItem('lastLoginTime')) {
        localStorage.removeItem('lastLoginTime');
      }
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }
  
  // Get last login from sessionStorage
  getLastLoginFromSession(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    
    try {
      return sessionStorage.getItem('lastLoginTime') || '';
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return '';
    }
  }
  
  formatLastLogin(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }
  
  get displayLastLogin(): string {
    if (this.lastLogin) {
      return this.lastLogin;
    } 
    
    if (this.lastLoginRaw) {
      return this.formatLastLogin(this.lastLoginRaw);
    }
    
    if (isPlatformBrowser(this.platformId)) {
      const sessionLogin = this.getLastLoginFromSession();
      if (sessionLogin) {
        return this.formatLastLogin(sessionLogin);
      }
    } else if (this._lastLoginFromStorage) {
      return this.formatLastLogin(this._lastLoginFromStorage);
    }
    
    return '';
  }
  
  // Custom styles for positioning
  get customStyles() {
    const styles: {[key: string]: string} = {};
    
    if (this.topPosition) {
      styles['top'] = this.topPosition;
    }
    
    return styles;
  }
}
