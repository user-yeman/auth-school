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
  meeting_detail_id: number;
  id: number;
  title: string;
  date: string;
  time: string;
  meeting_type: string;
  description: string;
  meeting_link: string | null;
  meeting_app: string | null;
  location: string | null;
  status: string;
  filter_status: string;
  meetingRecord: meetingNote[];
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
export interface ApiResponse<T = any> {
  status: string;
  data: T;
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
  location: string;
  new_date: string;
  new_time: string;
  new_meeting_type: string;
  reason: string;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
}

export interface PaginationData {
  current_page: number;
  data: reschedule[]; // The actual meetings array
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface RescheduleResponse {
  data: PaginationData;
  meta: PaginationMeta;
}

export interface meetingNote {
  id: number;
  meeting_note: string;
  meeting_detail_id: number;
  uploaded_document: string | null;
  deleted_at: string;
  created_at: string;
  updated_at: string;
}
