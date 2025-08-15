'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { usePreferences } from '@/features/profile/hooks/usePreferences';
import { useAddresses } from '@/features/profile/hooks/useAddresses';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { PreferencesForm } from '@/features/profile/components/PreferencesForm';
import { AddressCard } from '@/features/profile/components/AddressCard';
import { AddressForm } from '@/features/profile/components/AddressForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Address } from '@/features/profile/types';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { user, isLoading: isProfileLoading, updateUser } = useProfile();
  const { preferences, isLoading: isPrefsLoading, updatePreferences } = usePreferences(user?.userId);
  const { addresses, isLoading: isAddressesLoading, createAddress, updateAddress, deleteAddress } = useAddresses(user?.userId);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'addresses'>('profile');
  
  if (!isAuthenticated) {
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
  
  if (isProfileLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('この住所を削除してもよろしいですか？')) {
      await deleteAddress(addressId);
    }
  };
  
  const handleSetDefaultAddress = async (addressId: string) => {
    const address = addresses.find(a => a.addressId === addressId);
    if (address) {
      await updateAddress(addressId, { isDefault: true });
    }
  };
  
  const handleSaveAddress = async (addressData: Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    let success: boolean;
    
    if (editingAddress) {
      success = await updateAddress(editingAddress.addressId, addressData);
    } else {
      success = await createAddress(addressData);
    }
    
    if (success) {
      setShowAddressForm(false);
      setEditingAddress(null);
    }
    
    return success;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">アカウント設定</h1>
          <p className="text-gray-600 mt-2">
            プロフィール情報、通知設定、住所の管理ができます
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    プロフィール
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'preferences'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    通知設定
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'addresses'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    住所管理
                  </button>
                </nav>
              </CardContent>
            </Card>
            
            {/* アカウント概要 */}
            <Card className="mt-6">
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
                    <p className="font-medium">{user.displayName || user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {user.isVerified ? 'アカウント認証済み' : 'アカウント未認証'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileForm
                user={user}
                onSubmit={updateUser}
                isLoading={isProfileLoading}
              />
            )}
            
            {activeTab === 'preferences' && preferences && (
              <PreferencesForm
                preferences={preferences}
                onSubmit={updatePreferences}
                isLoading={isPrefsLoading}
              />
            )}
            
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {showAddressForm || editingAddress ? (
                  <AddressForm
                    address={editingAddress || undefined}
                    onSubmit={handleSaveAddress}
                    onCancel={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    isLoading={isAddressesLoading}
                  />
                ) : (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">登録住所</h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressForm(true)}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          住所を追加
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {addresses.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>登録された住所はありません</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => setShowAddressForm(true)}
                            >
                              最初の住所を追加
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                              <AddressCard
                                key={address.addressId}
                                address={address}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                onSetDefault={handleSetDefaultAddress}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}