'use client';

import { useState } from 'react';
import { User, UpdateUserPayload } from '../types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ProfileFormProps {
  user: User;
  onSubmit: (updates: UpdateUserPayload) => Promise<boolean>;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    displayName: user.displayName || '',
    bio: user.bio || '',
    phoneNumber: user.phoneNumber || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    country: user.country || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (field: keyof UpdateUserPayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    const success = await onSubmit(formData);
    
    if (success) {
      setSuccessMessage('プロフィールを更新しました');
    } else {
      setErrorMessage('更新に失敗しました');
    }
    
    setIsSaving(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">基本情報</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="メールアドレス"
              value={user.email}
              disabled
              helperText="メールアドレスは変更できません"
            />
            <Input
              label="ユーザー名"
              value={user.username}
              disabled
              helperText="ユーザー名は変更できません"
            />
          </div>
          
          <Input
            label="表示名"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            placeholder="表示名を入力"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              自己紹介
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="自己紹介を入力"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="電話番号"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="090-1234-5678"
              type="tel"
            />
            <Input
              label="生年月日"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              type="date"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
                <option value="prefer_not_to_say">回答しない</option>
              </select>
            </div>
            
            <Input
              label="国"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="日本"
            />
          </div>
          
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isSaving || isLoading}
              disabled={isSaving || isLoading}
            >
              変更を保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}