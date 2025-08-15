'use client';

import { useState } from 'react';
import { Address } from '../types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface AddressFormProps {
  address?: Address;
  onSubmit: (address: Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddressForm({ address, onSubmit, onCancel, isLoading }: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>>({
    type: address?.type || 'shipping',
    isDefault: address?.isDefault || false,
    recipientName: address?.recipientName || '',
    phoneNumber: address?.phoneNumber || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || '日本',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientName || !formData.phoneNumber || !formData.addressLine1 || 
        !formData.city || !formData.state || !formData.postalCode) {
      setErrorMessage('必須項目を入力してください');
      return;
    }
    
    setIsSaving(true);
    const success = await onSubmit(formData);
    
    if (!success) {
      setErrorMessage('住所の保存に失敗しました');
    }
    
    setIsSaving(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {address ? '住所を編集' : '新しい住所を追加'}
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="shipping"
                checked={formData.type === 'shipping'}
                onChange={(e) => handleChange('type', e.target.value)}
                className="mr-2"
              />
              配送先住所
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="billing"
                checked={formData.type === 'billing'}
                onChange={(e) => handleChange('type', e.target.value)}
                className="mr-2"
              />
              請求先住所
            </label>
          </div>
          
          <Input
            label="受取人名 *"
            value={formData.recipientName}
            onChange={(e) => handleChange('recipientName', e.target.value)}
            placeholder="山田 太郎"
            required
          />
          
          <Input
            label="電話番号 *"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="090-1234-5678"
            type="tel"
            required
          />
          
          <Input
            label="住所1 *"
            value={formData.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="東京都渋谷区神宮前1-2-3"
            required
          />
          
          <Input
            label="住所2（建物名・部屋番号）"
            value={formData.addressLine2}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="〇〇マンション 101号室"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="市区町村 *"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="渋谷区"
              required
            />
            
            <Input
              label="都道府県 *"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="東京都"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="郵便番号 *"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="150-0001"
              required
            />
            
            <Input
              label="国 *"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="日本"
              required
            />
          </div>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="mr-2"
            />
            デフォルトの住所として設定
          </label>
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isSaving || isLoading}
              disabled={isSaving || isLoading}
            >
              保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}