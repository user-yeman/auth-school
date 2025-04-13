export interface Blog {
  id: number;
  author: string;
  title: string;
  content: string;
  author_role: 'tutor' | 'student';
  student_id?: number;
  tutor_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  comments?: Comment[];
  documents?: Document[];
}

export interface Comment {
  id: number;
  content: string;
  student_id: number | null;
  tutor_id: number | null;
  blog_id: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  blog_id: number;
  BlogDocumentFile: string; // Match exact case as in API
  created_at: string;
  updated_at: string;
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
