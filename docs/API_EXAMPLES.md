# API使用例

## 1. 認証フロー

### 1.1 ユーザー登録
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "phone_number": "+81-90-1234-5678"
}

# Response
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "message": "Registration successful. Please check your email for verification."
}
```

### 1.2 ログイン
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

# Response
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 3600
}
```

## 2. 商品検索・閲覧

### 2.1 商品一覧取得
```bash
GET /api/v1/products?page=1&page_size=20&category_id=electronics&min_price=1000&max_price=50000

# Response
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "ワイヤレスイヤホン",
      "description": "高音質Bluetoothイヤホン",
      "base_price": 15000,
      "sale_price": 12000,
      "currency": "JPY",
      "stock_quantity": 50,
      "images": [
        {
          "url": "https://cdn.example.com/products/earphones-1.jpg",
          "is_primary": true
        }
      ],
      "seller": {
        "id": "seller-123",
        "name": "テックストア"
      }
    }
  ],
  "pagination": {
    "total_items": 150,
    "total_pages": 8,
    "current_page": 1,
    "page_size": 20
  }
}
```

### 2.2 商品詳細取得
```bash
GET /api/v1/products/550e8400-e29b-41d4-a716-446655440001

# Response
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "ワイヤレスイヤホン",
  "description": "高音質Bluetoothイヤホン...",
  "base_price": 15000,
  "sale_price": 12000,
  "currency": "JPY",
  "stock_quantity": 50,
  "variations": [
    {
      "id": "var-001",
      "name": "ブラック",
      "sku": "WE-001-BK",
      "stock_quantity": 30
    },
    {
      "id": "var-002",
      "name": "ホワイト",
      "sku": "WE-001-WH",
      "stock_quantity": 20
    }
  ],
  "images": [...],
  "shipping_info": {
    "free_shipping": true,
    "shipping_methods": ["standard", "express"]
  }
}
```

## 3. カート操作

### 3.1 カートに商品追加
```bash
POST /api/v1/cart/items
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": "550e8400-e29b-41d4-a716-446655440001",
  "product_variation_id": "var-001",
  "quantity": 2
}

# Response
{
  "cart": {
    "items": [
      {
        "product_id": "550e8400-e29b-41d4-a716-446655440001",
        "product_name": "ワイヤレスイヤホン",
        "variation_name": "ブラック",
        "quantity": 2,
        "unit_price": 12000,
        "total_price": 24000
      }
    ],
    "subtotal": 24000,
    "tax": 2400,
    "total": 26400
  }
}
```

## 4. 注文処理

### 4.1 注文作成
```bash
POST /api/v1/orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "shipping_address_id": "addr-001",
  "payment_method": "credit_card",
  "items": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "product_variation_id": "var-001",
      "quantity": 2
    }
  ]
}

# Response
{
  "order": {
    "id": "order-12345",
    "order_number": "ORD-2024-0001",
    "status": "pending",
    "total_amount": 26400,
    "payment_client_secret": "pi_1234567890_secret_abcdef"
  }
}
```

### 4.2 支払い確認（Stripe使用）
```javascript
// Frontend JavaScript
const stripe = Stripe('pk_test_...');
const result = await stripe.confirmPayment({
  clientSecret: 'pi_1234567890_secret_abcdef',
  confirmParams: {
    return_url: 'https://example.com/order/complete',
  },
});
```

## 5. レコメンドAPI

### 5.1 ホームページレコメンド
```bash
GET /api/v1/recommendations/homepage
Authorization: Bearer {access_token} # Optional

# Response
{
  "sections": [
    {
      "title": "あなたへのおすすめ",
      "products": [...]
    },
    {
      "title": "人気の商品",
      "products": [...]
    },
    {
      "title": "最近チェックした商品に基づくおすすめ",
      "products": [...]
    }
  ]
}
```

### 5.2 商品ページレコメンド
```bash
GET /api/v1/recommendations/product/550e8400-e29b-41d4-a716-446655440001

# Response
{
  "related_products": [...],
  "frequently_bought_together": [...],
  "customers_also_viewed": [...]
}
```

## 6. 販売者向けAPI

### 6.1 商品登録
```bash
POST /api/v1/seller/products
Authorization: Bearer {seller_access_token}
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "新商品",
  "description": "商品説明",
  "category_id": "cat-electronics",
  "base_price": 10000,
  "stock_quantity": 100,
  "images": [
    "https://example.com/image1.jpg"
  ],
  "shipping_info": {
    "weight_grams": 500,
    "free_shipping": false,
    "shipping_fee": 500
  }
}
```

### 6.2 注文管理
```bash
GET /api/v1/seller/orders?status=processing
Authorization: Bearer {seller_access_token}

# Response
{
  "orders": [
    {
      "order_id": "order-12345",
      "order_number": "ORD-2024-0001",
      "items": [...],
      "status": "processing",
      "total_amount": 26400,
      "ordered_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 7. エラーレスポンス

### 7.1 認証エラー
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {
      "token_expired_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 7.2 バリデーションエラー
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "phone_number": "Phone number is required"
      }
    }
  }
}
```

### 7.3 在庫不足エラー
```json
{
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "Insufficient stock",
    "details": {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "requested_quantity": 10,
      "available_quantity": 5
    }
  }
}
```