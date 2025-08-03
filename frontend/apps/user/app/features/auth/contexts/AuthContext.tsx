'use client';

import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { configureAmplify } from '@/lib/auth/amplify-config';
import { AuthUser, AuthSession } from '@/lib/auth/types';

// 開発モードかどうかをチェック
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

// Amplifyの初期化（認証をスキップしない場合のみ）
if (!skipAuth) {
  configureAmplify();
}

interface AuthContextType extends AuthSession {
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

      const [currentUser, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession(),
      ]);

      if (currentUser && session.tokens) {
        const user: AuthUser = {
          id: currentUser.userId,
          email: currentUser.signInDetails?.loginId || '',
          emailVerified: true,
          attributes: {},
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();

    // 認証をスキップしない場合のみHubリスナーを設定
    if (!skipAuth) {
      const hubListener = Hub.listen('auth', ({ payload }) => {
        switch (payload.event) {
          case 'signedIn':
          case 'signedOut':
          case 'tokenRefresh':
            checkAuth();
            break;
          case 'tokenRefresh_failure':
            console.error('Token refresh failed');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            break;
        }
      });

      return () => hubListener();
    }
  }, []);

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

      await signOut();
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