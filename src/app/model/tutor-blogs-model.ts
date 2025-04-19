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

export interface Student {
  id: number;
  StudentID: string;
  name: string;
  email: string;
  phone_number: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
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

export interface Comment {
  id: number;
  content: string;
  student_id: number | null;
  tutor_id: number | null;
  blog_id: number;
  created_at: string;
  updated_at: string;
  student?: Student | null; // Matches API structure
  tutor?: Tutor | null; // Matches API structure
}

export interface Document {
  id: number;
  blog_id: number;
  BlogDocumentFile: string;
  created_at: string;
  updated_at: string;
}

export interface ApiCommentResponse<T> {
  message: string;
  comment: T;
}
