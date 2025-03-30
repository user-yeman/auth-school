import { Component } from '@angular/core';

interface Document {
  file_name: string;
  status: string;
  created_at: string;
}

interface ApiResponse {
  status: number;
  data: {
    user: {
      name: string;
      email: string;
      last_login_at: string;
    };
    tutor: {
      // Add tutor interface
      name: string;
      email: string;
    };
    vlogs: {
      student: number;
      tutor: number;
      totalBlog: number;
    };
    meetings: {
      count_online: number;
      count_campus: number;
      totalMeeting: number;
    };
    documentsTotal: {
      total: number;
      status: {
        finished: number;
        watched: number;
        accepted: number;
        canceled: number;
      };
    };
    documents: Document[];
  };
}
@Component({
  selector: 'app-student-switch',
  imports: [],
  templateUrl: './student-switch.component.html',
  styleUrl: './student-switch.component.css',
})
export class StudentSwitchComponent {}
