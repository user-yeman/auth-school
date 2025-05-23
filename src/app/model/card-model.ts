export interface Student {
  id: number;
  StudentID: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface ApiDashboardResponse {
  status: string;
  message: string;
  data: {
    userInfo: userInfoDashboard;
    groups?: GroupsCardData; // Optional since missing in API response
    total_students: TotalStudentsCardData;
    blogging_insights: BloggingInsightsCardData;
    scheduled_meetings: ScheduledMeetingsCardData;
    students: Student[];
  };
}

export interface GroupsCardData {
  teacher_group: number;
  class_5th: number;
  class_6th: number;
}

export interface TotalStudentsCardData {
  count: number;
  active: number;
  inactive: number;
}

export interface BloggingInsightsCardData {
  total_posts: number;
  posts_by_students: number;
  posts_by_you: number;
  last_blog_date: string | null;
}

export interface ScheduledMeetingsCardData {
  total: number;
  online_count: number;
  online_platforms: string[];
  offline_count: number;
  offline_locations: string[];
}

export interface CardItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface CardData {
  title: string;
  total: number;
  items: CardItem[];
}
export interface userInfoDashboard {
  name: string;
  email: string;
  last_login_at: string;
}
