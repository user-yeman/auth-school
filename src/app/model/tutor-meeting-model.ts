export interface Student {
  id: number;
  name: string;
  email: string;
}

export interface Tutor {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  specialization: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  meeting_type: string;
  description: string;
  meeting_link: string | null;
  location: string | null;
  status: string;
  filter_status: string;
}

export interface MeetingsData {
  upcoming: Meeting[];
  pastdue: Meeting[];
}
export interface MeetingResponse {
  id: number;
  name: string;
  email: string;
  student_id: string;
  meetings: MeetingsData;
}
export interface ApiResponse {
  status: string;
  data: MeetingResponse;
  id: string;
  message: string;
}

export interface reschedule {
  id: number;
  title: string;
  student_name: string;
  email: string;
  org_date: string;
  org_time: string;
  org_meeting_type: string;
  org_meeting_app: string;
  org_meeting_link: string;
  org_location: string;
  new_date: string;
  new_time: string;
  new_meeting_type: string;
  new_meeting_app: string;
  new_meeting_link: string;
  new_location: string;
  reason: string;
  status: string;
  filter_status: string;
}
export interface RescheduleResponse {
  status: string;
  data: reschedule;
  id: string;
  message: string;
}
