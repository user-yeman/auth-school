import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'auth-school';
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit(): void {
    // Only run storage operations in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.migrateStorageItems();
    }
  }
  
  private migrateStorageItems(): void {
    // This function only runs in browser context now
    try {
      // List of items that should be in sessionStorage
      const itemsToMigrate = [
        'lastLoginTime',
        'studentName',
        // Add other items if needed
      ];
      
      // Migrate each item from localStorage to sessionStorage
      itemsToMigrate.forEach(itemKey => {
        const localValue = localStorage.getItem(itemKey);
        
        if (localValue) {
          console.log(`Found ${itemKey} in localStorage, moving to sessionStorage`);
          
          // Copy to sessionStorage first (if not already there)
          if (!sessionStorage.getItem(itemKey)) {
            sessionStorage.setItem(itemKey, localValue);
          }
          
          // Then remove from localStorage
          localStorage.removeItem(itemKey);
          
          console.log(`Successfully migrated ${itemKey} from localStorage to sessionStorage`);
        }
      });
      
      // Check for remaining localStorage items (for debugging)
      if (localStorage.length > 0) {
        console.log('Remaining localStorage items:', Object.keys(localStorage));
      }
    } catch (error) {
      console.error('Error during storage migration:', error);
    }
  }
}
