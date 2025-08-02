# ECレコメンドシステム アーキテクチャ設計書

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Internet                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │   CloudFront CDN  │
                          └─────────┬─────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │      Application Load         │
                    │        Balancer (ALB)         │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
┌───────┴────────┐        ┌────────┴────────┐        ┌─────────┴────────┐
│  User Frontend │        │ Seller Frontend │        │ Admin Frontend   │
│   (Next.js)    │        │   (Next.js)     │        │   (Next.js)      │
└───────┬────────┘        └────────┬────────┘        └─────────┬────────┘
        │                          │                            │
        └──────────────────────────┴────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │   API Gateway         │
                        └───────────┬───────────┘
                                    │
```

## 2. マイクロサービス構成

### 2.1 サービス一覧

```
API Gateway
    │
    ├─── AWS Cognito
    │     ├─ User Pools (認証)
    │     ├─ WebAuthn/パスキー対応
    │     └─ JWT発行・検証
    │
    ├─── User Service (Go)
    │     └─ ユーザープロファイル管理
    │
    ├─── Product Service (Go)
    │     └─ 商品情報、在庫管理
    │
    ├─── Order Service (Go)
    │     └─ 注文処理、ステータス管理
    │
    ├─── Payment Service (Go)
    │     └─ Stripe連携、決済処理
    │
    ├─── Search Service (Go)
    │     └─ OpenSearch連携、全文検索
    │
    ├─── Recommendation Service (Python)
    │     └─ ML処理、レコメンド生成
    │
    ├─── Analytics Service (Go)
    │     └─ 行動ログ収集、分析
    │
    └─── Notification Service (Go)
          └─ メール、プッシュ通知
```

### 2.2 サービス間通信
- **同期通信**: gRPC
- **非同期通信**: Amazon SQS/SNS
- **サービスメッシュ**: AWS App Mesh（将来検討）

## 3. 認証アーキテクチャ（AWS Cognito）

### 3.1 Cognito User Pools設定
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User App      │────▶│  Cognito User   │────▶│  API Gateway    │
│   (Next.js)     │     │     Pools       │     │  + Lambda Auth  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │
         │   パスキー登録/認証    │   JWT Token            │ 検証済みリクエスト
         └────────────────────────┘                       ▼
                                                    Backend Services
```

### 3.2 Cognito機能活用
- **パスキー認証**: WebAuthn統合
- **ユーザーグループ**: buyer, seller, admin
- **カスタム属性**: ユーザータイプ、業者ID等
- **MFA**: 将来的な拡張用
- **ソーシャルログイン**: Google, Apple（将来実装）

## 4. データベース設計

### 4.1 PostgreSQL（RDS）
- **Products DB**: 商品マスタ、カテゴリ
- **Orders DB**: 注文情報、取引履歴
- **Reviews DB**: レビュー、評価
- **Sellers DB**: 業者情報

### 4.2 DynamoDB
- **User Profiles**: Cognitoと連携したプロファイル
- **Sessions Table**: セッション管理
- **Cart Table**: カート情報（TTL付き）
- **User Preferences**: ユーザー設定、嗜好

### 4.3 OpenSearch
- **Products Index**: 商品検索用インデックス
- **Logs Index**: ログ分析用

### 4.4 Redis（ElastiCache）
- **Cache Layer**: 頻繁アクセスデータ
- **Rate Limiting**: API制限
- **Temp Data**: 一時的なデータ保存

## 5. AWSサービス構成

### 5.1 コンピューティング
- **ECS Fargate**: マイクロサービス実行環境
- **Lambda**: Cognito トリガー、バッチ処理

### 5.2 ストレージ
- **S3**: 商品画像、静的アセット
- **EBS**: アプリケーションデータ

### 5.3 ネットワーク
- **VPC**: プライベートネットワーク
- **ALB**: ロードバランシング
- **API Gateway**: API管理、Cognito連携

### 5.4 セキュリティ
- **Cognito**: 認証・認可
- **WAF**: Webアプリケーションファイアウォール
- **Secrets Manager**: APIキー、DB認証情報
- **IAM**: サービス間アクセス制御

### 5.5 監視・ログ
- **CloudWatch**: メトリクス、ログ
- **X-Ray**: 分散トレーシング
- **CloudTrail**: 監査ログ

## 6. レコメンドシステムアーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ User Behavior   │────▶│ Event Stream    │────▶│ Data Lake (S3)  │
│ Collector       │     │ (Kinesis)       │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ ML Training     │◀────│ Feature Store   │◀────│ ETL Pipeline    │
│ (SageMaker)     │     │ (DynamoDB)      │     │ (Glue)          │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Model Registry  │────▶│ Recommendation  │
│ (S3)            │     │ API (ECS)       │
└─────────────────┘     └─────────────────┘
```

## 7. CI/CDパイプライン

```
Developer ──▶ GitHub ──▶ GitHub Actions
                              │
                              ├─▶ Unit Tests
                              ├─▶ Integration Tests
                              ├─▶ Build Docker Images
                              ├─▶ Push to ECR
                              ├─▶ E2E Tests (Playwright)
                              └─▶ Deploy to ECS
```

### 7.1 環境構成
- **Development**: 開発環境（自動デプロイ）
- **Staging**: ステージング環境（手動承認）
- **Production**: 本番環境（手動承認）

### 7.2 E2Eテスト環境
- **Cognito Test User Pool**: テスト専用
- **Test Data**: シードデータ自動投入
- **Playwright MCP**: テスト自動実行

## 8. セキュリティアーキテクチャ

### 8.1 認証・認可フロー
```
1. ユーザー → Cognito: パスキー認証
2. Cognito → ユーザー: ID Token + Access Token
3. ユーザー → API Gateway: Bearer Token
4. API Gateway → Lambda Authorizer: トークン検証
5. Lambda → Backend: 認可済みリクエスト
```

### 8.2 ネットワークセキュリティ
- **Private Subnet**: DBやバックエンドサービス
- **Public Subnet**: ALB、NAT Gateway
- **Security Groups**: 最小権限の原則

### 8.3 データ保護
- **暗号化**: 保存時（RDS、S3）、転送時（TLS）
- **バックアップ**: 自動バックアップ、ポイントインタイムリカバリ

## 9. スケーラビリティ設計

### 9.1 水平スケーリング
- **Auto Scaling**: ECS Service Auto Scaling
- **Cognito**: 自動スケール（マネージド）
- **Read Replica**: RDS読み取り専用レプリカ
- **Cache Strategy**: Redis多層キャッシュ

### 9.2 性能最適化
- **CDN**: 静的コンテンツ配信
- **Database Sharding**: 将来的な検討
- **Async Processing**: SQSによる非同期処理

## 10. 監視・運用

### 10.1 監視項目
- **Application Metrics**: レスポンスタイム、エラー率
- **Infrastructure Metrics**: CPU、メモリ、ディスク
- **Business Metrics**: 注文数、コンバージョン率
- **Cognito Metrics**: 認証成功/失敗率

### 10.2 アラート設定
- **CloudWatch Alarms**: 閾値ベースアラート
- **SNS**: アラート通知（Email、Slack）

## 11. ディザスタリカバリ

### 11.1 バックアップ戦略
- **RDS**: 自動バックアップ（7日間保持）
- **S3**: バージョニング有効化
- **Cognito**: User Poolsの定期エクスポート
- **Code**: GitHubでのバージョン管理

### 11.2 復旧計画
- **RTO**: 4時間
- **RPO**: 1時間
- **Multi-AZ**: 高可用性構成

## 12. コスト最適化

### 12.1 マネージドサービス活用
- **Cognito**: 認証基盤の運用コスト削減
- **Fargate**: サーバー管理不要
- **RDS**: データベース運用自動化

### 12.2 使用量ベース課金
- **Lambda**: Cognitoトリガーは使用時のみ
- **S3**: ライフサイクルポリシー設定
- **CloudFront**: キャッシュ最適化