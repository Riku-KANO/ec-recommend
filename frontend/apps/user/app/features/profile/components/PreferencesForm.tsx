'use client';

import { useState } from 'react';
import { UserPreferences } from '../types';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Switch } from '@headlessui/react';

interface PreferencesFormProps {
  preferences: UserPreferences;
  onSubmit: (updates: Partial<UserPreferences>) => Promise<boolean>;
  isLoading?: boolean;
}

export function PreferencesForm({ preferences, onSubmit, isLoading }: PreferencesFormProps) {
  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    emailNotifications: preferences.emailNotifications,
    pushNotifications: preferences.pushNotifications,
    newsletterSubscribed: preferences.newsletterSubscribed,
    currency: preferences.currency,
    theme: preferences.theme,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleToggle = (field: keyof UserPreferences, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage('');
  };
  
  const handleChange = (field: keyof UserPreferences, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const success = await onSubmit(formData);
    if (success) {
      setSuccessMessage('設定を更新しました');
    }
    
    setIsSaving(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">通知設定</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">メール通知</h3>
                <p className="text-sm text-gray-600">
                  注文確認や重要なお知らせをメールで受け取る
                </p>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onChange={(value) => handleToggle('emailNotifications', value)}
                className={`${
                  formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">プッシュ通知</h3>
                <p className="text-sm text-gray-600">
                  ブラウザのプッシュ通知を受け取る
                </p>
              </div>
              <Switch
                checked={formData.pushNotifications}
                onChange={(value) => handleToggle('pushNotifications', value)}
                className={`${
                  formData.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    formData.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">ニュースレター</h3>
                <p className="text-sm text-gray-600">
                  お得な情報やキャンペーンのお知らせを受け取る
                </p>
              </div>
              <Switch
                checked={formData.newsletterSubscribed}
                onChange={(value) => handleToggle('newsletterSubscribed', value)}
                className={`${
                  formData.newsletterSubscribed ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    formData.newsletterSubscribed ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-4">表示設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  通貨
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="JPY">日本円 (¥)</option>
                  <option value="USD">米ドル ($)</option>
                  <option value="EUR">ユーロ (€)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  テーマ
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">ライト</option>
                  <option value="dark">ダーク</option>
                  <option value="system">システム設定に従う</option>
                </select>
              </div>
            </div>
          </div>
          
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isSaving || isLoading}
              disabled={isSaving || isLoading}
            >
              設定を保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}