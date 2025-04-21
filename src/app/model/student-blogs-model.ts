export interface Blog {
  id: number;
  title: string;
  content: string;
  author?: string;
  author_role?: string; // Add this property
  student_id?: number;
  tutor_id?: number;
  created_at?: string;
  updated_at?: string;
  comments: Comment[];
  documents?: any[]; // Documents/attachments
  categories?: string; // Add this property for blog categories
}

export interface Comment {
  id: number;
  content: string;
  student_id: number | null;
  tutor_id: number | null;
  blog_id: number;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    StudentID: string;
    name: string;
    email: string;
    phone_number: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  } | null;
  tutor?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    specialization: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface Document {
  id: number;
  name: string;
  size?: number;
  file_path?: string;
  mime_type?: string;
  created_at?: string;
  download_url?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiCommentResponse<T> {
  message: string;
  comment: T;
}
