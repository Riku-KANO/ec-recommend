export interface User {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  language: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletterSubscribed: boolean;
  preferredCategories?: string[];
  currency: string;
  theme: string;
}

export interface Address {
  addressId: string;
  userId: string;
  type: 'billing' | 'shipping';
  isDefault: boolean;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  language?: string;
  country?: string;
}