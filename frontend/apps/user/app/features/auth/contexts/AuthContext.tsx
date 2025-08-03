'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { authApiClient, AuthResponse } from '@/lib/auth/api';
import { AuthUser, AuthSession } from '@/lib/auth/types';

// 開発モードかどうかをチェック
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

interface AuthContextType extends AuthSession {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = async () => {
    try {
      // 認証をスキップする場合はダミーユーザーを返す
      if (skipAuth && isDevMode) {
        const dummyUser: AuthUser = {
          id: 'dev-user-123',
          email: 'dev@example.com',
          emailVerified: true,
          attributes: {
            name: 'Development User',
            email: 'dev@example.com',
          },
          displayName: 'Development User',
        };

        setAuthState({
          user: dummyUser,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      // ローカルストレージからトークンを取得
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // トークンを検証してユーザー情報を取得
      const userInfo = await authApiClient.getCurrentUser(accessToken);
      
      const user: AuthUser = {
        id: userInfo.id,
        email: userInfo.email,
        emailVerified: userInfo.emailVerified,
        attributes: userInfo.attributes,
        displayName: userInfo.attributes.name || userInfo.email,
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      // トークンが無効な場合はローカルストレージをクリア
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<AuthResponse> => {
    if (skipAuth && isDevMode) {
      const dummyResponse: AuthResponse = {
        accessToken: 'dummy-access-token',
        idToken: 'dummy-id-token',
        refreshToken: 'dummy-refresh-token',
        user: {
          id: 'dev-user-123',
          email: 'dev@example.com',
          emailVerified: true,
          attributes: {},
        },
      };
      await checkAuth();
      return dummyResponse;
    }

    const authResponse = await authApiClient.signIn({ email, password });
    
    // トークンをローカルストレージとCookieに保存
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('idToken', authResponse.idToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    
    // Cookieにも保存（middlewareでアクセス可能）
    document.cookie = `accessToken=${authResponse.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
    
    await checkAuth();
    return authResponse;
  };

  const handleSignUp = async (email: string, password: string, name?: string): Promise<void> => {
    if (skipAuth && isDevMode) {
      return;
    }

    await authApiClient.signUp({ email, password, name });
  };

  const handleSignOut = async () => {
    try {
      // 認証をスキップしている場合は単純にステートをクリア
      if (skipAuth && isDevMode) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // ローカルストレージとCookieからトークンを削除
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      
      // Cookieも削除
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshSession = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}