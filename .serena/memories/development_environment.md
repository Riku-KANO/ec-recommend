# 開発環境情報

## 必要ツール
- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Docker**: インフラサービス用
- **Go**: バックエンド開発用

## モノレポ構成
- **Turbo**: ビルドオーケストレーション
- **pnpm workspace**: 依存関係管理
- **パッケージ構成**:
  - `frontend/apps/*` - フロントエンドアプリ
  - `frontend/packages/*` - 共通UIライブラリ
  - `backend/services/*` - マイクロサービス
  - `backend/shared/*` - 共通ライブラリ

## 開発サーバー
- **User App**: localhost:3001
- **Seller App**: localhost:3002（予想）
- **Admin App**: localhost:3003（予想）

## データベース環境
- **PostgreSQL**: Docker Compose
- **Redis**: Docker Compose  
- **OpenSearch**: Docker Compose
- 全て`infrastructure/docker/compose/docker-compose.yml`で管理

## 環境変数
- `.env.example` - テンプレート
- 各アプリ個別の環境変数設定
- AWS認証情報、データベース接続情報等

## Hot Reload
- **フロントエンド**: Next.js Turbopack
- **バックエンド**: 各サービス個別設定

## デバッグ設定
- TypeScript厳密チェック
- ESLint即座エラー表示
- Prettier自動フォーマット（保存時）

## テスト環境
- **E2E**: Playwright + 専用テスト環境
- **Unit**: Jest（React）、Go標準テストライブラリ
- **Integration**: 各サービス個別