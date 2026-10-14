export interface User {
  id?: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'admin' | 'guest';
  university_id: string;
}

export interface Citation {
  document_id: string;
  document_title: string;
  filename: string;
  page_number: number;
  version_year?: string;
  category?: string;
  confidence_score: number;
  snippet: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  university_id: string;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  category: string;
  version_year: string;
  file_size: number;
  total_pages: number;
  total_chunks: number;
  status: 'indexed' | 'processing' | 'failed';
  university_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface SystemStatus {
  status: string;
  university_id: string;
  total_documents: number;
  total_chunks: number;
  total_categories: number;
  vector_store_count: number;
  llm_provider: string;
  embedding_provider: string;
  embedding_model: string;
  database_type: string;
}
