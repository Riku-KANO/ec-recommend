'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { usePasskey } from '@/features/auth/hooks/usePasskey';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { registerPasskey, isSupported, isLoading, error } = usePasskey();
  const [passkeyName, setPasskeyName] = useState('');
  const [showPasskeyForm, setShowPasskeyForm] = useState(false);

  const handleRegisterPasskey = async () => {
    if (!user) return;

    const success = await registerPasskey(user.id, user.email);
    if (success) {
      setShowPasskeyForm(false);
      setPasskeyName('');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h1>
          <p className="text-gray-600">
            このページを表示するにはログインしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">
            アカウント情報とセキュリティ設定を管理できます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">基本情報</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="メールアドレス"
                  value={user.email}
                  disabled
                  helperText="メールアドレスは変更できません"
                />
                <Input
                  label="表示名"
                  value={user.displayName || ''}
                  placeholder="表示名を入力"
                />
                <div className="flex justify-end">
                  <Button>変更を保存</Button>
                </div>
              </CardContent>
            </Card>

            {/* パスキー設定 */}
            {isSupported && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">パスキー</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasskeyForm(!showPasskeyForm)}
                    >
                      パスキーを追加
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    パスキーを使用することで、パスワードなしで安全にログインできます。
                  </p>

                  {showPasskeyForm && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="font-medium mb-3">新しいパスキーを追加</h3>
                      {error && (
                        <div className="mb-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}
                      <div className="space-y-3">
                        <Input
                          label="パスキー名"
                          value={passkeyName}
                          onChange={(e) => setPasskeyName(e.target.value)}
                          placeholder="例: MacBook Pro、iPhone"
                          helperText="デバイスを識別するための名前"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRegisterPasskey}
                            isLoading={isLoading}
                            disabled={!passkeyName.trim() || isLoading}
                            size="sm"
                          >
                            パスキーを作成
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPasskeyForm(false)}
                          >
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 登録済みパスキー一覧 */}
                  <div className="space-y-2">
                    <h3 className="font-medium">登録済みパスキー</h3>
                    <div className="text-sm text-gray-600">
                      登録済みのパスキーはありません
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アカウント概要 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">アカウント概要</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName || 'ユーザー'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    アカウント認証済み
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* クイックアクション */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">クイックアクション</h2>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  注文履歴を見る
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  お気に入り商品
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  設定を変更
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}