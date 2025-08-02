# アーキテクチャサマリー

## システム構成
- **フロントエンド**: Next.js × 3アプリ（User/Seller/Admin）
- **バックエンド**: Go マイクロサービス
- **認証**: AWS Cognito + WebAuthn（パスキー）
- **API Gateway**: ALB + API Gateway
- **データベース**: PostgreSQL（RDS）+ DynamoDB + Redis + OpenSearch

## マイクロサービス一覧
1. **User Service** - ユーザープロファイル管理
2. **Product Service** - 商品情報、在庫管理  
3. **Order Service** - 注文処理、ステータス管理
4. **Payment Service** - Stripe連携、決済処理
5. **Search Service** - OpenSearch連携、全文検索
6. **Recommendation Service** (Python) - ML処理、レコメンド生成
7. **Analytics Service** - 行動ログ収集、分析
8. **Notification Service** - メール、プッシュ通知

## サービス間通信
- **同期**: gRPC
- **非同期**: Amazon SQS/SNS

## 認証フロー
1. ユーザー → Cognito: パスキー認証
2. Cognito → ユーザー: ID Token + Access Token  
3. ユーザー → API Gateway: Bearer Token
4. API Gateway → Lambda Authorizer: トークン検証
5. Lambda → Backend: 認可済みリクエスト

## データストア役割分担
- **PostgreSQL**: 商品マスタ、注文情報、レビュー、業者情報
- **DynamoDB**: ユーザープロファイル、セッション、カート、設定
- **OpenSearch**: 商品検索インデックス、ログ分析
- **Redis**: キャッシュ、レート制限、一時データ
- **S3**: 商品画像、静的アセット

## 開発フェーズ
- **Phase 1**: 基本機能（認証、商品、カート、決済）
- **Phase 2**: レコメンド機能
- **Phase 3**: AIチャットボット、分析、多言語
- **Phase 4**: パフォーマンス最適化