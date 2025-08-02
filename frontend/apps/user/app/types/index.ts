// Core types for the user application

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  basePrice: Money;
  salePrice?: Money;
  stockQuantity: number;
  status: ProductStatus;
  images: ProductImage[];
  category: Category;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Money {
  amount: number; // 最小単位（円）
  currency: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: Money;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: Money;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Address {
  id: string;
  fullName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  streetAddress: string;
  building?: string;
  phoneNumber: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  cardLast4?: string;
  cardBrand?: string;
  isDefault: boolean;
}

export enum PaymentType {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  COD = 'cod', // Cash on Delivery
}

export interface SearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
}

export enum SortBy {
  RELEVANCE = 'relevance',
  PRICE_LOW_TO_HIGH = 'price_asc',
  PRICE_HIGH_TO_LOW = 'price_desc',
  NEWEST = 'newest',
  POPULARITY = 'popularity',
  RATING = 'rating',
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  facets: SearchFacet[];
}

export interface SearchFacet {
  name: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}
