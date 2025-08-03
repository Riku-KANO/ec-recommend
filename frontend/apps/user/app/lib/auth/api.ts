// Auth API Client for Backend Authentication
export const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    attributes: Record<string, string>;
  };
}

export interface ApiError {
  error: string;
  message: string;
}

class AuthApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AUTH_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'network_error',
          message: `HTTP error! status: ${response.status}`
        }));
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Auth API request failed:', error);
      throw error;
    }
  }

  async signUp(data: SignUpRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/confirm', {
      method: 'POST',
      body: JSON.stringify({
        email,
        confirmationCode,
      }),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async validateToken(token: string): Promise<{ valid: boolean; user: any }> {
    return this.request<{ valid: boolean; user: any }>('/auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCurrentUser(token: string): Promise<{
    id: string;
    email: string;
    emailVerified: boolean;
    attributes: Record<string, string>;
  }> {
    return this.request('/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Passkey API methods
  async passkeyRegisterBegin(userId: string, userName: string): Promise<{ challenge: string }> {
    return this.request<{ challenge: string }>('/auth/passkey/register/begin', {
      method: 'POST',
      body: JSON.stringify({ userId, userName }),
    });
  }

  async passkeyRegisterComplete(userId: string, credential: any): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/passkey/register/complete', {
      method: 'POST',
      body: JSON.stringify({ userId, credential }),
    });
  }

  async passkeyAuthenticateBegin(): Promise<{ challenge: string }> {
    return this.request<{ challenge: string }>('/auth/passkey/authenticate/begin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async passkeyAuthenticateComplete(credential: any): Promise<{
    user: { id: string; email: string };
    tokens: { idToken: string; accessToken: string };
  }> {
    return this.request('/auth/passkey/authenticate/complete', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }
}

export const authApiClient = new AuthApiClient();