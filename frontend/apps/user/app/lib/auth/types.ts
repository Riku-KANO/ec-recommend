export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  attributes?: Record<string, string>;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  credentialId: string;
  createdAt: string;
  lastUsedAt?: string;
  deviceName?: string;
}