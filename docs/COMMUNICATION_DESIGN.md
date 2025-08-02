# マイクロサービス間通信設計書

## 1. 概要

本システムは、マイクロサービスアーキテクチャを採用し、サービス間の通信には以下の方式を使用します：

- **外部API（クライアント向け）**: RESTful API (JSON)
- **内部通信（サービス間）**: gRPC
- **非同期通信**: Amazon SQS/SNS
- **リアルタイム通信**: WebSocket (将来実装)

## 2. 通信アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  (Web Frontend, Mobile App, 3rd Party)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                               │
│               (AWS API Gateway + Lambda)                     │
│  • Rate Limiting  • Authentication  • Request Routing       │
└──────────────────────────┬──────────────────────────────────┘
                           │ gRPC
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Service │          │ Service │          │ Service │
│    A    │◀────────▶│    B    │◀────────▶│    C    │
└─────────┘   gRPC   └─────────┘   gRPC   └─────────┘
    │                      │                      │
    └──────────────────────┼──────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Message    │
                    │   Queue     │
                    │ (SQS/SNS)   │
                    └─────────────┘
```

## 3. API Gateway設計

### 3.1 エンドポイント構成

```yaml
# API Gateway Routes
routes:
  # 認証
  - path: /auth/*
    service: cognito
    methods: [POST]
    
  # ユーザー管理
  - path: /api/v1/users/*
    service: user-service
    methods: [GET, POST, PUT, DELETE]
    auth: required
    
  # 商品管理
  - path: /api/v1/products/*
    service: product-service
    methods: [GET, POST, PUT, DELETE]
    auth: optional
    
  # 注文管理
  - path: /api/v1/orders/*
    service: order-service
    methods: [GET, POST, PUT]
    auth: required
    
  # カート管理
  - path: /api/v1/cart/*
    service: cart-service
    methods: [GET, POST, PUT, DELETE]
    auth: required
    
  # 検索
  - path: /api/v1/search/*
    service: search-service
    methods: [GET]
    auth: optional
    
  # レコメンド
  - path: /api/v1/recommendations/*
    service: recommendation-service
    methods: [GET]
    auth: optional
```

### 3.2 認証・認可

```typescript
// Lambda Authorizer
export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
  sellerId?: string;
  permissions: string[];
}

export async function authorize(token: string): Promise<AuthContext> {
  // Cognito JWTトークンの検証
  const decoded = await verifyCognitoToken(token);
  
  return {
    userId: decoded.sub,
    email: decoded.email,
    roles: decoded['cognito:groups'] || [],
    sellerId: decoded['custom:seller_id'],
    permissions: getPermissions(decoded['cognito:groups'])
  };
}
```

## 4. gRPC サービス定義

### 4.1 共通定義

```protobuf
// common.proto
syntax = "proto3";
package ecommerce.common;

import "google/protobuf/timestamp.proto";

message PageRequest {
  int32 page = 1;
  int32 page_size = 2;
  string sort_by = 3;
  bool descending = 4;
}

message PageResponse {
  int32 total_items = 1;
  int32 total_pages = 2;
  int32 current_page = 3;
  int32 page_size = 4;
}

message Money {
  int64 amount = 1; // 最小単位（円）
  string currency = 2;
}
```

### 4.2 ユーザーサービス

```protobuf
// user_service.proto
syntax = "proto3";
package ecommerce.user;

import "common.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc GetUserProfile(GetUserRequest) returns (UserProfile);
}

message User {
  string id = 1;
  string cognito_user_id = 2;
  string email = 3;
  string phone_number = 4;
  google.protobuf.Timestamp created_at = 5;
}

message UserProfile {
  string user_id = 1;
  string display_name = 2;
  string avatar_url = 3;
  map<string, string> preferences = 4;
}
```

### 4.3 商品サービス

```protobuf
// product_service.proto
syntax = "proto3";
package ecommerce.product;

import "common.proto";

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
  rpc CreateProduct(CreateProductRequest) returns (Product);
  rpc UpdateProduct(UpdateProductRequest) returns (Product);
  rpc UpdateStock(UpdateStockRequest) returns (StockResponse);
}

message Product {
  string id = 1;
  string seller_id = 2;
  string name = 3;
  string description = 4;
  common.Money base_price = 5;
  common.Money sale_price = 6;
  int32 stock_quantity = 7;
  string status = 8;
  repeated ProductImage images = 9;
}

message StockResponse {
  string product_id = 1;
  int32 available_stock = 2;
  int32 reserved_stock = 3;
}
```

### 4.4 注文サービス

```protobuf
// order_service.proto
syntax = "proto3";
package ecommerce.order;

import "common.proto";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc UpdateOrderStatus(UpdateOrderStatusRequest) returns (Order);
  rpc ProcessPayment(ProcessPaymentRequest) returns (PaymentResponse);
}

message Order {
  string id = 1;
  string order_number = 2;
  string user_id = 3;
  repeated OrderItem items = 4;
  common.Money total_amount = 5;
  string status = 6;
  google.protobuf.Timestamp created_at = 7;
}
```

## 5. イベント駆動アーキテクチャ

### 5.1 イベント定義

```typescript
// Event Types
export enum EventType {
  // User Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  
  // Product Events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_OUT_OF_STOCK = 'product.out_of_stock',
  
  // Order Events
  ORDER_CREATED = 'order.created',
  ORDER_PAID = 'order.paid',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',
  
  // Review Events
  REVIEW_CREATED = 'review.created',
  
  // Analytics Events
  USER_ACTIVITY = 'analytics.user_activity',
}

export interface Event<T> {
  id: string;
  type: EventType;
  timestamp: Date;
  source: string;
  data: T;
  metadata?: Record<string, any>;
}
```

### 5.2 SNS/SQS トピック構成

```yaml
# SNS Topics
topics:
  - name: user-events
    subscribers:
      - analytics-service
      - notification-service
      
  - name: order-events
    subscribers:
      - inventory-service
      - notification-service
      - analytics-service
      - seller-service
      
  - name: product-events
    subscribers:
      - search-service
      - recommendation-service
      - cache-invalidation-service

# SQS Queues
queues:
  - name: email-notification-queue
    dlq: email-notification-dlq
    visibility_timeout: 300
    
  - name: order-processing-queue
    dlq: order-processing-dlq
    visibility_timeout: 600
    
  - name: analytics-event-queue
    dlq: analytics-event-dlq
    visibility_timeout: 60
```

## 6. サービスメッシュ設計

### 6.1 サービス間通信ポリシー

```yaml
# Service Mesh Configuration (AWS App Mesh)
mesh:
  name: ec-recommend-mesh
  
virtual_services:
  - name: user-service
    protocol: grpc
    retry_policy:
      max_retries: 3
      retry_on:
        - server-error
        - gateway-error
      retry_timeout: 5s
    timeout: 10s
    
  - name: product-service
    protocol: grpc
    circuit_breaker:
      threshold: 5
      timeout: 30s
    timeout: 5s
```

### 6.2 サーキットブレーカー設定

```go
// Circuit Breaker Implementation
type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    state        State
    failures     int
    lastFailTime time.Time
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    if cb.state == Open {
        if time.Since(cb.lastFailTime) > cb.resetTimeout {
            cb.state = HalfOpen
        } else {
            return ErrCircuitOpen
        }
    }
    
    err := fn()
    if err != nil {
        cb.recordFailure()
        return err
    }
    
    cb.recordSuccess()
    return nil
}
```

## 7. セキュリティ設計

### 7.1 サービス間認証

```yaml
# mTLS Configuration
tls:
  mode: STRICT
  certificates:
    ca: /etc/ssl/ca.crt
    cert: /etc/ssl/service.crt
    key: /etc/ssl/service.key
```

### 7.2 API レート制限

```typescript
// Rate Limiting Configuration
export const rateLimits = {
  anonymous: {
    requests: 100,
    window: '1m',
  },
  authenticated: {
    requests: 1000,
    window: '1m',
  },
  seller: {
    requests: 5000,
    window: '1m',
  },
};
```

## 8. モニタリング・トレーシング

### 8.1 分散トレーシング

```go
// OpenTelemetry Integration
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

func (s *ProductService) GetProduct(ctx context.Context, req *GetProductRequest) (*Product, error) {
    ctx, span := otel.Tracer("product-service").Start(ctx, "GetProduct")
    defer span.End()
    
    span.SetAttributes(
        attribute.String("product.id", req.ProductId),
        attribute.String("user.id", getUserID(ctx)),
    )
    
    // Business logic
    product, err := s.repo.GetProduct(ctx, req.ProductId)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }
    
    return product, nil
}
```

### 8.2 メトリクス収集

```yaml
# Prometheus Metrics
metrics:
  - name: grpc_request_duration_seconds
    type: histogram
    labels: [service, method, status]
    
  - name: http_request_total
    type: counter
    labels: [service, endpoint, method, status]
    
  - name: queue_message_processed_total
    type: counter
    labels: [queue, status]
    
  - name: circuit_breaker_state
    type: gauge
    labels: [service, state]
```

## 9. エラーハンドリング

### 9.1 エラーコード体系

```go
// Error Codes
const (
    // Client Errors (4xx)
    ErrInvalidRequest    = "INVALID_REQUEST"
    ErrUnauthorized      = "UNAUTHORIZED"
    ErrForbidden         = "FORBIDDEN"
    ErrNotFound          = "NOT_FOUND"
    ErrConflict          = "CONFLICT"
    
    // Server Errors (5xx)
    ErrInternal          = "INTERNAL_ERROR"
    ErrServiceUnavailable = "SERVICE_UNAVAILABLE"
    ErrTimeout           = "TIMEOUT"
)

type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details map[string]interface{} `json:"details,omitempty"`
}
```

### 9.2 リトライ戦略

```go
// Retry Configuration
type RetryConfig struct {
    MaxAttempts int
    InitialDelay time.Duration
    MaxDelay time.Duration
    Multiplier float64
}

func WithRetry(config RetryConfig, fn func() error) error {
    delay := config.InitialDelay
    
    for attempt := 0; attempt < config.MaxAttempts; attempt++ {
        err := fn()
        if err == nil {
            return nil
        }
        
        if !isRetryable(err) {
            return err
        }
        
        if attempt < config.MaxAttempts-1 {
            time.Sleep(delay)
            delay = time.Duration(float64(delay) * config.Multiplier)
            if delay > config.MaxDelay {
                delay = config.MaxDelay
            }
        }
    }
    
    return ErrMaxRetriesExceeded
}
```

## 10. パフォーマンス最適化

### 10.1 接続プーリング

```go
// gRPC Connection Pool
type ConnectionPool struct {
    connections []*grpc.ClientConn
    index       uint64
}

func (p *ConnectionPool) GetConnection() *grpc.ClientConn {
    idx := atomic.AddUint64(&p.index, 1)
    return p.connections[idx%uint64(len(p.connections))]
}
```

### 10.2 バッチ処理

```go
// Batch Processing for Efficiency
func (s *ProductService) GetProducts(ctx context.Context, ids []string) ([]*Product, error) {
    // Use DataLoader pattern to batch requests
    return s.loader.LoadMany(ctx, ids)
}
```