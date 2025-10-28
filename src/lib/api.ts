const API_BASE = {
  auth: 'https://functions.poehali.dev/fc0c9484-41f9-41d8-81f9-d745467a02d4',
  files: 'https://functions.poehali.dev/7744eb57-850b-4771-a55c-ffaa2f392d95',
};

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FileItem {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  mime_type: string;
  created_at: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken() {
    return this.token;
  }

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE.auth}?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE.auth}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async verifyToken(): Promise<{ authenticated: boolean; user?: User }> {
    if (!this.token) return { authenticated: false };

    const response = await fetch(API_BASE.auth, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.token,
      },
    });

    if (!response.ok) {
      this.clearToken();
      return { authenticated: false };
    }

    return response.json();
  }

  async getFiles(): Promise<FileItem[]> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.files, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch files');
    }

    return response.json();
  }

  async uploadFile(file: File): Promise<FileItem> {
    if (!this.token) throw new Error('Not authenticated');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch(API_BASE.files, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': this.token!,
          },
          body: JSON.stringify({
            filename: file.name,
            content: base64,
            file_type: file.type,
            mime_type: file.type,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          reject(new Error(error.error || 'Failed to upload file'));
        } else {
          resolve(await response.json());
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export const api = new ApiClient();
