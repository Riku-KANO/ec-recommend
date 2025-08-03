'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { authApiClient } from '@/lib/auth/api';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      setStep('verify');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApiClient.confirmSignUp(email, verificationCode);
      router.push('/auth/signin?message=アカウントが確認されました。ログインしてください。');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || '確認に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">メール確認</h1>
            <p className="mt-2 text-gray-600">
              {email} に送信された確認コードを入力してください
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="確認コード"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="123456"
                  maxLength={6}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={!verificationCode || isLoading}
                >
                  確認
                </Button>
              </form>
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
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="mt-2 text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 ml-1">
              ログイン
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">アカウント作成</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="email@example.com"
              />

              <Input
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                helperText="8文字以上、大文字・小文字・数字・記号を含む"
              />

              <Input
                label="パスワード（確認）"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />

              <div className="text-sm text-gray-600">
                登録することで、
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  利用規約
                </Link>
                および
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  プライバシーポリシー
                </Link>
                に同意したものとみなされます。
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!email || !password || !confirmPassword || isLoading}
              >
                登録
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}