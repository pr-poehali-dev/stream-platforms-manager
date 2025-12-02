const API_BASE = {
  auth: 'https://functions.poehali.dev/fc0c9484-41f9-41d8-81f9-d745467a02d4',
  files: 'https://functions.poehali.dev/7744eb57-850b-4771-a55c-ffaa2f392d95',
  profile: 'https://functions.poehali.dev/851060a1-7583-49be-bcb8-34d613b58cf9',
  userData: 'https://functions.poehali.dev/7bdf2eba-1cb5-4d33-84f1-ccea93a34ef3',
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

export interface UserProfile {
  id: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  wallpaperUrl: string | null;
  theme: 'light' | 'dark' | 'system';
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

  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<FileItem> {
    if (!this.token) throw new Error('Not authenticated');

    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        'mp4': 'video/mp4', 'avi': 'video/x-msvideo', 'mkv': 'video/x-matroska',
        'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv', 'flv': 'video/x-flv',
        'webm': 'video/webm', 'm4v': 'video/x-m4v', 'mpg': 'video/mpeg',
        'mpeg': 'video/mpeg', '3gp': 'video/3gpp', 'ogv': 'video/ogg',
        'ts': 'video/mp2t', 'vob': 'video/dvd',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      };
      if (ext && mimeMap[ext]) mimeType = mimeMap[ext];
    }

    if (onProgress) onProgress(1);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const readProgress = Math.min(Math.round((e.loaded / e.total) * 30), 30);
          onProgress(readProgress);
        }
      };
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          const base64 = result.split(',')[1];
          
          if (onProgress) onProgress(35);
          
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
              const uploadPercent = Math.round(35 + (e.loaded / e.total) * 60);
              onProgress(uploadPercent);
            }
          });
          
          xhr.addEventListener('load', async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              if (onProgress) onProgress(100);
              resolve(JSON.parse(xhr.responseText));
            } else {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || 'Failed to upload file'));
            }
          });
          
          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });
          
          xhr.open('POST', API_BASE.files);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-Auth-Token', this.token!);
          
          xhr.send(JSON.stringify({
            filename: file.name,
            content: base64,
            file_type: mimeType,
            mime_type: mimeType,
          }));
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE.files}?file_id=${fileId}`, {
      method: 'DELETE',
      headers: {
        'X-Auth-Token': this.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete file');
    }
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.profile, {
      method: 'GET',
      headers: {
        'X-Session-Token': this.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    return response.json();
  }

  async updateProfile(updates: Partial<Omit<UserProfile, 'id'>> & { password?: string }): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.profile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': this.token,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.profile, {
      method: 'DELETE',
      headers: {
        'X-Session-Token': this.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }

    this.clearToken();
  }

  async getUserData(): Promise<{ platforms: any[]; games: any[] }> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.userData, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }

    return response.json();
  }

  async saveUserData(platforms: any[], games: any[]): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(API_BASE.userData, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.token,
      },
      body: JSON.stringify({ platforms, games }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save user data');
    }
  }

  async sendContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const response = await fetch('https://functions.poehali.dev/ae169bd9-51f9-4d20-8502-d56df54870d4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
  }
}

export const api = new ApiClient();