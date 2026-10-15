import type { User, Message, Conversation, DocumentItem, Category, SystemStatus, Citation } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '') + '/api/v1';

export class ApiClient {
  private static token: string | null = localStorage.getItem('abes_auth_token');

  static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('abes_auth_token', token);
    } else {
      localStorage.removeItem('abes_auth_token');
    }
  }

  static getToken(): string | null {
    return this.token || localStorage.getItem('abes_auth_token');
  }

  private static headers(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const t = this.getToken();
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  }

  // --- Auth ---
  static async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  static async register(data: { email: string; password: string; full_name: string; role?: string }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const respData = await res.json();
    this.setToken(respData.access_token);
    return respData;
  }

  static async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }

  // --- Conversations ---
  static async listConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations/`, {
      headers: this.headers()
    });
    if (!res.ok) return [];
    return res.json();
  }

  static async getConversation(id: string): Promise<{ id: string; title: string; messages: Message[] }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Conversation not found');
    return res.json();
  }

  static async deleteConversation(id: string): Promise<void> {
    await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: this.headers()
    });
  }

  // --- Documents ---
  static async listDocuments(category?: string, search?: string): Promise<DocumentItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/documents/?${params.toString()}`, {
      headers: this.headers()
    });
    if (!res.ok) return [];
    return res.json();
  }

  static async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/documents/categories`, {
      headers: this.headers()
    });
    if (!res.ok) return [];
    return res.json();
  }

  static getDocumentFileUrl(documentId: string): string {
    return `${API_BASE}/documents/${documentId}/file`;
  }

  // --- Chat Stream (SSE) ---
  static streamChat(
    query: string,
    conversationId: string | null,
    category: string | undefined,
    onCitations: (citations: Citation[], convId: string) => void,
    onToken: (token: string) => void,
    onDone: (convId: string) => void,
    onError: (err: Error) => void
  ) {
    const controller = new AbortController();

    fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        query,
        conversation_id: conversationId,
        category: category && category !== 'All' ? category : undefined,
        university_id: 'abes'
      }),
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Stream request failed' }));
          throw new Error(err.detail || 'Failed to stream response');
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No readable stream available');

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.substring(6));
                if (event.type === 'citations') {
                  onCitations(event.data, event.conversation_id);
                } else if (event.type === 'token') {
                  onToken(event.data);
                } else if (event.type === 'done') {
                  onDone(event.conversation_id);
                }
              } catch {
                // Ignore parse errors on chunk boundary
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err);
        }
      });

    return () => controller.abort();
  }

  // --- Admin ---
  static async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/admin/status`, {
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  }

  static async uploadDocument(file: File, category: string, title?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (title) formData.append('title', title);
    formData.append('university_id', 'abes');

    const t = this.getToken();
    const headers: Record<string, string> = {};
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  }

  static async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Failed to delete document');
  }

  static async reindexDocument(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reindex/${id}`, {
      method: 'POST',
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Failed to reindex document');
    return res.json();
  }

  static async syncLocalPolicies(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/sync-local`, {
      method: 'POST',
      headers: this.headers()
    });
    if (!res.ok) throw new Error('Failed to synchronize local policies');
    return res.json();
  }
}
