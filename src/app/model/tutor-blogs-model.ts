export interface Blog {
  id: number;
  author: string;
  title: string;
  content: string;
  author_role: 'tutor' | 'student';
  student_id?: number; // Made optional
  tutor_id?: number; // Made optional
  created_at?: string; // Made optional
  updated_at?: string; // Made optional
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
  BlogDocumentFile: string;
  created_at: string;
  updated_at: string;
}
export interface ApiCommentResponse<T> {
  message: string;
  comment: T;
}
