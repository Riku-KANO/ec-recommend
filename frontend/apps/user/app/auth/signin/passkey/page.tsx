'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { usePasskey } from '@/features/auth/hooks/usePasskey';

export default function PasskeySignInPage() {
  const router = useRouter();
  const { authenticateWithPasskey, isSupported, isLoading, error } = usePasskey();
  const { refreshSession } = useAuth();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isSupported) {
      setShowFallback(true);
    }
  }, [isSupported]);

  const handlePasskeySignIn = async () => {
    try {
      const result = await authenticateWithPasskey();
      if (result) {
        // 認証成功後、セッションを更新
        await refreshSession();
        router.push('/');
      }
    } catch (err) {
      console.error('Passkey authentication failed:', err);
    }
  };

  if (!isSupported || showFallback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">パスキー認証</h1>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  パスキーがサポートされていません
                </h3>
                <p className="text-gray-600">
                  お使いのブラウザまたはデバイスはパスキー認証に対応していません。
                </p>
                <div className="pt-4">
                  <Link
                    href="/auth/signin"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    メール・パスワードでログイン
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">パスキーでログイン</h1>
          <p className="mt-2 text-gray-600">
            登録済みのパスキーを使用してログインします
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                パスキーを使用してログイン
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                デバイスに保存されたパスキーでログインできます
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handlePasskeySignIn}
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? ' 認証中...' : 'パスキーでログイン'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">または</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center text-blue-600 hover:text-blue-700 py-2"
                >
                  メール・パスワードでログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center text-gray-600 hover:text-gray-700 py-2"
                >
                  新規アカウント作成
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            パスキーについて詳しく知りたい方は
            <a
              href="https://webauthn.guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 ml-1"
            >
              こちら
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}