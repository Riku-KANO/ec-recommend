# ECレコメンドシステム - プロジェクト概要

## プロジェクト目的
マーケットプレイス型ECサイトの構築（学習・練習用）
- B2C対応
- 初期規模: 100ユーザー程度
- 手数料ベースの収益モデル

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (最新版) + React 19
- **UIライブラリ**: Tailwind CSS
- **アイコン**: Heroicons、Lucide React
- **TypeScript**: 厳密な型チェック

### バックエンド
- **言語**: Go (マイクロサービス)
- **アーキテクチャ**: マイクロサービス
- **API**: RESTful API / gRPC（サービス間通信）
- **認証**: AWS Cognito + WebAuthn（パスキー）

### データベース
- **メインDB**: PostgreSQL（RDS）
- **NoSQL**: DynamoDB
- **検索エンジン**: OpenSearch
- **キャッシュ**: Redis（ElastiCache）

### インフラ
- **クラウド**: AWS
- **コンテナ**: ECS Fargate
- **CDN**: CloudFront
- **ロードバランサー**: ALB

## プロジェクト構造
- `frontend/apps/user` - ユーザー向けアプリ（Next.js）
- `frontend/apps/seller` - 出品業者向け管理画面
- `frontend/apps/admin` - システム管理者向け
- `backend/services/` - マイクロサービス群（Go）
- `backend/shared/` - 共通ライブラリ
- `infrastructure/` - インフラ設定
- `database/` - データベーススキーマ
- `docs/` - プロジェクトドキュメント