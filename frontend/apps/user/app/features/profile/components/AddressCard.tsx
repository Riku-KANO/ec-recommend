'use client';

import { Address } from '../types';
import Button from '@/components/ui/Button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const addressTypeLabel = address.type === 'shipping' ? '配送先' : '請求先';
  
  return (
    <div className={`border rounded-lg p-4 ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{address.recipientName}</h4>
            <span className={`text-xs px-2 py-1 rounded ${
              address.type === 'shipping' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {addressTypeLabel}
            </span>
            {address.isDefault && (
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                デフォルト
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{address.phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="編集"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(address.addressId)}
            className="p-1.5 text-gray-500 hover:text-red-600"
            title="削除"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 space-y-1">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{`${address.city} ${address.state} ${address.postalCode}`}</p>
        <p>{address.country}</p>
      </div>
      
      {!address.isDefault && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.addressId)}
          >
            デフォルトに設定
          </Button>
        </div>
      )}
    </div>
  );
}